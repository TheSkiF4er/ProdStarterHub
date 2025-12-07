# ProdStarter.Api — ASP.NET Core Web API (C#)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-unknown-lightgrey)](https://github.com/TheSkiF4er/ProdStarterHub)
[![Template](https://img.shields.io/badge/template-prod--api-green)](template.json)

> Production-ready ASP.NET Core Web API template. Opinionated defaults for logging, health checks, API versioning, OpenAPI, and containerized deployment. Designed to be a robust starting point for microservices and HTTP APIs.

---

## Contents

* [Quickstart](#quickstart)
* [Highlights & Features](#highlights--features)
* [Project Layout](#project-layout)
* [Configuration](#configuration)
* [Running Locally](#running-locally)
* [Docker & docker-compose](#docker--docker-compose)
* [Health Checks & Observability](#health-checks--observability)
* [Security](#security)
* [Extending the Template](#extending-the-template)
* [Template variables](#template-variables)
* [CI/CD recommendations](#cicd-recommendations)
* [Contributing](#contributing)
* [License](#license)

---

## Quickstart

Using the template locally (copy or use your generator):

```bash
# Clone template (or use prodstarter CLI if available)
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/aspnetcore-webapi-csharp

# Copy template into a new project folder
mkdir ~/projects/myservice && cp -R * ~/projects/myservice/
cd ~/projects/myservice

# Replace namespace/project name (search/replace 'ProdStarter.Api')
# Build and run
dotnet restore
dotnet build
dotnet run --project src/ProdStarter.Api/ProdStarter.Api.csproj
```

Open `https://localhost:5001` or `http://localhost:5000` and check the health endpoints:

* `/healthz` — overall health
* `/live` — liveness
* `/ready` — readiness

Swagger UI is available at `/swagger` in Development by default.

---

## Highlights & Features

* ✅ **Production-focused defaults**: Serilog structured logging, graceful exception handling, HTTPS enforcement.
* ✅ **Health checks** (`/healthz`, `/live`, `/ready`) with pluggable dependency checks.
* ✅ **API Versioning** and versioned Swagger support.
* ✅ **OpenAPI (Swagger)** generation and security scheme scaffold (Bearer/JWT).
* ✅ **Response compression** and JSON options configured (camelCase, case-insensitive).
* ✅ **CORS** policy with safe defaults (dev vs prod configuration).
* ✅ **Template metadata** (template.json) for `dotnet new` or custom CLI integration.
* ✅ **Extensible** DI registration points for DB, cache, background workers, and messaging.

---

## Project Layout

```
src/ProdStarter.Api/               # Main Web API project (Program.cs, Controllers)
src/ProdStarter.Application/       # (optional) Application services and use cases
src/ProdStarter.Domain/            # (optional) Domain models and value objects
src/ProdStarter.Infrastructure/    # (optional) Database, repositories, integrations
src/ProdStarter.Background/        # (optional) Hosted services and workers
tests/                              # Unit & Integration tests
Dockerfile
docker-compose.yml
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json
```

> The shipped template is intentionally compact. For non-trivial projects, split into multiple projects (Application/Domain/Infrastructure) and wire them through interfaces and DI.

---

## Configuration

Configuration sources (priority): `appsettings.json` < `appsettings.{Environment}.json` < Environment Variables < Command-line arguments.

Important configuration keys:

* `ConnectionStrings:DefaultConnection` — main DB connection string (use secrets for production).
* `Cors:Origins` — allowed origins (array of strings) for production.
* `Swagger:Enabled` — set to `true` to enable Swagger in non-development environments.
* `Serilog` section — configure minimum log level and sinks.

Environment variables should use `__` (double underscore) to represent nested sections. Example:

```bash
# Docker / Kubernetes example
env: ConnectionStrings__DefaultConnection=Server=...;Database=...
```

---

## Running Locally

### With dotnet

```bash
dotnet restore
dotnet build
dotnet run --project src/ProdStarter.Api/ProdStarter.Api.csproj
```

### With Docker (development)

```bash
docker build -t myservice:dev .
docker run --rm -e ASPNETCORE_ENVIRONMENT=Development -p 8080:80 myservice:dev
```

### With docker-compose

`docker-compose.yml` (if included) contains example services like Postgres and Redis to run dependencies locally.

---

## Health Checks & Observability

* **Health endpoints:** `/healthz`, `/live`, `/ready` (JSON output with component statuses).
* **Logging:** Serilog configured to log structured events to console (configure additional sinks in `appsettings`).
* **Metrics & Tracing:** Template scaffolds OpenTelemetry if enabled by template flags — configure exporters (OTLP/Jaeger/Prometheus) via configuration.

---

## Security

* Do not commit secrets to the repo. Use environment-level secret stores (K8s Secrets, Vault, Azure Key Vault, AWS Secrets Manager).
* Swagger is disabled in production by default. If enabling in production, protect it with authentication.
* Use JWT/OAuth2 for API authorization. The template includes a security definition in Swagger and placeholders for auth middleware.
* Enable Dependabot or similar SCA tools to track vulnerable dependencies.

---

## Extending the Template

* Add `Application`, `Domain`, `Infrastructure` projects for larger services.
* Implement `DbContext` and repository patterns in `Infrastructure` and register with DI in `Program.cs`.
* Add `IHostedService` background workers in `Background` for queue consumers or scheduled jobs.
* Integrate message brokers (RabbitMQ/Kafka) by implementing adapters behind interfaces.

---

## Template variables

Controlled via `template.json`. Common variables:

* `ProjectName` — project name & root namespace (replaces `ProdStarter.Api`).
* `Author`, `Company`, `License` — metadata for generated project.
* `TargetFramework` — `net7.0` or `net8.0`.
* Flags: `IncludeDocker`, `IncludeKubernetesManifests`, `IncludeEFCore`, `IncludeOpenTelemetry`, `IncludeGithubActions`.

Use example:

```bash
dotnet new prodstarter-api -n MyService.Api --Author "Jane Doe" --Company "Acme" --IncludeDocker true
```

---

## CI/CD recommendations

* Run `dotnet build`, `dotnet test`, `dotnet format` and static analyzers in CI.
* Build images with semantic tagging and push to GHCR / Docker Hub.
* Run smoke tests (health endpoints, basic API calls) against the published image in CI before promoting to staging.
* Use GitOps or pipeline-driven deployments with canary/blue-green strategies for low-risk releases.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository and create a topic branch.
2. Run linters and tests locally.
3. Open a pull request with a clear description and tests for behavior changes.
4. Ensure PRs pass CI checks and include `TASKS.md` reference for release-impacting changes.

See `CONTRIBUTING.md` (if present) for detailed guidelines and `CODEOWNERS` for maintainers.

---

## License

This template and its files are licensed under the [MIT License](LICENSE). Replace or adapt license text in the generated project as required by your organization.

---

## Related docs

* `ARCHITECTURE.md` — high-level design and rationale.
* `TUTORIAL.md` — step-by-step guide to scaffold, run, test, and deploy.
* `TASKS.md` — release checklist and required steps for production readiness.
