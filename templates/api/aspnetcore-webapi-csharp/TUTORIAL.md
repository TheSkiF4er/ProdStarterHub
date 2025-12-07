# PRODSTARTER.API — TUTORIAL

This tutorial walks you through creating, running, testing, and deploying a new service from the `aspnetcore-webapi-csharp` template in **ProdStarterHub**. It’s geared toward engineers preparing the service for production with best practices included.

> Estimated audience: backend engineers, DevOps engineers, and technical leads.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Scaffold a project from the template](#scaffold-a-project-from-the-template)
3. [Project layout & key files](#project-layout--key-files)
4. [Local development (dotnet run)](#local-development-dotnet-run)
5. [Run with Docker and docker-compose](#run-with-docker-and-docker-compose)
6. [Configuration and environment variables](#configuration-and-environment-variables)
7. [Health checks, readiness & liveness](#health-checks-readiness--liveness)
8. [API documentation (Swagger)](#api-documentation-swagger)
9. [Database & EF Core migrations](#database--ef-core-migrations)
10. [Testing (unit & integration)](#testing-unit--integration)
11. [CI/CD basics (recommended GitHub Actions)](#cicd-basics-recommended-github-actions)
12. [Container registry & release tagging](#container-registry--release-tagging)
13. [Kubernetes deployment (recommended)](#kubernetes-deployment-recommended)
14. [Observability and monitoring](#observability-and-monitoring)
15. [Security checklist](#security-checklist)
16. [Troubleshooting & FAQ](#troubleshooting--faq)
17. [Next steps & extending the template](#next-steps--extending-the-template)

---

## Prerequisites

* .NET SDK 7.x or later (`dotnet --version`)
* Docker and docker-compose (for containerized runs)
* Git
* An option for a SQL database (Postgres recommended) for persistence
* Optional: Kubernetes (minikube / kind) for local cluster testing

## Scaffold a project from the template

> If ProdStarterHub is integrated with a CLI or marketplace, use that. Otherwise clone and use the included template folder.

1. Clone the repository or copy the template folder:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/aspnetcore-webapi-csharp
```

2. Create a new solution from the template (example using copy):

```bash
# Create a new folder for your service
mkdir ~/projects/my-service && cd ~/projects/my-service
# Copy template contents
cp -R /path/to/ProdStarterHub/templates/api/aspnetcore-webapi-csharp/src/ProdStarter.Api/* .
# Replace namespaces where appropriate (search/replace ProdStarter.Api -> MyCompany.MyService.Api)
```

3. Initialize Git and the solution:

```bash
git init
dotnet new sln -n MyService
dotnet new webapi -n MyService.Api # optional: or reuse copied project
dotnet sln add MyService.Api/MyService.Api.csproj
```

> Tip: When you integrate this as a project template for `prodstarter` CLI, add template variables for `ProjectName`, `Namespace`, `Author`, and `License` for automated replacement.

## Project layout & key files

Key files you will work with:

* `Program.cs` — application startup, DI registration, middleware, health checks, Swagger.
* `appsettings.json` and `appsettings.Development.json` — configuration templates.
* `Controllers/` — example API endpoints.
* `Domain/`, `Application/`, `Infrastructure/` — recommended project layering (may be split into separate projects for larger code bases).
* `Dockerfile`, `docker-compose.yml` — containerization and local service composition.
* `ARCHITECTURE.md`, `TASKS.md`, `TUTORIAL.md` — docs for maintainers.

## Local development (dotnet run)

1. Install dependencies and build:

```bash
dotnet restore
dotnet build
```

2. Run the application:

```bash
dotnet run --project src/ProdStarter.Api/ProdStarter.Api.csproj
```

3. The app listens on the configured ports (see `appsettings.Development.json` or `launchSettings.json`). Open [http://localhost:5000](http://localhost:5000) (or [https://localhost:5001](https://localhost:5001)) and check:

* `/swagger` (if enabled in development)
* `/healthz`, `/live`, `/ready`

## Run with Docker and docker-compose

### Dockerfile (multi-stage)

The template includes a multi-stage Dockerfile. Build the image locally:

```bash
docker build -t myservice:dev .
```

Run with docker (example):

```bash
docker run --rm -e ASPNETCORE_ENVIRONMENT=Development -p 8080:80 myservice:dev
```

### docker-compose (development)

A sample `docker-compose.yml` may include Postgres and Redis. Start everything:

```bash
docker-compose up --build
```

Access the API at `http://localhost:8080`.

## Configuration and environment variables

* Config precedence: `appsettings.json` < `appsettings.{Environment}.json` < environment variables < command line args.
* Recommended env vars:

  * `ASPNETCORE_ENVIRONMENT` (Development/Production)
  * `ConnectionStrings__DefaultConnection` (EF Core connection)
  * `Cors__Origins` (JSON array of allowed origins)
  * `Swagger__Enabled` (bool)
  * `Serilog__MinimumLevel__Default` (e.g., Information)

> Use `__` (double underscore) to represent `:` in environment variables on Docker/Kubernetes.

## Health checks, readiness & liveness

* Endpoints:

  * `/healthz` — overall health with dependency checks
  * `/live` — liveness (is the process alive)
  * `/ready` — readiness (able to accept traffic)

* Include dependency health checks (DB, Redis) with meaningful messages.

## API documentation (Swagger)

* Swagger is configured in `Program.cs` and enabled in Development by default.
* To enable Swagger in Production (not recommended publicly), set `Swagger:Enabled=true` via environment variable.
* Generate client SDKs from the OpenAPI spec at `/swagger/v1/swagger.json` using tools like `nswag` or `openapi-generator`.

## Database & EF Core migrations

1. Add EF Core packages and configure `DbContext` in `Program.cs`.
2. Create migrations locally:

```bash
dotnet ef migrations add InitialCreate -p src/ProdStarter.Infrastructure/ -s src/ProdStarter.Api/
```

3. Run migrations locally against Postgres (example):

```bash
dotnet ef database update -p src/ProdStarter.Infrastructure/ -s src/ProdStarter.Api/
```

### CI/CD migration strategy

* **Preferred:** run migrations as a controlled job in CI/CD (pre-deploy) or an init job in Kubernetes before new pods receive traffic.
* **Caution:** avoid destructive or long-running automatic migrations during rolling updates unless you control downtime windows.

## Testing (unit & integration)

* Run unit tests:

```bash
dotnet test tests/ProdStarter.Unit
```

* Integration tests should run against ephemeral dependencies (Testcontainers) or a test database created in CI.

* Health checks and a small smoke test should be part of CI to validate the built image.

## CI/CD basics (recommended GitHub Actions)

A recommended pipeline includes:

1. `on: [push, pull_request]`
2. Steps: checkout, setup-dotnet, restore, build, test, lint, build docker image, push image (on push to main), run security scans.
3. Release workflow: semantic-release or manual tagging triggers image tagging and optional Helm chart release.

Example action steps (high-level):

```yaml
- name: Setup .NET
  uses: actions/setup-dotnet@v3
  with:
    dotnet-version: '7.x'
- name: Build
  run: dotnet build --configuration Release --no-restore
- name: Test
  run: dotnet test --no-build --verbosity normal
- name: Build & Push Docker
  uses: docker/build-push-action@v3
  with:
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
```

## Container registry & release tagging

* Push images to a trusted registry (GHCR, Docker Hub, or private registry).
* Use tags:

  * `sha-<commit>` for CI artifacts
  * `canary` for pre-release
  * semantic tags `v1.2.3` for stable releases

## Kubernetes deployment (recommended)

1. Create K8s manifests or Helm chart including:

   * Deployment with resource requests & limits
   * Service (ClusterIP / LoadBalancer)
   * Ingress (TLS) or API Gateway integration
   * HPA configured on CPU or custom metrics
   * Readiness and liveness probes against `/ready` and `/live`

2. Migrations: run a Job before applying the new Deployment or as a pre-deploy pipeline step.

3. Secrets: store DB credentials in `Secret` and mount as env vars.

4. Example rollout strategy: Canary or Blue/Green using label selectors and weighted routing.

## Observability and monitoring

* **Logging:** Serilog JSON sink to stdout for collection by the logging stack (ELK / Loki / Datadog).
* **Metrics:** expose Prometheus metrics and scrape only from internal endpoints.
* **Tracing:** enable OpenTelemetry and export traces to an OTLP collector.
* **Dashboards & Alerts:** create dashboards for error rate, p95 latency, request rate, and health-check rates. Configure alerts for degraded health checks and sustained error rates.

## Security checklist

* Ensure no secrets in VCS (scan with `git-secrets` / `truffleHog`).
* Enable Dependabot for dependency vulnerability scanning.
* Require code reviews and CI green checks before merging.
* Enforce branch protection rules for `main`/`release` branches.
* Use a minimum-permission service account for automated deployments.

## Troubleshooting & FAQ

**Q:** The app returns 500 on startup in production but works locally.
**A:** Check environment-specific configs, missing environment variables, and that dependent services (DB) are reachable. Inspect container logs.

**Q:** Swagger not available in production.
**A:** By default Swagger is disabled in production. Enable via `Swagger:Enabled=true` if you require it (protect with authentication).

**Q:** EF migrations fail in CI.
**A:** Ensure the connection string points to a reachable test DB and that the EF tools are present in the build environment.

**Q:** High latency in some endpoints.
**A:** Add tracing, check database query plans, and profile the service under load.

## Next steps & extending the template

* Add application-level scaffolding: `Application` and `Domain` projects, add repository interfaces and concrete implementations in `Infrastructure`.
* Implement authentication (OIDC) integration for your environment.
* Add sample background worker consuming messages from a queue system.
* Provide sample Helm chart and GitOps example for automated deployments.

---

### Final tips

* Keep the service stateless and externalize stateful dependencies.
* Keep controllers thin and push business rules into application/domain layers.
* Automate as much as possible (tests, scans, CI checks) so the template remains trustworthy and easy to use.
