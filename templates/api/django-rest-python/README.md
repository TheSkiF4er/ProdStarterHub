# ProdStarter — Django REST Service (Python)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Template](https://img.shields.io/badge/template-prodstarter--django-green)](template.json)

> Production-ready Django REST template providing an opinionated, secure, and scalable baseline: Django + Django REST Framework (DRF), Celery scaffold, Docker & docker-compose, health checks, observability, and CI/CD recommendations.

---

## Contents

* [Quickstart](#quickstart)
* [Features](#features)
* [Project layout](#project-layout)
* [Getting started (local dev)](#getting-started-local-dev)
* [Docker & docker-compose](#docker--docker-compose)
* [Configuration](#configuration)
* [Health checks & observability](#health-checks--observability)
* [Security](#security)
* [Testing](#testing)
* [CI/CD & release recommendations](#cicd--release-recommendations)
* [Kubernetes & production deployment](#kubernetes--production-deployment)
* [Template variables & customization](#template-variables--customization)
* [Contributing](#contributing)
* [License](#license)

---

## Quickstart

Clone or copy the template and run the service locally with Docker or virtual environment.

```bash
# Clone template
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/django-rest-python

# Copy to a working folder
mkdir ~/projects/my-django-service && cp -R . ~/projects/my-django-service
cd ~/projects/my-django-service

# Optional: replace placeholder package name 'prodstarter_django' with your project name
# Local dev with venv
python -m venv .venv
source .venv/bin/activate
pip install -r src/requirements.txt
cd src
python manage.py migrate
python manage.py runserver

# Or with Docker-compose
docker-compose up --build
```

Visit `http://localhost:8000` and check health endpoints (`/healthz`, `/ready`, `/live`) and API docs (e.g., `/swagger/` in dev).

---

## Features

* Production-focused defaults: secure settings, non-root container user, HSTS and HTTPS guidance.
* Django REST Framework scaffold with example endpoints and serializers.
* Celery scaffold (optional) with tasks and recommended broker/backends.
* Health checks: `/healthz`, `/ready`, `/live`.
* Observability: structured JSON logging, metrics/Prometheus hooks, OpenTelemetry optional scaffolding.
* Docker multi-stage build and docker-compose for local development.
* Template metadata (`template.json`) for automation and generator integration.
* CI/CD recommendations and sample GitHub Actions (optional).

---

## Project layout

```
project_root/
├── src/
│   ├── manage.py
│   ├── prodstarter_django/     # Django project (replaceable token)
│   │   ├── settings/           # settings base/dev/prod
│   │   ├── apps/               # django apps (api, users, core)
│   │   └── ...
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── k8s/                        # optional kubernetes manifests / helm
├── tests/                      # unit & integration tests
├── ARCHITECTURE.md
├── TUTORIAL.md
├── TASKS.md
├── template.json
└── README.md
```

Notes:

* Replace `prodstarter_django` with the chosen package name. The template includes `template.json` replace rules to automate this.
* Keep `src/` as the Python package root to simplify Docker and CI paths.

---

## Getting started (local dev)

### Using a virtual environment

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r src/requirements.txt
cd src
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### Using Docker-compose

```bash
docker-compose up --build
# then run migrations inside the web container
docker-compose exec web python manage.py migrate
```

Stop and clean up:

```bash
docker-compose down -v
```

---

## Docker & docker-compose

The template includes a production-ready multi-stage `Dockerfile` and a `docker-compose.yml` for development with Postgres and Redis. Key recommendations:

* Use multi-stage builds to keep the final image minimal.
* Run the app as a non-root user in production images.
* Use environment variables and secrets mounted from the host in dev or via platform secret stores in production.

Example build/run:

```bash
docker build -t myservice:dev -f src/Dockerfile src/
docker run --rm -e DJANGO_SETTINGS_MODULE=prodstarter_django.settings.development -p 8000:8000 myservice:dev
```

---

## Configuration

Configuration is layered: base settings < environment-specific settings < environment variables.

Important environment variables:

* `DJANGO_SETTINGS_MODULE` - e.g. `prodstarter_django.settings.development` or `...production`
* `DATABASE_URL` - canonical DB URL (Postgres recommended)
* `SECRET_KEY` - required in production
* `DEBUG` - `False` in production
* `ALLOWED_HOSTS` - comma-separated hosts
* `REDIS_URL` - for Celery broker / cache
* `S3_*` - if using object storage for static/media

Use `.env` files for local development (never commit them) and platform-managed secrets for production.

---

## Health checks & observability

* Health endpoints: `/healthz`, `/ready`, `/live` - ensure these are integrated with your orchestrator.
* Logging: structured JSON logs to stdout for ingestion by ELK/Loki/Datadog.
* Metrics: optional Prometheus metrics via `django-prometheus` or a custom `/metrics` endpoint.
* Tracing: optional OpenTelemetry instrumentation; configure exporters via env vars.

---

## Security

* Do not commit secrets. Use a secrets manager (K8s Secrets, Vault, AWS Secrets Manager).
* Ensure `DEBUG=False` and set `ALLOWED_HOSTS` in production.
* Enable HTTPS at the edge (load balancer) and HSTS for production.
* Secure admin interface (limit access by IP or use an SSO protective layer).
* Use `djangorestframework-simplejwt` or an external OIDC provider for auth.
* Use Dependabot or similar for dependency vulnerability tracking.

---

## Testing

The template includes `pytest` scaffolding (if enabled). Run tests:

```bash
# From repo root
pytest -q
# Run unit tests only
pytest tests/unit
# Integration tests (may require services)
pytest tests/integration
```

Use Testcontainers or service-containers in CI for reliable integration testing.

---

## CI/CD & release recommendations

* Lint, type-check, and run tests in CI. Use `ruff`, `black`, `isort`, and `mypy` as appropriate.
* Build container images and push to a registry (GHCR, Docker Hub, or private registry).
* Run smoke tests against the pushed image before promoting to staging/production.
* Use semantic versioning for templates and image tags; promote the same immutable image across environments.
* Use a migration Job (CI or k8s Job) to apply DB migrations before switching traffic to new replicas.

---

## Kubernetes & production deployment

Key recommendations:

* Deploy with a Deployment, Service, and Ingress (or API Gateway).
* Provide readiness and liveness probes to `/ready` and `/live`.
* Use resource requests and limits and configure HPA.
* Run Celery workers as a separate Deployment with proper scaling.
* Use secure Secrets and ConfigMaps; do not store secrets in Git.

---

## Template variables & customization

See `template.json` for supported variables: `ProjectName`, `Author`, `Company`, `License`, `PythonVersion`, `IncludeDocker`, `IncludeCelery`, `IncludeOpenTelemetry`, `IncludeGithubActions`, etc. Replace the package token `prodstarter_django` when scaffolding.

---

## Contributing

Contributions welcome! Please follow the usual flow:

1. Fork and create a feature branch.
2. Run linters and tests locally.
3. Open a pull request with a clear description and link to related TASKS items.
4. Ensure CI passes and reviewers approve before merging.

See `CONTRIBUTING.md` (if present) for more details.

---

## License

This template is distributed under the MIT License. See `LICENSE` for details.
