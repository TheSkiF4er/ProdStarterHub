# PRODSTARTER.FASTAPI — ARCHITECTURE

> Production-ready architecture document for the `fastapi-python-api` template. This file explains design decisions, component responsibilities, deployment guidance, observability, security considerations, scaling patterns, testing strategy, and operational runbook for a hardened FastAPI microservice.

---

## Table of Contents

1. [Purpose & Goals](#purpose--goals)
2. [Non-functional requirements](#non-functional-requirements)
3. [High-level architecture](#high-level-architecture)
4. [Project layout](#project-layout)
5. [Core components & responsibilities](#core-components--responsibilities)
6. [Data persistence & migrations](#data-persistence--migrations)
7. [Async & background processing](#async--background-processing)
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

This template provides a pragmatic, opinionated starting point for building production FastAPI services focused on:

* Lightweight, async-first HTTP APIs with clear separation of concerns.
* Observability (metrics, structured logs, traces) and health checks.
* Container-first deployment (Docker + Kubernetes ready).
* Secure-by-default configuration and deployment practices.
* Testability and maintainability with an app-factory pattern and dependency injection.

## Non-functional requirements

* **Reliability:** graceful startup/shutdown, liveness/readiness probes, retry policies.
* **Scalability:** horizontally scalable stateless app instances; async I/O for high concurrency.
* **Security:** secrets externalized, TLS enforced at edge, least privilege for services.
* **Observability:** structured logs, request metrics, distributed tracing, and health checks.
* **Maintainability:** modular code, typed settings (Pydantic), automated tests and CI checks.

## High-level architecture

```
Client  →  Load Balancer / API Gateway  →  FastAPI App (Uvicorn / Gunicorn+Uvicorn workers)
                                         │   ▲           │
                                         │   │           └─> Background workers (Celery / RQ / asyncio tasks)
                                         │   └─> Cache (Redis) → Message Broker
                                         └────> Relational DB (Postgres)
                                                  └─> Object Storage (S3)
```

* The service is stateless: any local state is ephemeral; sessions, files and caches are externalized.
* Use an API Gateway for TLS termination, rate limiting, authentication, and routing.
* Background tasks and queue consumers are deployed separately from web workers.

## Project layout

Opinionated, simple layout that scales with the project:

```
app/                            # application package
  ├── main.py                   # app factory, startup/shutdown
  ├── config.py                 # Pydantic settings
  ├── api/                      # routers, schemas (pydantic), dependencies
  ├── core/                     # application core: services, use-cases
  ├── db/                       # DB layer: async engine, session, migrations helpers
  ├── background/               # background jobs/worker adapters
  ├── deps.py                   # DI-friendly dependency providers
  └── logging.py                # logging & structlog config
tests/                          # unit and integration tests
Dockerfile
docker-compose.yml
k8s/                            # optional Kubernetes manifests / Helm chart
requirements.txt or pyproject.toml
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Notes:

* Use the app factory (`create_app`) for easy test instantiation.
* Keep routers thin and push business logic to `core`/`services` layer.

## Core components & responsibilities

### App factory (`main.py`)

* Create and configure FastAPI instance, mount routers, middlewares (CORS, GZip, TrustedHost), metrics and docs.
* Wire startup/shutdown events for DB, caches, and optional tracing/Sentry.

### Configuration (`config.py`)

* Pydantic `BaseSettings` for typed settings and environment file support. Promote 12-factor config.

### API layer (`api`)

* Pydantic models (schemas) for request/response validation.
* Versioned routers (e.g., `/api/v1`) and dependency injection via `Depends`.

### Core / Services

* Business logic, transactional workflows, and orchestration of repositories/adapters.
* Keep pure Python logic unit-testable (avoid framework coupling).

### DB layer

* Async DB engine (SQLAlchemy 1.4+ async or `databases`), session management, and helper functions for migrations.
* Repository abstractions to decouple ORM specifics from services.

### Background workers

* Optional worker implementations (Celery with Redis/RabbitMQ, RQ, or native asyncio workers) for long-running tasks.

### Monitoring & Metrics

* Prometheus metrics (`/metrics`), request counters, latency gauges, and custom business metrics.

## Data persistence & migrations

* **Relational DB:** Postgres recommended. Use async DB drivers compatible with your chosen ORM.
* **Migrations:** Use Alembic (async-friendly) or the migrations tool that matches your ORM. Keep migrations checked into VCS.
* **Migration strategy:** run migrations from CI or as a controlled pre-deploy Job. Avoid automatic schema changes during rolling updates unless safe.
* **Backups:** ensure automated backups and tested restores for DB and object storage.

## Async & background processing

* Prefer async I/O for HTTP handlers and DB communication to maximize concurrency.
* Offload CPU-bound or long-running work to worker processes (Celery/Worker pools).
* Use Redis or RabbitMQ for broker and caching; ensure proper resource isolation for brokers.
* Design tasks to be idempotent and safe for retries. Implement dead-letter queues for poisoned messages.

## Inter-service communication & integration patterns

* **Synchronous:** HTTP/gRPC calls with retries and circuit breakers for resiliency.
* **Asynchronous:** message broker for decoupling and high throughput; use events for eventual consistency.
* **Typed clients:** wrap external HTTP calls in client classes and apply Polly-like retry strategies (tenacity).
* **Contracts:** publish OpenAPI spec and use contract tests where consumers are external teams.

## Security

* **Secrets:** never commit secrets. Use environment variables, Vault, or platform secrets (K8s Secrets, AWS Secrets Manager).
* **Transport:** TLS at edge by default; enable HSTS for production.
* **Auth & Authorization:** support JWT/OIDC tokens (middleware or gateway). For internal services, mTLS or service tokens are options.
* **Input validation:** rely on Pydantic and limit request sizes. Sanitize fields before using them in shell/SQL contexts.
* **Rate limiting & throttling:** implement at gateway level; optionally add in-app throttling for critical endpoints.
* **Dependencies:** enable dependency scanning and quickly remediate critical CVEs.
* **Least privilege:** minimal permissions for service accounts and DB users.

## Observability & telemetry

* **Logs:** structured JSON logs (structlog or structured logging) to stdout; include correlation IDs and request context.
* **Metrics:** prometheus client exposing request counts, latencies, app uptime and custom business metrics.
* **Tracing:** OpenTelemetry instrumentation for FastAPI, DB, and outgoing HTTP calls; export via OTLP to collector (Jaeger/Zipkin).
* **Health checks:** liveness, readiness, and composite health endpoints including DB and broker checks.
* **Alerts & Dashboards:** create dashboards for error rate, latency percentiles, request rate, DB connection errors and queue backlogs.

## Operational concerns & deployment

### Containerization

* Use multi-stage Dockerfile to produce minimal runtime images (slim base or distroless).
* Run as non-root user, set `PYTHONUNBUFFERED=1` and `PYTHONDONTWRITEBYTECODE=1`.
* Keep image small and apply OS-level security updates in base images.

### Process model

* Recommended: Gunicorn with Uvicorn workers for production (pre-fork) or Uvicorn alone behind a process manager.
* Configure worker count and timeouts appropriate to CPU/RAM and request profile.

### Kubernetes

* Use Deployment + Service; configure HorizontalPodAutoscaler (HPA) by CPU or custom metrics.
* Use readiness (`/ready`) and liveness (`/live`) probes.
* Migrations: run as a pre-deploy Job or CI step; do not run migrations in parallel across replicas unless safe.
* Secrets and ConfigMaps: use platform secrets and mount as env vars.

### Backups & DR

* Regular backups for DB and object storage; test restores frequently.
* Have playbooks for scaling, failover and disaster recovery.

## Testing strategy

* **Unit tests:** small, fast tests for business logic and Pydantic schemas.
* **Integration tests:** use Testcontainers or ephemeral dependencies to validate DB interactions and routes.
* **Contract tests:** verify OpenAPI against client expectations or consumer tests.
* **E2E tests:** smoke tests against staging cluster with real integrations.
* **Load tests:** use k6 or Locust to model realistic traffic for autoscaling and latencies.

## CI/CD & release process

* **CI:** lint (ruff/flake8), format (black, isort), type-check (mypy optional), unit tests, integration tests (optional), build and publish Docker image.
* **CD:** promote same immutable image across environments; use GitOps or pipeline-based deploys with canary/blue-green strategies.
* **Tagging:** use semantic versions and `sha-<commit>` tags for CI artifacts.
* **Rollbacks:** keep previous images and a tested rollback procedure.

## Runbook & production checklist

Before first production deployment:

* Ensure all secrets are configured in production secret store.
* `ENVIRONMENT=production`, debug disabled, and tracing/monitoring endpoints configured.
* Health checks for DB and broker pass.
* CI green and smoke tests passed for built image.
* Backup & restore processes documented and tested.
* Alerts and dashboards configured.

Emergency flow:

1. Inspect logs and traces for errors and affected services.
2. Check health endpoints (DB, broker connectivity).
3. If new deployment caused regression, rollback to previous image and run diagnostics.
4. For DB-related incidents, restore from backups if necessary following DR plan.

## Extending the template

* **Add modules** for auth (JWT/OIDC), feature flags, and multi-tenant patterns as needed.
* **Add async task frameworks** (Celery, Dramatiq, or built-in asyncio-based queues) depending on requirements.
* **Add observability exporters** and sample dashboards (Grafana) and OTLP collector configuration.
* **Add policy-as-code** checks for Kubernetes manifests (OPA/Gatekeeper) and image scanning as part of CI.

## References & resources

* FastAPI docs — [https://fastapi.tiangolo.com](https://fastapi.tiangolo.com)
* Uvicorn & Gunicorn deployment — Uvicorn + Gunicorn docs
* Prometheus client Python — [https://github.com/prometheus/client_python](https://github.com/prometheus/client_python)
* OpenTelemetry Python — [https://opentelemetry.io](https://opentelemetry.io)
* Twelve-Factor App — [https://12factor.net](https://12factor.net)

---

> This ARCHITECTURE.md is deliberately opinionated: it aims to provide a secure, observable, and maintainable baseline. Customize pragmatically to your organization’s constraints but preserve the key principles: statelessness, observability, security, and testability.
