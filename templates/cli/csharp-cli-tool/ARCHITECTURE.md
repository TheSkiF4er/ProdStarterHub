# PRODSTARTER.CLI.CSHARP — ARCHITECTURE

> Production-ready architecture document for the `csharp-cli-tool` template. This file describes design choices, component responsibilities, configuration, packaging, observability, security, testing strategy, CI/CD, and an operational runbook for a hardened CLI built on .NET (C#) using the Generic Host pattern.

---

## Table of Contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout
5. Core components & responsibilities
6. Configuration & environment
7. Logging, metrics & tracing
8. Error handling & exit codes
9. Signal handling & graceful shutdown
10. Security considerations
11. Packaging, distribution & releases
12. Testing strategy
13. CI/CD & quality gates
14. Observability & production runbook
15. Extending the template
16. References

---

## 1. Purpose & goals

The `csharp-cli-tool` template provides a modern, production-ready starting point for building native command-line applications in C#/.NET. It combines the familiarity of `System.CommandLine` (subcommands and options) with the robustness of the `Microsoft.Extensions.Hosting` generic host (DI, configuration, logging, hosted services).

Primary goals:

* Provide a testable, maintainable architecture using DI and small components.
* Be safe and observable in production: structured logs, health, metrics/tracing hooks.
* Support short-lived commands and long-running worker modes with a unified host.
* Ship reproducible artifacts and CI/CD workflows for releases.

## 2. Non-functional requirements

* **Portability:** support Linux, macOS, Windows via .NET runtime compatibility.
* **Reliability:** deterministic exit codes, graceful shutdown handling, clear retries for transient failures.
* **Performance:** lightweight startup for short-lived commands; low overhead for background workers.
* **Security:** safe defaults for config/credentials, minimal privileges, and secure logging.
* **Observability:** structured logs, optional metrics/traces, and health signals for worker mode.

## 3. High-level architecture

```
+-----------------+        +----------------+        +------------------+
| User / Scripts  |  --->  | CLI (Host/App) |  --->  | External systems |
|  (invoke)       |        | - Commands     |        | - Databases      |
+-----------------+        | - Services     |        | - Message brokers |
                           | - HostedServices|       | - HTTP services  |
                           +----------------+
                               |    |    |
                               |    |    +--> Logging (Serilog) -> Aggregator
                               |    +------> Metrics/Tracing -> Prometheus/OTel
                               +---------> Config (env, files, args)
```

Two main modes:

* **Command mode (default):** start host, execute single command handler, return exit code.
* **Worker mode:** start host and background hosted services that run until shutdown (useful for queue consumers, schedulers).

## 4. Project layout

```
src/
  └── ProdStarter.Cli/
      ├── Program.cs                # Host bootstrap, commands registration
      ├── AppOptions.cs             # typed configuration properties
      ├── Commands/                 # Command handlers (Run, Version, Worker, etc.)
      ├── Services/                 # Business services and interfaces
      ├── Hosted/                   # Background worker implementations (IHostedService)
      ├── Infra/                    # HTTP clients, DB clients, caching adapters
      ├── Logging/                  # Serilog enrichers, custom sinks
      └── Telemetry/                # OpenTelemetry bootstrap (optional)
tests/
  ├── unit/
  └── integration/
build/
charts/ (optional Helm for worker deployments)
Dockerfile
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json

```

Notes:

* Keep command code thin; delegate business logic to services for testability.
* Use interface-based DI to enable mocking in tests.

## 5. Core components & responsibilities

### Program / Host

* Configure Configuration providers (appsettings.json, environment, command line), logging (Serilog), DI container, and register commands via `System.CommandLine`.
* Start/stop the host, manage lifecycle and graceful shutdown.

### Commands / Handlers

* Each command is represented by a handler class (resolved via DI) that executes the command logic.
* Commands should be small: parse/validate inputs, call services, and translate results to exit codes and user output.

### Services

* Business logic lives in services (e.g., `IMyService`). Keep side-effects isolated and cancellable.

### Hosted Services

* Long-running background tasks implemented as `IHostedService` / `BackgroundService` for worker mode.
* Designed to be idempotent and resilient; expose metrics and health checks where applicable.

### Infra

* Thin adapters for external systems: HTTP clients (typed `HttpClientFactory`), DB clients (EF Core or Dapper), message brokers.
* Apply retry/backoff, timeouts, and circuit-breaker policies (via Polly) at infra boundaries.

### Telemetry & Logging

* Serilog for structured logs; optional sinks configured via appsettings and environment variables.
* Telemetry bootstrap (OpenTelemetry) to instrument outgoing HTTP, DB, and hosted operations (optional feature flag).

## 6. Configuration & environment

Configuration sources (priority high → low):

1. Command-line options and arguments
2. Config file (JSON or key=value) when provided
3. Environment Variables (prefixable, e.g., `PRODSTARTER_`)
4. `appsettings.{Environment}.json`

Recommendations:

* Use typed `IOptions<T>` (`AppOptions`) for strongly-typed configuration and validation.
* Provide an `appsettings.Development.json` with developer defaults; keep secrets out of VCS and use secret stores in production.
* Support `--config` to load additional config files and merge them into `IConfiguration`.

## 7. Logging, metrics & tracing

### Logging

* Use Serilog with structured JSON output in production for aggregator ingestion (e.g., ELK, Loki, Datadog).
* Include correlation IDs and `Application`/`Environment` properties in all logs.
* Allow log level overrides via configuration and `--verbose` flags.

### Metrics

* For worker mode, expose metrics via an HTTP endpoint (e.g., Prometheus scrape) OR emit metrics to a push gateway if running temporarily in ephemeral environments.
* Use `Meter`/`System.Diagnostics.Metrics` or Micrometer-like approach with integration to Prometheus through OpenTelemetry Collector.

### Tracing

* Provide optional OpenTelemetry bootstrap: instrument HTTP, DB calls, and background processing; export via OTLP to a collector.
* Propagate trace context through outgoing HTTP and message payloads.

## 8. Error handling & exit codes

* Use a small, stable set of exit codes and document them in README/TUTORIAL:

  * `0` Success
  * `1` Generic failure
  * `2` Invalid arguments
  * `3` Configuration error
  * `4` Runtime error (e.g., external dependency failures)
  * `130` Interrupted (SIGINT / SIGTERM)

* Commands should catch and translate domain exceptions to user-friendly messages and distinct exit codes.

* Respect `--json` / `--machine-readable` output modes for consuming scripts.

## 9. Signal handling & graceful shutdown

* The Generic Host integrates shutdown signals. Use `IHostApplicationLifetime` and `CancellationToken` from the host to cooperate with cancellation.
* For long-running operations and hosted services:

  * Stop accepting new work on cancellation.
  * Drain in-flight work up to a configurable timeout (via `HostOptions.ShutdownTimeout`).
  * Fail fast if shutdown timeout exceeded and log accordingly.

## 10. Security considerations

* Never log credentials or secrets. Use Serilog's `Destructure` and scrubbers for sensitive payloads when needed.
* Prefer managed secret stores (Azure Key Vault, AWS Secrets Manager, HashiCorp Vault) in production and inject secrets via environment variables or secret mounts.
* Use secure TLS defaults for any outgoing HTTP calls and validate certificates.
* When executing shell commands, avoid string concatenation — use strongly-typed process APIs and argument arrays.
* Restrict permissions of any files the tool writes and document recommended file modes.

## 11. Packaging, distribution & releases

### Build artifacts

* Produce self-contained single-file executables or framework-dependent builds depending on distribution needs.
* Name artifacts using semantic version and runtime RID: `mycli-1.2.3-linux-x64.tar.gz`.

### Docker

* Provide a small Docker image for worker deployments or to run the CLI in CI with a reproducible toolchain (use `mcr.microsoft.com/dotnet/sdk` multi-stage build -> `mcr.microsoft.com/dotnet/runtime` or distroless runtime image).

### Releases

* Publish build artifacts to GitHub Releases or an artifact registry; include checksums and GPG signatures.
* Optionally produce installers/OS packages for Windows (MSI), macOS (PKG/Homebrew), and Linux packages (deb/rpm) if required by users.

## 12. Testing strategy

### Unit tests

* Test command handlers and core services using xUnit / NUnit / MSTest. Mock external dependencies via interfaces and use `Moq` or `NSubstitute`.
* Keep tests fast and deterministic.

### Integration tests

* Run integration tests that spin up necessary infra in CI (testcontainers or ephemeral services) to validate end-to-end behavior.
* For HTTP integrations, use `WebApplicationFactory` patterns where applicable.

### Contract tests

* For external APIs, maintain contract tests (e.g., Pact) for critical integrations.

### End-to-end / smoke tests

* In CI/CD, after building an image, run smoke tests that invoke the binary with core commands and validate exit codes and outputs.

### Static analysis & security

* Run static analysis (Roslyn analyzers) and security scanners (Snyk, Dependabot alerts). Include code style analyzers and enforce in CI.

## 13. CI/CD & quality gates

Recommended pipeline:

1. **PR validation:** restore, build, format check, static analyzers, unit tests.
2. **Build artifact:** create builds for supported runtimes/architectures and run integration tests.
3. **Sanity checks & signing:** run smoke tests, sign artifacts, create release candidate artifacts.
4. **Publish:** push artifacts to Releases or internal registry; optionally publish container images.

Implement reproducible-build practices: pin SDK versions, set deterministic build flags, and archive build logs.

## 14. Observability & production runbook

Before deploying worker instances into production:

* Ensure logs are collected (ELK/Loki/Datadog) and that the `Application`/`Environment` fields are present.
* Ensure metrics are scraped or routed to the metrics backend.
* Ensure tracing (if enabled) has a configured collector and sampling policy.

Runbook (incident starter steps):

1. Reproduce locally with increased verbosity (`--verbose`) and `--dry-run` where supported.
2. Correlate logs with a request/correlation id; inspect traces for spans and errors.
3. Check metrics (error rate, p95 latency, queue backlog) and host health.
4. If needed, stop worker, rollback to previous artifact, and re-run smoke tests.

## 15. Extending the template

Ideas to evolve the template:

* Add built-in credential provider integrations (Azure, AWS, Vault).
* Add feature-flagging support (Unleash/LaunchDarkly) for conditional behaviors.
* Provide a CLI plugin model (discover and load external assemblies) for extensibility.
* Include an SDK layer (a library with services) so CLI logic is reusable as a library in other apps.

## 16. References

* System.CommandLine — [https://github.com/dotnet/command-line-api](https://github.com/dotnet/command-line-api)
* Generic Host (Microsoft.Extensions.Hosting) — [https://docs.microsoft.com/dotnet/core/extensions/generic-host](https://docs.microsoft.com/dotnet/core/extensions/generic-host)
* Serilog — [https://serilog.net/](https://serilog.net/)
* OpenTelemetry .NET — [https://opentelemetry.io/docs/net/](https://opentelemetry.io/docs/net/)
* Microsoft.Extensions.Configuration — [https://docs.microsoft.com/dotnet/core/extensions/configuration](https://docs.microsoft.com/dotnet/core/extensions/configuration)

---

> This ARCHITECTURE.md is opinionated and geared toward maintainability, observability, security, and operational readiness for CLI tools built on .NET. Adjust configuration, telemetry and packaging choices to match your organization’s policies and runtime platforms.
