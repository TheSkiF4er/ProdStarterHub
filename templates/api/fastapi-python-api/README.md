# ProdStarter — FastAPI Service (Python)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Template](https://img.shields.io/badge/template-prodstarter--fastapi-green)](template.json)

> Production-ready FastAPI template: async-first, observable, secure-by-default, and container-friendly. Includes structured logging, Prometheus metrics, health checks, OpenAPI docs, and sensible defaults for deployment.

---

## Contents

* [Quickstart](#quickstart)
* [Highlights & Features](#highlights--features)
* [Project layout](#project-layout)
* [Configuration](#configuration)
* [Run locally (dev)](#run-locally-dev)
* [Docker & docker-compose](#docker--docker-compose)
* [Health checks & observability](#health-checks--observability)
* [Security](#security)
* [Testing](#testing)
* [CI/CD recommendations](#cicd-recommendations)
* [Kubernetes & production deployment](#kubernetes--production-deployment)
* [Template variables & customization](#template-variables--customization)
* [Contributing](#contributing)
* [License](#license)

---

## Quickstart

Clone the template and run locally with a virtual environment or Docker.

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/fastapi-python-api

# Copy to your workspace
mkdir ~/projects/my-fastapi && cp -R . ~/projects/my-fastapi
cd ~/projects/my-fastapi

# (Optional) replace package token 'prodstarter_fastapi' with your project name

# Local dev with a venv
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open:

* API docs: `http://localhost:8000/api/v1/docs`
* Health: `http://localhost:8000/health`
* Metrics: `http://localhost:8000/metrics` (if enabled)

---

## Highlights & Features

* Production-focused app factory (`create_app`) for testability and DI.
* Typed configuration with Pydantic `BaseSettings` and `.env` support.
* Structured JSON logging (structlog) and request correlation.
* Prometheus metrics (`/metrics`) with request counters and latency gauges.
* Health endpoints: `/health`, `/live`, `/ready`.
* OpenAPI docs (versioned, under `/api/v1`).
* Middleware: CORS, GZip, TrustedHosts, request logging.
* Startup/shutdown lifecycle events for graceful resource management.
* Placeholders and DI for async DB, cache, and background workers.

---

## Project layout

```
app/                          # application package
  ├── main.py                  # app factory, startup/shutdown
  ├── config.py                # Pydantic settings
  ├── api/                     # routers, schemas, dependencies
  ├── core/                    # services and business logic
  ├── db/                      # db client, migrations helpers
  ├── background/              # background task adapters
  └── logging.py               # logging configuration
requirements.txt
Dockerfile
docker-compose.yml
k8s/                          # optional k8s manifests / helm
tests/                         # unit & integration tests
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json
README.md
```

---

## Configuration

Configuration is driven by environment variables and Pydantic settings. Priority: `.env` file < environment variables < command line.

Key variables (example):

* `SERVICE_NAME` — service identifier for logs/metrics (default: `prodstarter-fastapi`).
* `ENVIRONMENT` — `development`/`staging`/`production`.
* `DEBUG` — enable debug behaviors (boolean).
* `DATABASE_DSN` — async DSN for your database (e.g. Postgres).
* `REDIS_DSN` — Redis URL for cache/broker.
* `CORS_ORIGINS` — comma-separated allowed origins.
* `METRICS_ENABLED` — enable Prometheus metrics (boolean).
* `OTEL_ENABLED` / `OTEL_EXPORTER_OTLP_ENDPOINT` — OpenTelemetry settings.
* `SENTRY_DSN` — optional Sentry DSN.

Use `__` (double underscore) to map nested config keys in some platforms when setting environment variables.

---

## Run locally (dev)

With installed dependencies:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Tips:

* Use `.env` for local environment variables (do not commit it).
* Use `--reload` for development only.

---

## Docker & docker-compose

The template includes a production-ready multi-stage `Dockerfile` and a `docker-compose.yml` for local development (Postgres + Redis examples).

Build and run:

```bash
docker-compose up --build
# or build only
docker build -t myfastapi:dev .
```

Run migrations inside the container (if applicable):

```bash
docker-compose exec web <migrations command>
```

Stop & remove volumes:

```bash
docker-compose down -v
```

---

## Health checks & observability

* `/health` — composite health including DB/cache checks.
* `/live` — liveness probe (process alive).
* `/ready` — readiness probe (service ready to accept traffic).
* `/metrics` — Prometheus metrics (if enabled).

Logging:

* Structured JSON logs to stdout for ingestion by ELK/Loki/Datadog.
* Enrich logs with `service`, `environment`, `request_id`.

Tracing & metrics:

* Optional OpenTelemetry support; enable with env vars and configure OTLP collector.
* Add business-specific metrics using Prometheus client.

---

## Security

* Never commit secrets into the repository. Use platform secrets (K8s Secrets, Vault, AWS Secrets Manager).
* Ensure `DEBUG=False` in production and set `TrustedHost`/`CORS_ORIGINS` appropriately.
* Terminate TLS at the edge (load balancer) and enable HSTS.
* Protect metrics and admin endpoints from public exposure.
* Use JWT/OIDC or mutual TLS for service-to-service authentication.
* Enable Dependabot/SCA scanning in CI and promptly address critical findings.

---

## Testing

* Unit tests with `pytest` (fast, isolated) for services and schemas.
* Integration tests using `httpx.AsyncClient` and Testcontainers or ephemeral DB for DB-backed tests.
* Example run:

```bash
pytest -q
```

* Add smoke tests in CI to verify built images (health endpoints and core routes).

---

## CI/CD recommendations

* CI pipeline steps: checkout, setup python, install deps, lint (ruff/black/isort), type-check (mypy optional), run tests, build Docker image, run smoke tests, push image to registry.
* Tag images with `sha-<commit>` for CI artifacts and `vX.Y.Z` for releases.
* Use image promotion between environments; avoid rebuilding image per environment.
* Use canary or blue/green deployments for low-risk releases.

---

## Kubernetes & production deployment

* Deploy behind an API Gateway or Ingress with TLS.
* Use Deployment/Service + HPA and resource requests/limits.
* Use readiness (`/ready`) and liveness (`/live`) probes.
* Run DB migrations as a pre-deploy Job or in CI before rolling out new replicas.
* Use secrets and configmaps for sensitive and non-sensitive config respectively.

---

## Template variables & customization

See `template.json` for supported variables. Typical values to replace in scaffold:

* `ProjectName` — replace `prodstarter_fastapi` with your package name.
* `Author`, `Company`, `License`, `PythonVersion`.
* Feature flags: `IncludeDocker`, `IncludeKubernetesManifests`, `IncludeCelery`, `IncludeOpenTelemetry`, `IncludeGithubActions`.

When integrating into a generator, ensure tokens appear consistently across files for automated replacement.

---

## Contributing

Contributions are welcome. Please:

1. Fork the repository and create a feature branch.
2. Run linters and tests locally.
3. Open a pull request describing changes and which `TASKS.md` items it covers.
4. Ensure CI passes and reviewers approve before merging.

See `CONTRIBUTING.md` (if present) for more details.

---

## License

This template is provided under the MIT License. See `LICENSE` for details.
