using System.CommandLine;
using System.CommandLine.Invocation;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog;
using Serilog.Events;
using System.Threading.Tasks;

// ProdStarterHub - C# CLI Tool
// Production-ready Program.cs for a console CLI tool using the Generic Host pattern.
// Features:
//  - System.CommandLine based command parsing (subcommands, options, help)
//  - Microsoft.Extensions.Hosting generic host for DI, logging, configuration
//  - Serilog structured logging to console (and optional sinks)
//  - Graceful shutdown and cancellation support
//  - Typed configuration (IOptions) and environment overrides
//  - Example background worker hook (IHostedService) for long-running tasks
//  - Telemetry/Tracing extension points (OpenTelemetry) commented as TODO
//
// Build/Target: .NET 8.0 (change TargetFramework in csproj if required)

namespace ProdStarter.Cli
{
    public static class Program
    {
        public static async Task<int> Main(string[] args)
        {
            // Build configuration first to allow logging to read settings
            var config = new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: false)
                .AddJsonFile($"appsettings.{Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production"}.json", optional: true)
                .AddEnvironmentVariables(prefix: "PRODSTARTER_") // environment variables prefixed with PRODSTARTER_
                .AddCommandLine(args)
                .Build();

            // Configure Serilog from configuration (appsettings) and environment
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(config)
                .Enrich.WithProperty("Application", config["Application:Name"] ?? "prodstarter-cli")
                .Enrich.WithProperty("Environment", Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT") ?? "Production")
                .WriteTo.Console(outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
                .CreateBootstrapLogger();

            try
            {
                Log.Information("Starting {App}", config["Application:Name"] ?? "prodstarter-cli");

                // Create Host
                var builder = Host.CreateDefaultBuilder(args)
                    .UseSerilog((hostCtx, services, loggerConfiguration) =>
                    {
                        // Reconfigure Serilog using the full host configuration
                        loggerConfiguration
                            .ReadFrom.Configuration(hostCtx.Configuration)
                            .Enrich.FromLogContext()
                            .Enrich.WithProperty("Application", hostCtx.Configuration["Application:Name"] ?? "prodstarter-cli")
                            .Enrich.WithProperty("Environment", hostCtx.HostingEnvironment.EnvironmentName)
                            .WriteTo.Console();

                        // TODO: add additional sinks (File, Seq, Splunk, Datadog) behind feature flags
                    })
                    .ConfigureHostConfiguration(cfg => cfg.AddConfiguration(config))
                    .ConfigureAppConfiguration((hostCtx, cfg) =>
                    {
                        // keep order deterministic
                        cfg.AddConfiguration(config);
                    })
                    .ConfigureServices((hostCtx, services) =>
                    {
                        services.Configure<AppOptions>(hostCtx.Configuration.GetSection("Application"));

                        // Register application services
                        services.AddSingleton<IClock, SystemClock>();
                        services.AddTransient<IMyService, MyService>();

                        // Example background worker — optional, only used when running "worker" subcommand or background mode
                        services.AddHostedService<BackgroundWorker>();

                        // TODO: register DB clients, HTTP clients, caching, and other infra services here

                        // Register command handler to be resolved by System.CommandLine
                        services.AddSingleton<RunCommandHandler>();
                    })
                    .UseConsoleLifetime();

                using var host = builder.Build();

                // Create root command with subcommands using System.CommandLine
                var root = new RootCommand("ProdStarter CLI — production-ready command-line tool")
                {
                    // global options
                    new Option<bool>(new[]{"--verbose","-v"}, description: "Enable verbose logging"),
                    new Option<string>("--config", description: "Path to key=value or JSON config file")
                };

                // Example "run" subcommand
                var runCmd = new Command("run", "Run main processing pipeline")
                {
                    new Option<string>("--input", description: "Input file or resource to process"),
                    new Option<bool>("--dry-run", description: "Do not persist side effects, run in dry-run mode")
                };

                runCmd.Handler = CommandHandler.Create<string, bool, IHost>(async (input, dryRun, hostInstance) =>
                {
                    // Resolve services from DI
                    var svc = hostInstance.Services.GetRequiredService<RunCommandHandler>();
                    var cts = new CancellationTokenSource();

                    // Hook into host cancellation so CTRL+C shuts down gracefully
                    var lifetime = hostInstance.Services.GetService<IHostApplicationLifetime>();
                    if (lifetime != null)
                    {
                        lifetime.ApplicationStopping.Register(() => cts.Cancel());
                    }

                    await svc.HandleAsync(input, dryRun, cts.Token);
                });

                root.AddCommand(runCmd);

                // Example "version" subcommand
                var versionCmd = new Command("version", "Show application version");
                versionCmd.Handler = CommandHandler.Create(() =>
                {
                    Console.WriteLine($"{config["Application:Name"] ?? "prodstarter-cli"} {GetVersion()}");
                });
                root.AddCommand(versionCmd);

                // Example "worker" subcommand to run background-hosted services (if any)
                var workerCmd = new Command("worker", "Run background worker mode (hosted services)");
                workerCmd.Handler = CommandHandler.Create<IHost>(async (hostInstance) =>
                {
                    Log.Information("Starting hosted services (worker mode)");
                    await hostInstance.StartAsync();
                    await hostInstance.WaitForShutdownAsync();
                });
                root.AddCommand(workerCmd);

                // Wire DI resolver to System.CommandLine so handlers can receive IHost etc.
                root.AddMiddleware(async (context, next) =>
                {
                    // if verbose flag set, bump minimum level
                    if (context.ParseResult.GetValueForOption<bool>("--verbose"))
                    {
                        Log.Logger = Log.Logger.ForContext("Verbosity","verbose");
                    }

                    // If --config provided, load it (TODO: merge into host configuration)
                    var cfgPath = context.ParseResult.GetValueForOption<string>("--config");
                    if (!string.IsNullOrEmpty(cfgPath))
                    {
                        // TODO: support reading key=value and JSON config and merge into IConfiguration
                        Log.Information("Loading config from {Path}", cfgPath);
                    }

                    await next(context);
                });

                // Start host but do not start hosted services until needed
                await host.StartAsync();

                // Invoke the command pipeline — pass host so handlers can resolve services
                // Attach host as service to binder
                var invocationResult = await root.InvokeAsync(args, new InvocationContext(root) { BindingContext = new BindingContext() });

                // Wait for host to shut down if any hosted services were started
                await host.StopAsync();

                Log.Information("Shutdown complete");
                return invocationResult;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Application terminated unexpectedly");
                return -1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        private static string GetVersion()
        {
            // TODO: integrate with source-build/versioning pipeline or read from assembly info
            return "1.0.0";
        }
    }

    // ----- Example typed options and services -----
    public class AppOptions
    {
        public string Name { get; set; } = "prodstarter-cli";
        public bool EnableTelemetry { get; set; }
    }

    public interface IClock { DateTime UtcNow { get; } }
    public class SystemClock : IClock { public DateTime UtcNow => DateTime.UtcNow; }

    public interface IMyService
    {
        Task DoWorkAsync(string input, bool dryRun, CancellationToken ct);
    }

    public class MyService : IMyService
    {
        private readonly ILogger<MyService> _logger;
        private readonly IClock _clock;
        public MyService(ILogger<MyService> logger, IClock clock)
        {
            _logger = logger;
            _clock = clock;
        }

        public async Task DoWorkAsync(string input, bool dryRun, CancellationToken ct)
        {
            _logger.LogInformation("Starting work for input={input} at {time}", input ?? "(none)", _clock.UtcNow);
            // TODO: replace with real domain logic. Keep IO cancellable via ct.
            await Task.Delay(TimeSpan.FromSeconds(1), ct);
            if (dryRun)
            {
                _logger.LogInformation("Dry-run completed for {input}", input);
            }
            else
            {
                _logger.LogInformation("Work completed for {input}", input);
            }
        }
    }

    // Example handler that is resolved from DI and called by the command
    public class RunCommandHandler
    {
        private readonly IMyService _service;
        private readonly ILogger<RunCommandHandler> _logger;

        public RunCommandHandler(IMyService service, ILogger<RunCommandHandler> logger)
        {
            _service = service;
            _logger = logger;
        }

        public async Task HandleAsync(string input, bool dryRun, CancellationToken ct)
        {
            _logger.LogInformation("RunCommandHandler invoked (dryRun={dryRun})", dryRun);
            try
            {
                await _service.DoWorkAsync(input, dryRun, ct);
            }
            catch (OperationCanceledException)
            {
                _logger.LogWarning("Operation was cancelled");
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in command");
                throw;
            }
        }
    }

    // Example background worker (hosted service) — optional
    public class BackgroundWorker : BackgroundService
    {
        private readonly ILogger<BackgroundWorker> _logger;
        public BackgroundWorker(ILogger<BackgroundWorker> logger) => _logger = logger;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("BackgroundWorker started");
            while (!stoppingToken.IsCancellationRequested)
            {
                // TODO: implement periodic work or queue consumption
                _logger.LogDebug("BackgroundWorker heartbeat");
                try { await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); } catch (OperationCanceledException) { break; }
            }
            _logger.LogInformation("BackgroundWorker stopping");
        }
    }
}
