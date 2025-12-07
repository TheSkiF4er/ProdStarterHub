# PRODSTARTER.CLI.CSHARP — TUTORIAL

This tutorial walks through creating, building, testing, running, packaging, and releasing a CLI scaffolded from the `csharp-cli-tool` template in **ProdStarterHub**. It focuses on production-ready patterns using the .NET generic host, DI, structured logging, and reproducible builds.

> Audience: .NET engineers, DevOps, SREs and maintainers building native CLI utilities and workers with C#.

---

## Table of contents

1. Prerequisites
2. Scaffold the template and initial setup
3. Project layout overview
4. Build & run locally
5. Configuration & precedence
6. Commands & examples
7. Logging, diagnostics & telemetry
8. Testing strategy
9. Containerization & reproducible builds
10. CI/CD recommendations
11. Packaging & releases
12. Debugging & troubleshooting
13. Production checklist
14. Next steps & extension ideas

---

## 1. Prerequisites

* .NET SDK (pin exact SDK version with `global.json`, e.g. .NET 8). Install from Microsoft.
* `dotnet` CLI and `msbuild` available in PATH.
* Git, Docker (optional) and a code editor (Visual Studio / VS Code / JetBrains Rider).
* For tests: `xUnit` (or your preferred runner) and a mocking library (`Moq` / `NSubstitute`).

## 2. Scaffold the template and initial setup

```bash
# copy the template into a workspace
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/cli/csharp-cli-tool
cp -R . ~/projects/my-csharp-cli
cd ~/projects/my-csharp-cli
```

Replace tokens (project name, company, author) in files or use the template tool that consumes `template.json`.

Initialize git and create a feature branch:

```bash
git init
git checkout -b feature/initial
```

## 3. Project layout overview

```
src/ProdStarter.Cli/                # main project
  ├─ Program.cs                     # host bootstrap and System.CommandLine wiring
  ├─ AppOptions.cs                   # typed configuration classes
  ├─ Commands/                       # command handlers
  ├─ Services/                       # business logic
  ├─ Hosted/                         # BackgroundService implementations
  └─ Infra/                          # HttpClient, DB adapters
tests/                               # unit & integration tests
build/                               # build artifacts
Dockerfile                           # multi-stage reproducible build
.github/workflows/                   # CI templates
README.md
TUTORIAL.md
TASKS.md
ARCHITECTURE.md
template.json
```

Design notes:

* Keep command handlers thin; delegate logic to services.
* Use `IHost` and `IHostApplicationLifetime` for lifecycle management.

## 4. Build & run locally

### Pin SDK

Create `global.json` to pin SDK (example):

```json
{
  "sdk": { "version": "8.0.100" }
}
```

### Restore, build and run

```bash
# restore and build
dotnet restore
dotnet build -c Release

# run command mode (example)
dotnet run --project src/ProdStarter.Cli -- run --input ./data.txt

# publish single-file self-contained binary for linux-x64
dotnet publish -c Release -r linux-x64 --self-contained true -p:PublishSingleFile=true -p:StripSymbols=true -o ./dist/linux-x64
```

Notes:

* Prefer `dotnet publish` in CI with specific runtime identifiers (RIDs) for reproducible artifacts.
* Use `-p:PublishTrimmed=true` carefully and validate behavior.

## 5. Configuration & precedence

Configuration sources (priority high → low):

1. Command-line options
2. Explicit config files passed via `--config`
3. Environment variables (use a prefix like `PRODSTARTER_`)
4. `appsettings.{Environment}.json`

Implementation tips:

* Use `IConfiguration` + `IOptions<T>` for typed settings and validation.
* Expose a `--config` option that merges a key/value or JSON file into `IConfiguration`.
* Keep secrets out of Git; use user secrets for local dev and secret managers (Vault, Azure Key Vault) in production.

## 6. Commands & examples

The template wires `System.CommandLine`. Example commands included:

* `run` — run the primary processing pipeline.
* `worker` — start hosted services (queue consumers, schedulers).
* `version` — print version.

Examples:

```bash
# run processing against input file
./mycli run --input ./payload.json --dry-run

# run worker mode (long-lived)
./mycli worker

# verbose output
./mycli --verbose run --input ./x

# machine-readable JSON output
./mycli run --input x --json
```

