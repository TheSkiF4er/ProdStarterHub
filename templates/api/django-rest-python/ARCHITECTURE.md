# PRODSTARTER.DJANGO.REST — ARCHITECTURE

> Production-ready architecture document for the `django-rest-python` template. This file documents design choices, component responsibilities, deployment guidance, observability, security considerations, testing strategy, and operational runbook for a hardened Django REST service ready for containerized production.

---

## Table of Contents

1. [Purpose & Goals](#purpose--goals)
2. [Non-functional requirements](#non-functional-requirements)
3. [High-level architecture](#high-level-architecture)
4. [Project structure](#project-structure)
5. [Core components & responsibilities](#core-components--responsibilities)
6. [Data persistence & migrations](#data-persistence--migrations)
7. [Background processing & async workloads](#background-processing--async-workloads)
8. [Inter-service communication & integration patterns](#inter-service-communication--integration-patterns)
9. [Security](#security)
10. [Observability & telemetry](#observability--telemetry)
11. [Operational concerns & deployment](#operational-concerns--deployment)
12. [Testing strategy](#testing-strategy)
13. [CI/CD & release process](#cicd--release-process)
14. [Runbook & production checklist](#runbook--production-checklist)
15. [Extending the template](#extending-the-template)
16. [References & resources](#references--resources)

---

## Purpose & Goals

This template provides a secure, scalable, and maintainable baseline for building HTTP APIs using Django and Django REST Framework (DRF). It is opinionated for production deploys and focuses on:

* Clear separation between web/API layer, domain logic, and infrastructure.
* Container-first development and deployment (Docker + Kubernetes-ready manifests).
* Observability (metrics, tracing, structured logs) and health checks.
* Security best practices (secrets management, hardened settings, auth patterns).
* A robust testing strategy (unit, integration, contract, E2E).

## Non-functional requirements

* **Reliability:** graceful shutdown, health / readiness checks, robust DB migration strategy.
* **Scalability:** horizontal scaling for web and worker processes; stateless app instances.
* **Security:** secrets externalized, secure defaults, input validation, and auth/authorization.
* **Observability:** structured logs, metrics, traces, and alerts.
* **Maintainability:** modular code, clear patterns, and automatable checks in CI.

## High-level architecture

```
Clients (web/mobile)  →  HTTPS  →  Load Balancer / API Gateway  →  Django API (ASGI/Gunicorn+Uvicorn)
                                                    ↕
                                 ┌───────────────┴───────────────┐
                                 │    Persistent Storage (RDBMS) │
                                 │      (Postgres / MariaDB)     │
                                 └───────────────┬───────────────┘
                                                 │
                                   Cache / Broker  │  Object Storage (S3)
                                   (Redis / RabbitMQ)│
                                                    ↓
                                         Background workers (Celery / Dramatiq)
```

Key points:

* App is **stateless**: session data and file uploads stored externally (cache or object storage).
* Use a process manager (Gunicorn with Uvicorn workers for ASGI) or Uvicorn directly behind a reverse proxy.
* Background processing handled via Celery (recommended) with Redis/RabbitMQ as broker and result backend.
* Static assets served from object storage (S3) or via `whitenoise` in simple deployments.

## Project structure

Opinionated layout for clarity and growth:

```
project_root/
├── src/
│   ├── config/                  # Django settings package (base, dev, prod)
│   ├── apps/                    # Django apps (api, users, core, ...)
│   ├── requirements.txt / pyproject.toml
│   ├── manage.py
│   └── Dockerfile
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docker-compose.yml
├── k8s/                         # Optional Kubernetes manifests or Helm chart
├── ARCHITECTURE.md
├── TUTORIAL.md
└── TASKS.md
```

Notes:

* Use a `config` package for settings with strict layering: `base.py`, `development.py`, `production.py`.
* Use `django-environ` or similar to parse environment variables for 12-factor practices.

## Core components & responsibilities

### 1. Settings & Configuration

* Centralized settings with environment-specific overrides.
* Use environment variables for secrets and operational flags (e.g., `DEBUG`, `ALLOWED_HOSTS`, `DATABASE_URL`).
* Enforce `DEBUG=False` in production and strict `ALLOWED_HOSTS`.

### 2. API Layer (DRF)

* `APIView` / `ViewSets` implement HTTP contracts. Keep them thin; delegate to service or domain layers.
* Serializers implement input validation and transformation; prefer explicit fields and validators.
* Version your API via URL versioning or media-type versioning.

### 3. Domain & Services

* Business logic and transactions should live in services or domain modules, independent of Django request objects where possible.
* Use repository or gatekeeper patterns to encapsulate data access complexities.

### 4. Persistence & Repositories

* Use Django ORM for domain mapping. For complex operations, consider raw SQL repositories or SQLAlchemy for special cases.
* Keep migrations under version control and use idempotent patterns where possible.

### 5. Background Workers

* Celery-based tasks for long-running jobs, scheduled jobs (beat), and queue consumers.
* Ensure tasks are idempotent and safe for retries.

### 6. Static & Media Storage

* Store static/media in S3-compatible storage for production; use `collectstatic` during build or deploy.
* For small deployments, `whitenoise` can serve static files directly from the app container.

## Data persistence & migrations

* Use Postgres as the recommended default relational DB (best ecosystem support).
* Migrations:

  * Keep migrations in the `app/migrations/` directories and commit them.
  * Apply migrations during deploy using a dedicated migration job or CI-driven migration step. Avoid running migrations automatically within web replicas during rolling updates unless safe.
  * For destructive migrations (column drops), use a multi-release strategy (add column → backfill → switch reads → drop column).

## Background processing & async workloads

* **Broker**: Redis or RabbitMQ. Choose Redis for simplicity and speed; RabbitMQ for higher reliability and complex routing.
* **Result backend**: Redis or database depending on workload.
* **Scheduled tasks**: Celery Beat or external scheduler (e.g., Airflow, Kubernetes CronJob).
* **Task design**: tasks must be idempotent, handle retries, and use dead-lettering patterns for failing messages.

## Inter-service communication & integration patterns

* **Synchronous HTTP** via typed clients or `requests/httpx` with retry/circuit-breaker policies.
* **Asynchronous** via message broker for event-driven patterns; implement back-pressure and DLQ.
* **Auth & service identity**: mTLS at gateway or JWT/OIDC tokens for service-to-service calls.
* **API contracts**: publish OpenAPI spec via DRF schemas and use contract testing for consumers.

## Security

* **Secrets management:** use platform secrets (Kubernetes Secrets, Vault, AWS Secrets Manager). Never commit secrets.
* **HTTPS/TLS:** enforce TLS at the edge/load balancer and use HSTS for production.
* **Auth & Authorization:** use OAuth2/OpenID Connect (Keycloak, Auth0) or JWT via `djangorestframework-simplejwt` for API auth. Use DRF permissions and object-level authorization.
* **Input validation:** rely on Serializer validation; sanitize and limit accepted payload sizes.
* **CSRF:** for session-based auth, CSRF protection must be enabled. For token-based APIs, CSRF is typically not required but confirm with the architecture.
* **Security headers:** set `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Content-Security-Policy` as appropriate.
* **Dependency scanning:** enable Dependabot or SCA to detect vulnerable packages.
* **Rate limiting:** enforce at API Gateway; optionally use in-app throttling with `django-ratelimit`.

## Observability & telemetry

* **Logging:** structured JSON logs to stdout (structured logging with `structlog` or configured Python logging format) for ingestion by centralized logging systems (ELK, Loki, Datadog).
* **Metrics:** expose Prometheus metrics via `django-prometheus` or a lightweight `/metrics` endpoint.
* **Tracing:** instrument with OpenTelemetry (OTel) for distributed traces. Ensure trace context propagates through HTTP clients and Celery tasks.
* **Health checks:** provide `/healthz`, `/ready`, `/live` endpoints. Health checks should include DB connectivity, broker connectivity, and optionally storage health.
* **Alerts:** set alerts for failing health checks, high error rates, slow request p95 latencies, and queue backlogs.

## Operational concerns & deployment

### Containerization

* Provide a multi-stage Dockerfile: build stage installs dependencies and collects static assets; runtime stage runs the app with a WSGI/ASGI server.
* Recommended runtime: Gunicorn with Uvicorn workers for ASGI (`gunicorn -k uvicorn.workers.UvicornWorker`).
* Use non-root user and minimal base image (e.g., `python:3.11-slim` or `distroless`) for smaller attack surface.

### Kubernetes

* Deploy web app as a Deployment + Service behind an Ingress/Service mesh or API Gateway.
* Use HorizontalPodAutoscaler (HPA) based on CPU or custom metrics (e.g., queue length).
* Provide readiness and liveness probes pointing to `/ready` and `/live`.
* Run DB migrations from a controlled Job; do not rely on `manage.py migrate` in each replica on startup.

### Static & media

* Use S3-compatible object storage for media and static files in production. Use `collectstatic` to push static files during build or CI.

### Backups & DR

* Ensure DB backup policy and test restores. Object storage should have lifecycle and backup policies configured.

## Testing strategy

* **Unit tests:** use `pytest` + `pytest-django` and `factory_boy` for fixtures. Keep them fast and focused.
* **Integration tests:** use Testcontainers (or ephemeral DB instances) to run integration tests against Postgres/Redis and run Celery tasks in a controlled environment.
* **Contract tests:** verify OpenAPI contracts against consumers.
* **E2E tests:** run smoke tests against a staging environment using real integrations.
* **Load tests:** use Locust or k6 to emulate realistic traffic and validate autoscaling parameters.

## CI/CD & release process

* **CI pipeline:** build, lint (flake8/ruff), test (unit & integration), security scans, build container image.
* **Image registry:** push images to GHCR / Docker Hub / private registry with tags (commit SHA, semantic version tags).
* **Migration job:** run migrations via an orchestrated job (CI or k8s Job) before rolling out new replicas.
* **Deployment strategy:** prefer Blue/Green or Canary releases to reduce risk. Use feature flags for controlled rollouts.
* **Rollback:** maintain previous image tags and a tested rollback procedure in case of failure.

## Runbook & production checklist

Before first production deployment, ensure:

* Secrets and configuration are provided in production.
* `DEBUG=False` and `ALLOWED_HOSTS` are properly set.
* Health checks (`/healthz`, `/ready`) pass for all dependencies.
* Monitoring, logging, and tracing pipelines are configured and receiving data.
* Backups and retention policies are in place for DB and object storage.
* A migration plan exists for schema changes and destructive operations.
* Alerts configured for critical failure modes.

Emergency steps:

1. Check pod/container logs for stack traces and errors.
2. Check health endpoints for failing dependencies.
3. If necessary, scale down new replicas and scale up previous image (rollback).
4. If DB migration caused failure, restore DB from backup and roll back schema change following the migration safety plan.

## Extending the template

* Add opinionated `apps` (users, auth, core) and reuse patterns for serializers, viewsets, and routers.
* Integrate `django-guardian` or `django-rules` for fine-grained authorization when needed.
* Add GraphQL support (Graphene or Ariadne) if required alongside REST endpoints.
* Add a Helm chart for more advanced Kubernetes deployments and Secrets templating.

## References & resources

* Django documentation — deployment checklist and best practices: [https://docs.djangoproject.com/](https://docs.djangoproject.com/)
* Django REST Framework — API toolkit: [https://www.django-rest-framework.org/](https://www.django-rest-framework.org/)
* Celery documentation — tasks & workers: [https://docs.celeryq.dev/](https://docs.celeryq.dev/)
* OpenTelemetry Python — tracing and metrics: [https://opentelemetry.io/](https://opentelemetry.io/)
* Prometheus & django-prometheus — metrics collection: [https://github.com/korfuri/django-prometheus](https://github.com/korfuri/django-prometheus)
* Twelve-Factor App — configuration and deploy guidance: [https://12factor.net/](https://12factor.net/)

---

> This ARCHITECTURE.md is opinionated and intended to give a pragmatic, secure, and maintainable baseline for Django REST services. Adapt it to your organization’s operational and compliance requirements while keeping the core principles of statelessness, observability, security, and testability.
