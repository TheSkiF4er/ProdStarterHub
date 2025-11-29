using System.Reflection;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------------
// Basic configuration & options
// ------------------------------------------------------------

var env = builder.Environment;

// Example: bind a typed options class from configuration (optional)
// builder.Services.Configure<AppOptions>(builder.Configuration.GetSection("App"));

builder.Services
    .AddEndpointsApiExplorer()
    .AddSwaggerGen(options =>
    {
        options.SwaggerDoc("v1", new()
        {
            Title = "ProdStarterHub ASP.NET Core Web API",
            Version = "v1",
            Description = "Production-ready ASP.NET Core minimal Web API starter."
        });

        // Include XML comments if available
        var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
        if (File.Exists(xmlPath))
        {
            options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
        }
    });

// API Versioning (simple setup – you can extend as needed)
builder.Services
    .AddApiVersioning(options =>
    {
        options.DefaultApiVersion = new ApiVersion(1, 0);
        options.AssumeDefaultVersionWhenUnspecified = true;
        options.ReportApiVersions = true;
    })
    .AddApiExplorer(options =>
    {
        options.GroupNameFormat = "'v'VVV";
        options.SubstituteApiVersionInUrl = true;
    });

// Controllers (if you prefer controller-based APIs)
builder.Services.AddControllers();

// Health checks (add custom checks here)
builder.Services
    .AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("OK"));

// CORS – default policy for typical API scenarios
const string DefaultCorsPolicy = "DefaultCorsPolicy";

builder.Services.AddCors(options =>
{
    options.AddPolicy(DefaultCorsPolicy, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://localhost:3000"
                // TODO: add your front-end origins here
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// TODO: Add database, caching, authentication, etc.
// e.g. builder.Services.AddDbContext<YourDbContext>(...);
//      builder.Services.AddAuthentication(...);
//      builder.Services.AddAuthorization();

// ------------------------------------------------------------
// Build the app
// ------------------------------------------------------------

var app = builder.Build();

// ------------------------------------------------------------
// Global error handling (problem details)
// ------------------------------------------------------------

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionHandler = context.Features.Get<IExceptionHandlerFeature>();
        var problemDetails = new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred.",
            Detail = env.IsDevelopment()
                ? exceptionHandler?.Error.ToString()
                : "See logs for more details.",
            Instance = context.Request.Path
        };

        context.Response.StatusCode = problemDetails.Status ?? StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problemDetails);
    });
});

// ------------------------------------------------------------
// Development helpers
// ------------------------------------------------------------

if (env.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "ProdStarterHub API v1");
        options.DisplayRequestDuration();
    });
}

// ------------------------------------------------------------
// Common middleware
// ------------------------------------------------------------

app.UseHttpsRedirection();

app.UseCors(DefaultCorsPolicy);

app.UseAuthentication();
app.UseAuthorization();

// ------------------------------------------------------------
// Routing
// ------------------------------------------------------------

app.MapControllers();

// Health endpoints
app.MapHealthChecks("/health");
app.MapGet("/health/live", () => Results.Ok("alive")).WithTags("Health");
app.MapGet("/health/ready", () => Results.Ok("ready")).WithTags("Health");

// Minimal “hello” endpoint – safe to keep in production
app.MapGet("/", () => Results.Ok(new
{
    name = "ProdStarterHub ASP.NET Core Web API",
    version = Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "unknown",
    environment = env.EnvironmentName,
    message = "API is up and running."
}))
.WithName("Root")
.Produces(StatusCodes.Status200OK);

// Example minimal endpoint with versioned route
app.MapGroup("/api/v1")
    .WithTags("Example")
    .MapGet("/ping", () => Results.Ok(new { pong = true, at = DateTimeOffset.UtcNow }))
    .WithName("PingV1")
    .Produces(StatusCodes.Status200OK);

// ------------------------------------------------------------
// Run the app
// ------------------------------------------------------------

app.Run();


// ------------------------------------------------------------
// Optional: typed options example (uncomment if you use it)
// ------------------------------------------------------------

// public sealed class AppOptions
// {
//     public const string SectionName = "App";
//     public string ServiceName { get; set; } = "ProdStarterHub.Api";
//     public string? EnvironmentLabel { get; set; }
// }
