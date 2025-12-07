using System.Reflection;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Versioning;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using Serilog;

namespace ProdStarter.Api;

/// <summary>
/// Production-ready Program.cs for ProdStarter.Api
/// - Serilog structured logging
/// - Configuration from environment / appsettings
/// - Health checks
/// - Swagger / OpenAPI with versioning
/// - Graceful shutdown
/// - CORS, API versioning, controllers, JSON options
/// - Basic exception handling & response compression
///
/// Customize services and middleware sections to suit your template's needs.
/// </summary>
public static class Program
{
    public static int Main(string[] args)
    {
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production";

        // Configure Serilog early so we capture host startup logs
        Log.Logger = new LoggerConfiguration()
            .Enrich.FromLogContext()
            .Enrich.WithProperty("Application", "ProdStarter.Api")
            .WriteTo.Console()
            .ReadFrom.Configuration(new ConfigurationBuilder()
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables()
                .Build())
            .CreateLogger();

        try
        {
            Log.Information("Starting ProdStarter.Api in {Environment}", environment);

            var builder = WebApplication.CreateBuilder(new WebApplicationOptions
            {
                Args = args,
                ContentRootPath = AppContext.BaseDirectory,
                EnvironmentName = environment
            });

            // Replace default logger
            builder.Host.UseSerilog();

            // Configuration: JSON + env + command-line
            builder.Configuration
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{environment}.json", optional: true, reloadOnChange: true)
                .AddEnvironmentVariables()
                .AddCommandLine(args);

            // ---- Services ----

            var services = builder.Services;

            // Controllers with JSON options
            services.AddControllers()
                .AddJsonOptions(options =>
                {
                    // Ensure camelCase in JSON by default
                    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
                    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
                });

            // API Versioning
            services.AddApiVersioning(options =>
            {
                options.DefaultApiVersion = new ApiVersion(1, 0);
                options.AssumeDefaultVersionWhenUnspecified = true;
                options.ReportApiVersions = true;
                options.ApiVersionReader = ApiVersionReader.Combine(
                    new UrlSegmentApiVersionReader(),
                    new HeaderApiVersionReader("x-api-version"),
                    new MediaTypeApiVersionReader("x-api-version")
                );
            });

            // Add versioned API explorer to support Swagger per-version
            services.AddVersionedApiExplorer(options =>
            {
                options.GroupNameFormat = "'v'VVV"; // e.g. v1
                options.SubstituteApiVersionInUrl = true;
            });

            // Health checks
            services.AddHealthChecks()
                .AddCheck("self", () => HealthCheckResult.Healthy())
                // TODO: add real checks here: DB, cache, disk, third-party APIs
                ;

            // Response compression
            services.AddResponseCompression();

            // CORS - restrict in production
            services.AddCors(options =>
            {
                options.AddPolicy("DefaultCorsPolicy", policy =>
                {
                    policy
#if DEBUG
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
#else
                        .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>())
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials();
#endif
                });
            });

            // Swagger/OpenAPI
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen(options =>
            {
                // Use assembly info for title/version
                var asm = Assembly.GetExecutingAssembly();
                var info = asm.GetCustomAttribute<AssemblyInformationalVersionAttribute>()?.InformationalVersion ?? asm.GetName().Version?.ToString() ?? "1.0.0";

                options.SwaggerDoc("v1", new OpenApiInfo
                {
                    Title = "ProdStarter.Api",
                    Version = info,
                    Description = "Production-ready Web API template from ProdStarterHub",
                });

                // Include XML comments if available
                var xmlFile = Path.ChangeExtension(asm.Location, ".xml");
                if (File.Exists(xmlFile))
                {
                    options.IncludeXmlComments(xmlFile);
                }

                // Bearer auth placeholder - enable if JWT or OAuth used
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.Http,
                    Scheme = "bearer"
                });

                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // TODO: Register application services, DB contexts, repositories, etc.
            // services.AddDbContext<MyDbContext>(...);
            // services.AddSingleton<IMyService, MyService>();

            var app = builder.Build();

            // ---- Middleware pipeline ----

            // Global exception handling
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                // Use exception handler to avoid leaking details
                app.UseExceptionHandler("/error");
                // Use HSTS in production
                app.UseHsts();
            }

            // Optional: enforce HTTPS
            app.UseHttpsRedirection();

            // Response compression
            app.UseResponseCompression();

            // Serilog request logging
            app.UseSerilogRequestLogging();

            // CORS
            app.UseCors("DefaultCorsPolicy");

            // Routing
            app.UseRouting();

            // Authentication & Authorization placeholders
            // app.UseAuthentication();
            app.UseAuthorization();

            // Health checks endpoints
            app.MapHealthChecks("/healthz", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
            {
                Predicate = _ => true,
                ResponseWriter = async (context, report) =>
                {
                    context.Response.ContentType = "application/json";
                    var result = new
                    {
                        status = report.Status.ToString(),
                        checks = report.Entries.Select(e => new
                        {
                            name = e.Key,
                            status = e.Value.Status.ToString(),
                            description = e.Value.Description
                        })
                    };
                    await System.Text.Json.JsonSerializer.SerializeAsync(context.Response.Body, result);
                }
            });

            // Liveness / readiness - follow k8s conventions
            app.MapGet("/live", () => Results.Ok("Alive"));
            app.MapGet("/ready", () => Results.Ok("Ready"));

            // Swagger - expose only in non-production by default (configurable)
            var enableSwagger = builder.Configuration.GetValue<bool?>("Swagger:Enabled") ?? app.Environment.IsDevelopment();
            if (enableSwagger)
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.RoutePrefix = string.Empty; // Serve UI at app root
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "ProdStarter.Api v1");
                    options.DocExpansion(Swashbuckle.AspNetCore.SwaggerUI.DocExpansion.List);
                });
            }

            // Map controllers
            app.MapControllers();

            // Fallback endpoint for errors
            app.Map("/error", (HttpContext http) =>
            {
                var feature = http.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
                var ex = feature?.Error;

                var dto = new { Message = "An unexpected error occurred." };
                if (app.Environment.IsDevelopment() && ex is not null)
                {
                    // In dev, include the exception message
                    return Results.Problem(detail: ex?.ToString(), title: ex?.Message);
                }

                return Results.Problem(title: dto.Message);
            });

            // Start the web app
            try
            {
                app.Run();
                return 0;
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly");
                return 1;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
        catch (Exception ex)
        {
            Log.Fatal(ex, "Host start-up failed");
            return 1;
        }
    }
}