Handlers should:

* Validate inputs and return distinct exit codes.
* Be cancellable via `CancellationToken` provided by `IHost`.
* Support `--dry-run` and `--json` for automation.

## 7. Logging, diagnostics & telemetry

### Logging

* Use Serilog (bootstrapped in `Program.cs`) with console sink in dev and JSON output in production.
* Include `Application`, `Environment`, and request/correlation IDs in logs.
* Allow runtime override via `--verbose`.

### Metrics & Tracing

* Expose telemetry only when needed. For worker mode, run an HTTP metrics endpoint (Prometheus) or push metrics to a backend.
* Provide optional OpenTelemetry bootstrap with environment-controlled exporter (OTLP/Jaeger).

## 8. Testing strategy

### Unit tests

* Use `xUnit` + `Moq` for unit tests. Mock `IMyService`, `IClock`, `IHostEnvironment` where appropriate.
* Keep commands and services small; test side-effects and return values.

### Integration tests

* Use ephemeral resources (Testcontainers) or in-memory servers to test interactions (HTTP, DB).
* Run integration tests in CI matrix only on main or nightly to save resources.

### End-to-end / Smoke tests

* Create a smoke job that publishes a build artifact, runs it in a disposable environment, and asserts core endpoints and commands.

### Static analysis

* Enable analyzers and `dotnet format` in CI. Fail on critical analyzer issues.

## 9. Containerization & reproducible builds

Use a multi-stage Dockerfile:

* Build stage: use the SDK image to restore, build, and publish.
* Runtime stage: use `mcr.microsoft.com/dotnet/runtime` or distroless image to run the published artifact.

Example (high-level):

```Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . ./
RUN dotnet publish src/ProdStarter.Cli -c Release -r linux-x64 --self-contained true -p:PublishSingleFile=true -o /app/publish

FROM mcr.microsoft.com/dotnet/runtime-deps:8.0
COPY --from=build /app/publish /app
ENTRYPOINT ["/app/mycli"]
```

Notes:

* Build inside Docker in CI for reproducibility.
* Sign and checksum artifacts produced by `dotnet publish`.

## 10. CI/CD recommendations

Suggested pipeline stages (GitHub Actions example):

1. **PR checks**: `dotnet restore`, `dotnet build`, `dotnet format` (check), analyzers, unit tests.
2. **Release build**: `dotnet publish` for target RIDs, run integration/smoke tests, create artifacts.
3. **Scan & sign**: run SCA, run Trivy against images, sign artifacts, upload to GitHub Releases or registry.
4. **Deploy/Promote**: publish artifacts to production channels (package manager, registry) or trigger rollout.

Security:

* Keep secrets in GitHub Secrets/CI secret store.
* Use ephemeral credentials for integration tests; rotate regularly.

## 11. Packaging & releases

Artifact strategies:

* **Self-contained single file**: small portable binary for Linux/macOS/Windows. Pros: no runtime dependency. Cons: larger size.
* **Framework-dependent**: smaller but requires target machine to have matching runtime.

Release process:

1. Bump version and update changelog.
2. Build artifacts for target RIDs in CI.
3. Generate SHA256 checksums and GPG signatures.
4. Publish to GitHub Releases and optionally package registries.

Document which artifact to use per platform in README.

## 12. Debugging & troubleshooting

* Re-run with `--verbose` to get more logs.
* Use `dotnet-trace`, `dotnet-counters`, and `dotnet-dump` for deep diagnostics on running processes.
* For transient external failures, enable Polly retries and detailed logging of HTTP failures.
* Capture full host logs and correlation IDs, and inspect traces if OTEL is enabled.

## 13. Production checklist

Before releasing to production or running worker clusters, ensure:

* Secrets provisioned and not in repo.
* CI green: unit, integration, analyzers, and signing.
* Artifacts built for target RIDs and checksums published.
* Observability: logging pipeline and metrics configured.
* Runbook and rollback plan documented.

## 14. Next steps & extension ideas

* Add auto-update/installers for users (Homebrew, Scoop, MSI).
* Integrate OpenTelemetry end-to-end with sampling rules and a collector.
* Provide shell completions for `bash`/`zsh`/`powershell` via `System.CommandLine`.
* Add an SDK project to reuse command logic programmatically in other apps.
