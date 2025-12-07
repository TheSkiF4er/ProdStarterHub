# PRODSTARTER.API — ARCHITECTURE

> Production-ready architecture document for the `aspnetcore-webapi-csharp` template. This file describes the design decisions, component interactions, non-functional requirements, deployment guidance, observability, security considerations, and recommended development workflow.

---

## Table of Contents

1. [Purpose & Goals](#purpose--goals)
2. [Non-functional requirements](#non-functional-requirements)
3. [High-level architecture](#high-level-architecture)
4. [Project structure](#project-structure)
5. [Core components & responsibilities](#core-components--responsibilities)
6. [Data persistence & migrations](#data-persistence--migrations)
7. [Inter-service communication & integration patterns](#inter-service-communication--integration-patterns)
8. [Security](#security)
9. [Observability & telemetry](#observability--telemetry)
10. [Operational concerns & deployment](#operational-concerns--deployment)
11. [Testing strategy](#testing-strategy)
12. [CI/CD & release process](#cicd--release-process)
13. [Runbook & production checklist](#runbook--production-checklist)
14. [Extending the template](#extending-the-template)
15. [References & resources](#references--resources)

---

## Purpose & Goals

This template is a production-ready ASP.NET Core Web API starter that provides a solid, opinionated baseline for building scalable, secure, and maintainable microservices and APIs. Goals:

* Minimal, well-documented baseline that follows modern .NET best practices.
* Ready for containerized deployment and orchestration (Docker + Kubernetes).
* Observability, health checks, and graceful shutdown baked in.
* Clear extension points for persistence, background jobs, messaging, authentication, and third-party integrations.

## Non-functional requirements

* **Reliability:** support graceful shutdowns, liveness/readiness checks, and retries for transient failures.
* **Scalability:** horizontally scalable with stateless application instances and externalized state (DB, cache, object storage).
* **Security:** follow least-privilege, centralize secrets management, validate inputs, and protect endpoints with standardized auth.
* **Observability:** structured logs, metrics, and distributed tracing.
* **Maintainability:** modular codebase, DI-driven architecture, clear separation of concerns, and automated tests.

## High-level architecture

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ External     │ <--> │ API Gateway  │ <--> │ ProdStarter  │
│ Clients      │      │ (optional)   │      │ .Api        │
└──────────────┘      └──────────────┘      └──────────────┘
                                              │  ▲   ▲   ▲
                                              │  │   │   │
                     ┌────────────────────────┘  │   │   └─> BackgroundWorkers (IHostedService)
                     │                           │   └──> Cache (Redis)
                     │                           └─────> Database (Postgres / SQL Server)
                     └────────────────────────────────> Message Broker (RabbitMQ/Kafka)
```

* The template is **stateless** (no local session or disk dependency) so it can be scaled horizontally.
* Persisted state: relational DB (EF Core), optional cache layer (Redis), optional object storage (S3-compatible).
* Background processing: `IHostedService` implementations for scheduled or long-running jobs.
* Integrations through explicit adapters (HTTP clients, message producers/consumers) with resiliency (policies).

## Project structure

Opinionated layout (single assembly by default — split into projects when service grows):

```
src/ProdStarter.Api/               # Web API entrypoint (Program.cs, controllers)
src/ProdStarter.Application/       # Application services, use cases, DTOs
src/ProdStarter.Domain/            # Domain entities, value objects, domain interfaces
src/ProdStarter.Infrastructure/    # EF Core, repositories, external integrations
src/ProdStarter.Background/        # Hosted services, workers
tests/ProdStarter.Api.Tests/       # Integration tests
tests/ProdStarter.Unit/            # Unit tests for services/domain

README.md
ARCHITECTURE.md
TUTORIAL.md
Dockerfile
docker-compose.yml

```

> The template ships a compact `src/ProdStarter.Api` project for small services. For larger systems, split into the layers above and wire them through DI and well-defined interfaces.

## Core components & responsibilities

### 1. Program & Startup

* Boots the app, configures Serilog, loads configuration (appsettings + env + CLI), registers services, and composes middleware pipeline.
* Exposes health endpoints (`/healthz`, `/live`, `/ready`) and a minimal `error` handler.

### 2. Controllers (API layer)

* Responsible for HTTP contract: validation of inputs, mapping to application-level DTOs, returning appropriate HTTP status codes.
* Keep controllers thin — orchestrate application services rather than hosting business logic.

### 3. Application Services (use cases)

* Host transactional business workflows, coordinate repositories and domain logic, return DTOs for API.
* Depend on domain interfaces (inversion) — not on EF Core or external transports directly.

### 4. Domain

* Entities, value objects, domain events, and domain-specific invariants.
* Enforces business rules; should be easily testable without framework dependencies.

### 5. Infrastructure

* EF Core DbContext, repository implementations, external HTTP client adapters, cache clients (Redis), and message brokers.
* Register concrete services behind abstractions and keep implementation details isolated.

### 6. Background Workers

* Implement `IHostedService` or `BackgroundService` for scheduled tasks, queue consumers, and long-running processes.
* Ensure idempotency and at-least-once semantics where necessary.

## Data persistence & migrations

* **EF Core** is the default persistence option. Keep migration scripts under source control and apply them from CI/CD or at startup with care.
* Recommended approach:

  * Maintain migrations in the infrastructure project.
  * Use versioned migration runs in CI: `dotnet ef migrations add` only during feature development; `dotnet ef database update` during deploy by CI/CD.
  * Prefer rolling migration strategies in Kubernetes (e.g., pre-deploy migration job with safe windows).
* Connection strings and secrets must **never** be checked into the repo; use Secrets Manager, Vault, or platform secrets (K8s Secrets, Azure Key Vault).

## Inter-service communication & integration patterns

* **Synchronous:** HTTP with typed clients (`IHttpClientFactory`) + retry/circuit-breaker policies (Polly).
* **Asynchronous:** Message broker (RabbitMQ, Kafka) for decoupling and high throughput; use explicit producer/consumer adapters.
* **Event-driven:** publish domain events from application layer; consumers should be idempotent and resilient.
* **Retries & Dead-lettering:** implement retries for transient errors and a dead-letter strategy for poisoned messages.

## Security

Security is a cross-cutting concern. Key recommendations:

* **Authentication:** JWT Bearer or OAuth2/OpenID Connect. Use the Authorization middleware and decorate controllers/actions with `[Authorize]`.
* **Authorization:** centralized policies and role/claim-based checks. Keep authorization logic out of controllers (use policies or application-service checks).
* **Secrets management:** store secrets in a secrets store (e.g., Azure Key Vault, AWS Secrets Manager, HashiCorp Vault, or Kubernetes Secrets). Never store secrets in `appsettings.*.json` committed to VCS.
* **Input validation:** use model validation attributes and FluentValidation for complex rules.
* **Transport:** enforce HTTPS. HSTS in production.
* **Dependency scanning:** enable Dependabot or SCA tool to detect vulnerable dependencies.
* **Rate limiting & throttling:** apply API Gateway-level rate limiting. For in-app throttling, use middleware patterns.
* **CORS:** restrict origins in production via configuration.

## Observability & telemetry

* **Logging:** structured logging via Serilog (JSON in production). Include correlation IDs and useful properties: `Application`, `Environment`, `RequestId`, `UserId`.
* **Metrics:** expose Prometheus-compatible metrics (via `prometheus-net` or `OpenTelemetry.Metrics`) and ensure `/metrics` endpoint is protected or available to internal monitoring only.
* **Tracing:** OpenTelemetry for distributed tracing (export to Jaeger / Zipkin / OTLP collector). Propagate context across HTTP and messaging boundaries.
* **Health checks:** readiness and liveness endpoints; implement dependency-specific checks (DB connectivity, cache, external APIs).
* **Alerting:** create alerts for failed health checks, elevated error rates, high latency, and resource exhaustion.

## Operational concerns & deployment

### Containerization

* Provide a multi-stage `Dockerfile` producing small runtime images (use SDK for build stage, runtime image for final stage).
* Use environment variables for runtime configuration. Prefer 12-factor app principles.

### Kubernetes

* Deploy as a Deployment + Service, with a HorizontalPodAutoscaler based on CPU/RAM or custom metrics.
* Provide readiness/liveness probes (`/ready`, `/live`) and resource requests/limits.
* Run DB migrations as a pre-deploy Job (or via CI) rather than automatic migrations on startup unless safe for your environment.

### Secrets & Config

* Use platform-native secrets and mount them as environment variables or files.
* Keep configuration immutable; use ConfigMaps for non-secret config in K8s.

### Backups & DR

* Databases and object storage must have regular backups and tested recovery procedures.
* Run chaos or failure injection tests in staging to validate resilience.

## Testing strategy

* **Unit tests:** domain logic and application services. Fast and numerous.
* **Integration tests:** test controllers, EF Core with an in-memory or ephemeral DB (e.g., Testcontainers for Postgres). Include health check verification.
* **Contract tests:** for public APIs and consumer expectations.
* **E2E tests:** run against a test environment / staging cluster.
* **Load tests:** benchmark critical endpoints and model scaling needs.

## CI/CD & release process

* **CI:** run static analysis (linters), unit tests, integration tests (as feasible in pipeline), build artifact (container image), and run security scans.
* **CD:** push images to a registry and deploy via GitOps or pipeline jobs. Use blue/green or canary strategies for low-risk releases.
* **Versioning:** semantic versioning for the service; provide API versioning for breaking changes.
* **Rollback:** CI/CD must support rapid rollback to a previous image/tag.

## Runbook & production checklist

Before first production deployment, ensure:

* Configuration and secrets are present in production environment.
* Health checks return healthy for all dependencies.
* CI/CD pipeline is configured and tested for deploy and rollback.
* Metrics and tracing collectors are configured and receiving data.
* Alerts configured for critical signals (errors, latency, unhealthy checks).
* Backup and restore procedures are documented.
* Load tests show required capacity and autoscaling thresholds are set.

## Extending the template

* Add new projects to the solution (Application, Domain, Infrastructure) when complexity grows.
* Replace EF Core with any data access technology by implementing repository interfaces in `Infrastructure`.
* Add OAuth2/OIDC integration with `Microsoft.AspNetCore.Authentication.JwtBearer` and appropriate configuration providers.
* To add message brokers, create producer/consumer adapters behind interfaces registered in DI.

## References & resources

* ASP.NET Core docs — architecture and hosting
* Serilog docs — structured logging
* EF Core docs — migrations and best practices
* OpenTelemetry — tracing and metrics
* Twelve-Factor App principles
