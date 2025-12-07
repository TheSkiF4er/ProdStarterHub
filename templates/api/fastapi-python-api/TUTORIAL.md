# PRODSTARTER.FASTAPI — TUTORIAL

This tutorial walks you through creating, running, testing, and deploying a service scaffolded from the `fastapi-python-api` template in **ProdStarterHub**. It focuses on production-ready practices: configuration, containerization, migrations, background processing, observability, and CI/CD.

> Audience: backend engineers, DevOps engineers, and technical leads building FastAPI microservices.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Obtain the template & scaffold a project](#obtain-the-template--scaffold-a-project)
3. [Project layout overview](#project-layout-overview)
4. [Configuration & environment variables](#configuration--environment-variables)
5. [Run locally with Uvicorn (dev)](#run-locally-with-uvicorn-dev)
6. [Run with Docker and docker-compose](#run-with-docker-and-docker-compose)
7. [Database, async ORM, and migrations](#database-async-orm-and-migrations)
8. [Background workers & scheduled tasks](#background-workers--scheduled-tasks)
9. [Health checks, readiness & liveness](#health-checks-readiness--liveness)
10. [Metrics & tracing (observability)](#metrics--tracing-observability)
11. [Testing strategy and examples](#testing-strategy-and-examples)
12. [CI/CD recommendations (GitHub Actions example)](#cicd-recommendations-github-actions-example)
13. [Kubernetes deployment guidance](#kubernetes-deployment-guidance)
14. [Security checklist](#security-checklist)
15. [Troubleshooting & FAQ](#troubleshooting--faq)
16. [Next steps & extension points](#next-steps--extension-points)

---

## Prerequisites

* Python 3.11+ (recommended)
* Git
* Docker & docker-compose (for containerized workflows)
* PostgreSQL (or other RDBMS) for persistence in dev or test containers
* Redis (optional) for caching and as a broker
* Optional: Kubernetes (minikube / kind) for local cluster testing

## Obtain the template & scaffold a project

1. Clone the ProdStarterHub repository or copy the template folder:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/fastapi-python-api
```

2. Copy the template to your working directory and optionally rename package tokens (`prodstarter-fastapi` / module names):

```bash
mkdir ~/projects/my-fastapi && cp -R . ~/projects/my-fastapi
cd ~/projects/my-fastapi
# Optional: replace occurrences of `prodstarter-fastapi` as needed
```

3. (Optional) Create a Python virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Project layout overview

```
app/                          # app package
  ├── main.py                  # app factory and entrypoint
  ├── config.py                # pydantic settings
  ├── api/                     # routers, schemas (pydantic), dependencies
  ├── core/                    # services/use-cases/business logic
  ├── db/                      # async DB engine, session, migrations helpers
  ├── background/              # background tasks / worker adapters
  └── logging.py               # logging & structlog config
requirements.txt
Dockerfile
docker-compose.yml
k8s/                          # optional kubernetes manifests
tests/                         # unit & integration tests
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
README.md
```

> The app uses an app-factory pattern (`create_app`) to make tests and local instantiation easy.

## Configuration & environment variables

Configuration is provided by Pydantic `BaseSettings` and `.env` file support. Environment variables override files. Key env vars used in the template:

* `SERVICE_NAME` — service name for logs and metrics
* `ENVIRONMENT` — `development`/`production`/`staging`
* `DEBUG` — boolean
* `DATABASE_DSN` — async DSN for DB (e.g. `postgresql+asyncpg://user:pass@host:5432/dbname`)
* `REDIS_DSN` — broker/cache URL
* `CORS_ORIGINS` — comma-separated list of allowed origins
* `METRICS_ENABLED` — boolean to enable `/metrics`
* `OTEL_ENABLED` / `OTEL_EXPORTER_OTLP_ENDPOINT` — optional OpenTelemetry
* `SENTRY_DSN` — optional Sentry DSN

Example `.env` for local dev (do **not** commit):

```ini
SERVICE_NAME=my-fastapi
ENVIRONMENT=development
DEBUG=True
DATABASE_DSN=postgresql+asyncpg://postgres:postgres@postgres:5432/mydb
REDIS_DSN=redis://redis:6379/0
CORS_ORIGINS=http://localhost:3000
METRICS_ENABLED=True
```

## Run locally with Uvicorn (dev)

1. Ensure dependencies are installed and an env config is loaded (`.env` or shell vars).
2. Start the app in development mode:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. Visit:

* API docs: `http://localhost:8000/api/v1/docs`
* Health: `http://localhost:8000/health`
* Metrics: `http://localhost:8000/metrics` (if enabled)

## Run with Docker and docker-compose

The template includes a multi-stage `Dockerfile` and `docker-compose.yml` with services for Postgres and Redis. Typical commands:

```bash
docker-compose up --build -d
# Run migrations inside the web container (if using Alembic)
docker-compose exec web alembic upgrade head
# Or use a manage script if provided
# View logs
docker-compose logs -f web
```

To stop and remove volumes:

```bash
docker-compose down -v
```

Notes:

* Use environment variables or mounted `.env` in compose for service configuration.
* Multi-stage builds produce small runtime images and install dependencies in build stage only.

## Database, async ORM, and migrations

### Async ORM choices

* **SQLAlchemy 1.4+ (async)** with `asyncpg` is recommended for Postgres.
* **databases** library is an alternative for simpler async DB access.

### Migrations

* Use **Alembic** for migrations (compatible with async SQLAlchemy). Keep migrations checked into VCS.

Example Alembic commands inside container:

```bash
alembic revision --autogenerate -m "create items"
alembic upgrade head
```

### Migration strategy

* Run migrations as a controlled CI step or a Kubernetes Job **before** applying new replicas.
* For destructive schema changes, use multi-release approach: add column, deploy code writing to new column, backfill, switch reads, drop old column in later release.

## Background workers & scheduled tasks

The template includes placeholders for background task frameworks (Celery, Dramatiq, or native asyncio task runners). Recommended approach:

* **Celery + Redis/RabbitMQ** for robust distributed task queues.
* Run workers in separate containers/deployments from web.
* Use task idempotency, retries, and dead-letter queues for failures.

Start Celery worker (example):

```bash
celery -A app.background.worker worker --loglevel=info
celery -A app.background.worker beat --loglevel=info  # scheduled tasks
```

## Health checks, readiness & liveness

Template exposes:

* `/health` — composite health (DB, caches)
* `/live` — liveness probe (process alive)
* `/ready` — readiness probe (able to accept traffic)

Integrate these endpoints with orchestrator probes (Kubernetes readiness/liveness) to enable safe rolling updates.

## Metrics & tracing (observability)

### Metrics

* Prometheus client library is included with example counters and gauges.
* Expose metrics at `/metrics`. Keep this endpoint internal or protected.
* Important metrics: `http_requests_total`, `http_request_latency_seconds`, business-specific gauges.

### Tracing

* Template includes optional OpenTelemetry hooks. To enable tracing:

  * Set `OTEL_ENABLED=true` and configure `OTEL_EXPORTER_OTLP_ENDPOINT`.
  * Ensure an OTel collector (Jaeger/OTLP) is reachable from the environment.

### Logging

* Structured JSON logging via `structlog` or configured standard logging; writes to stdout for collector ingestion.
* Include correlation/request IDs in logs for traceability.

## Testing strategy and examples

### Unit tests

* Use `pytest` for unit tests. Keep fast, isolated unit tests for services and schema validations.

```bash
pytest tests/unit -q
```

### Integration tests

* Use `httpx.AsyncClient` or `TestClient` for route tests.
* For DB-backed tests use Testcontainers or ephemeral DB fixtures; pytest fixtures can start a Postgres container for tests.

Example pytest snippet:

```python
from httpx import AsyncClient
from app.main import create_app

async def test_root():
    app = create_app()
    async with AsyncClient(app=app, base_url="http://test") as ac:
        r = await ac.get("/api/v1/")
        assert r.status_code == 200
```

### E2E smoke tests

* CI job runs a smoke test against the built image: start container, wait for `/ready`, call health and a few endpoints, then tear down.

## CI/CD recommendations (GitHub Actions example)

Recommended pipeline stages:

1. Lint & format check (`ruff` / `black --check`)
2. Unit tests (pytest)
3. Build Docker image (tag with `sha-<commit>`)
4. Push image to registry (GHCR/DockerHub) for `main` branch or tagged commits
5. Deploy to staging and run smoke tests against the pushed image
6. Promote image to production with canary/blue-green or GitOps

High-level job snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with: python-version: 3.11
      - name: Install deps
        run: pip install -r requirements.txt
      - name: Lint & Test
        run: |
          ruff .
          black --check .
          pytest -q
      - name: Build & Push Docker
        uses: docker/build-push-action@v3
        with:
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/my-fastapi:sha-${{ github.sha }}
```

## Kubernetes deployment guidance

Key considerations:

* Use Deployment + Service + Ingress (TLS) or API Gateway.
* Readiness probe -> `/ready`, Liveness probe -> `/live`.
* Run DB migrations as a Job or via CI before the new Deployment is rolled out.
* Tracing, logs and metrics collectors should be accessible in the cluster (OTel collector, Prometheus, Loki).
* Keep resource requests/limits configured per environment and set HPA (CPU or custom metrics).

Sample readiness probe snippet:

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
  initialDelaySeconds: 5
  periodSeconds: 10
livenessProbe:
  httpGet:
    path: /live
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 20
```

## Security checklist

* **Never** commit secrets to Git. Use K8s Secrets, Vault, or cloud secret managers.
* Set `ENVIRONMENT=production` and `DEBUG=False` for production.
* Use HTTPS/TLS at the edge; enable HSTS and secure cookies if applicable.
* Protect metrics and admin endpoints (IP allowlist or auth) — avoid exposing `/metrics` publicly.
* Enforce least privilege: narrow down DB user permissions and service accounts.
* Enable Dependabot or SCA to monitor dependencies for vulnerabilities.
* Log and alert on suspicious activity and rate spikes.

## Troubleshooting & FAQ

**App doesn't start in container**

* Check container logs: `docker-compose logs -f web`.
* Ensure env variables are present; missing `DATABASE_DSN` often causes startup failures.

**Database connection errors in tests**

* For integration tests, use Testcontainers or ensure test DB is reachable with correct DSN.

**Metrics not showing in Prometheus**

* Confirm `/metrics` returns metrics locally and that Prometheus scrape config points to correct target.

**High latency under load**

* Profile DB queries, add indexes, enable connection pooling, and consider caching hotspots.

## Next steps & extension points

* Add authentication and authorization (JWT/OIDC) integration and sample protected endpoints.
* Add more sophisticated background processing patterns (Celery with retry & DLQ, or Dramatiq).
* Provide a Helm chart and GitOps examples for automated deployments.
* Integrate observability exporters and example Grafana dashboards.
