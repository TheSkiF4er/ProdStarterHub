# PRODSTARTER.DJANGO.REST — TUTORIAL

This tutorial guides engineers through creating, running, testing, and deploying a new service from the `django-rest-python` template in **ProdStarterHub**. It focuses on production-ready practices: containerization, migrations, background workers, observability, and CI/CD.

> Audience: backend engineers, DevOps engineers, and technical leads who will build and operate Django REST services.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Get the template and scaffold a project](#get-the-template-and-scaffold-a-project)
3. [Project layout overview](#project-layout-overview)
4. [Local development with virtualenv / poetry](#local-development-with-virtualenv--poetry)
5. [Run the app with Docker and docker-compose](#run-the-app-with-docker-and-docker-compose)
6. [Configuration & environment variables](#configuration--environment-variables)
7. [Database setup and EF-style migrations (Django migrations)](#database-setup-and-ef-style-migrations-django-migrations)
8. [Celery background workers and scheduled tasks](#celery-background-workers-and-scheduled-tasks)
9. [Testing strategy and running tests locally](#testing-strategy-and-running-tests-locally)
10. [OpenAPI (Swagger) and API docs](#openapi-swagger-and-api-docs)
11. [CI/CD pipeline recommendations (GitHub Actions example)](#cicd-pipeline-recommendations-github-actions-example)
12. [Container registry & release strategy](#container-registry--release-strategy)
13. [Kubernetes deployment guidance](#kubernetes-deployment-guidance)
14. [Observability, logging, metrics & tracing](#observability-logging-metrics--tracing)
15. [Security checklist for production](#security-checklist-for-production)
16. [Troubleshooting & FAQ](#troubleshooting--faq)
17. [Next steps & extension points](#next-steps--extension-points)

---

## Prerequisites

* Python 3.11+ (recommended)
* Git
* Docker & docker-compose (for containerized workflows)
* PostgreSQL (local or remote) for persistence in development or test containers
* Redis or RabbitMQ for Celery broker (recommended Redis for simplicity)
* Optional: Kubernetes (minikube/kind) for local cluster testing

## Get the template and scaffold a project

1. Clone the ProdStarterHub repository or download the `django-rest-python` template folder:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/django-rest-python
```

2. Create a new project directory and copy template contents:

```bash
mkdir ~/projects/my-django-service && cp -R . ~/projects/my-django-service
cd ~/projects/my-django-service
```

3. Replace placeholder names (optional):

Search and replace the template project name (e.g. `prodstarter_django` or `prodstarter`) with your chosen project name and Python package name. Keep valid Python package naming conventions (lowercase, underscores allowed).

## Project layout overview

Minimal recommended layout shipped with the template:

```
project_root/
├── src/
│   ├── manage.py
│   ├── config/                # settings package: base.py, development.py, production.py
│   ├── apps/                  # django apps (api, users, core)
│   ├── requirements.txt or pyproject.toml
│   └── Dockerfile
├── tests/
│   ├── unit/
│   └── integration/
├── docker-compose.yml
├── k8s/                       # optional Kubernetes manifests or Helm chart
├── ARCHITECTURE.md
├── TASKS.md
├── TUTORIAL.md
└── README.md
```

Notes:

* `config` centralizes Django settings using environment variables.
* `apps` contains small, focused Django apps (e.g. `api`, `users`).
* `tests` contains unit and integration test suites.

## Local development with virtualenv / poetry

### Using virtualenv + pip

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r src/requirements.txt
cd src
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Using poetry (if template includes pyproject.toml)

```bash
poetry install
poetry run python src/manage.py migrate
poetry run python src/manage.py runserver
```

Open `http://localhost:8000/` and check health endpoints (`/healthz`, `/ready`, `/live`) if present.

## Run the app with Docker and docker-compose

The template includes a multi-service `docker-compose.yml` (Postgres + Redis + app). Example commands:

```bash
# Build images and start services
docker-compose up --build

# Run migrations inside the web container
docker-compose exec web python manage.py migrate
```

Service URLs:

* API: `http://localhost:8000` (or as configured)
* Swagger/OpenAPI: `http://localhost:8000/swagger/` (dev only)

Stop and remove containers:

```bash
docker-compose down -v
```

## Configuration & environment variables

Configuration precedence: `config/*.py` (base) < env-specific settings < environment variables.

Common environment variables used by the template:

* `DJANGO_SETTINGS_MODULE` — e.g. `config.development` or `config.production`
* `DATABASE_URL` — e.g. `postgres://user:password@postgres:5432/dbname`
* `REDIS_URL` — e.g. `redis://redis:6379/0`
* `SECRET_KEY` — Django secret key (must be set in production)
* `ALLOWED_HOSTS` — comma-separated hosts for production
* `DEBUG` — `True`/`False` (ensure `False` in production)
* `S3_...` — object storage credentials if using S3 for media/static

Use `.env` for local development (not committed) and platform secrets (K8s secrets, Vault) for production.

## Database setup and EF-style migrations (Django migrations)

1. Create and apply migrations locally:

```bash
cd src
python manage.py makemigrations
python manage.py migrate
```

2. Migration strategy for production:

* Prefer running migrations as a separate, controlled job in CI/CD or as a Kubernetes Job before switching traffic to new pods.
* For destructive changes, use a phased migration: add columns, deploy code that writes to new column, backfill, switch reads to new column, then drop old column in a later release.

3. Use `pg_dump` and restore procedures in staging to validate backup/restore.

## Celery background workers and scheduled tasks

The template includes a Celery scaffold (optional). To run workers locally with docker-compose:

```bash
# Start broker + app
docker-compose up -d
# Start worker
docker-compose exec web celery -A config.celery_app worker --loglevel=info
# Start beat for scheduled tasks
docker-compose exec web celery -A config.celery_app beat --loglevel=info
```

Guidelines:

* Use idempotent tasks (safe retry).
* Configure retry policies and dead-letter queues for failed messages.
* Use result backends only when necessary (prefer Redis or DB).

## Testing strategy and running tests locally

The template includes `pytest` with `pytest-django` recommended. Example commands:

```bash
# Run unit tests
pytest tests/unit
# Run integration tests (requires services running or Testcontainers)
pytest tests/integration
```

Best practices:

* Use factories (`factory_boy`) rather than fixtures where appropriate.
* Isolate settings for tests (`config.test`) with an in-memory or ephemeral database.
* Use Testcontainers (or github action service containers) to run Postgres/Redis in CI for integration tests.

## OpenAPI (Swagger) and API docs

* DRF schema generation: `drf-yasg` or `drf-spectacular` recommended. Template exposes `/swagger/` (dev only) and `/openapi.json`.
* Generate client SDKs using `openapi-generator` or `nswag` tooling if needed.

## CI/CD pipeline recommendations (GitHub Actions example)

A recommended CI pipeline steps:

1. Checkout repo
2. Setup Python (3.11)
3. Install dependencies (`pip install -r src/requirements.txt` or `poetry install`)
4. Lint (`ruff/flake8`, `black --check`, `isort --check`)
5. Run unit tests
6. Build Docker image and push to registry (on `main` or tagged commits)
7. Run integration or smoke tests against pushed image (deployment to staging cluster or test environment)

High-level `build-and-publish` job example (pseudocode):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with: python-version: 3.11
      - name: Install deps
        run: pip install -r src/requirements.txt
      - name: Run tests
        run: pytest -q
      - name: Build/push image
        uses: docker/build-push-action@v3
        with:
          push: true
          tags: ghcr.io/${{ github.repository }}:sha-${{ github.sha }}
```

## Container registry & release strategy

* Push images to GHCR or Docker Hub. Use tags:

  * `sha-<commit>` for CI artifacts
  * `canary` for pre-release
  * `vX.Y.Z` for semver releases

* Use image promotion (promote the same image between environments) rather than rebuilding per environment.

## Kubernetes deployment guidance

Key recommendations:

* Use Deployment + Service + Ingress (TLS) or API Gateway.
* Use readiness and liveness probes (`/ready` and `/live`).
* Use a pre-deploy Job to run migrations (`kubectl apply -f migration-job.yaml`) or run migrations from CI.
* Run workers (Celery) as a separate Deployment/StatefulSet depending on broker and scaling needs.
* Use HorizontalPodAutoscaler (HPA) and resource requests/limits.

Example `deployment` snippet (conceptual):

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8000
livenessProbe:
  httpGet:
    path: /live
    port: 8000
```

## Observability, logging, metrics & tracing

* **Logging:** structure JSON logs and write to stdout. Use `structlog` or configure Python logging accordingly.
* **Metrics:** expose Prometheus metrics using `django-prometheus` or a small `/metrics` endpoint.
* **Tracing:** instrument with OpenTelemetry (OTel), export to OTLP/Jaeger/Zipkin.
* **Health checks:** make health checks comprehensive: DB, broker, object storage (if used).
* **Dashboards & alerts:** create dashboards for request rate, p95 latency, error rate, and queue depth. Alert on failing health checks and sustained error rates.

## Security checklist for production

* Never commit `SECRET_KEY`, DB passwords, AWS keys, or any credentials.
* Ensure `DEBUG=False` and `ALLOWED_HOSTS` set for production.
* Enforce TLS at the edge and use HSTS.
* Use a secrets manager (K8s Secrets, Vault, AWS Secrets Manager) for credentials.
* Use strong password policies and rotate keys regularly.
* Scan dependencies with Dependabot or SCA tools and patch critical vulnerabilities promptly.
* Protect admin endpoints and consider IP allowlisting or VPN access for admin UIs.

## Troubleshooting & FAQ

**App fails to connect to Postgres in Docker Compose**

* Ensure `DATABASE_URL` matches the `service` name in `docker-compose.yml` (e.g., `postgres`), and that `POSTGRES_USER`/`POSTGRES_PASSWORD` match.

**Migrations fail in CI**

* Confirm CI can reach a test DB (service container or managed test DB) and that `DATABASE_URL` is set correctly in CI secrets.

**Celery tasks not executing**

* Verify broker URL (`REDIS_URL` or RabbitMQ) and that workers are running in separate containers. Check logs for connection errors.

**High latency under load**

* Profile queries, add DB indexes, add caching layer (Redis), and consider query optimization or denormalization if necessary.

## Next steps & extension points

* Add authentication examples using `djangorestframework-simplejwt` or integrate with OIDC providers (Keycloak, Auth0).
* Add feature flagging (e.g., Unleash, Flagsmith) for controlled rollouts.
* Provide Helm chart and GitOps example for automated deployments.
* Add example production-grade Nginx ingress configuration and TLS certificate automation (cert-manager).
