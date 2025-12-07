# ProdStarter — Node.js Express Service

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Template](template.json)](template.json)

> Production-ready Node.js + Express template with structured logging, Prometheus metrics, health checks, OpenAPI support, background worker scaffolding (BullMQ), and deployment best-practices.

---

## Contents

* Quickstart
* Highlights & features
* Project layout
* Configuration & environment variables
* Run locally (dev)
* Docker & docker-compose
* Health checks, metrics & observability
* Background jobs & queues
* Security
* Testing
* CI/CD recommendations
* Kubernetes & production deployment
* Template variables & customization
* Contributing
* License

---

## Quickstart

1. Copy the template into your workspace:

```bash
cp -R ProdStarterHub/templates/api/node-express-javascript ~/projects/my-express-service
cd ~/projects/my-express-service
```

2. Install dependencies and run locally:

```bash
npm ci
npm run start:dev
```

3. Open:

* API root: `http://localhost:3000/api/v1/`
* Health: `http://localhost:3000/health`
* Metrics: `http://localhost:3000/metrics`
* Swagger UI (dev only, if enabled): `http://localhost:3000/docs`

---

## Highlights & features

* App factory pattern (`createApp`) for testability and programmatic lifecycle control.
* Structured JSON logging using `pino` (stdout-friendly).
* Prometheus metrics (`/metrics`) with request counters and histograms.
* Health endpoints: `/health`, `/live`, `/ready` for orchestration probes.
* Security middlewares: `helmet`, `cors`, request size limits and rate limiting.
* Graceful startup/shutdown with dependency lifecycle hooks.
* Optional Swagger UI support when `openapi.json` is present and enabled in dev.
* BullMQ worker scaffolding for background tasks (optional).
* Template metadata (`template.json`) to support automated scaffolding.

---

## Project layout

```
project_root/
├── src/
│   ├── index.js            # app entrypoint (createApp, start, shutdown)
│   ├── app/                # routers, controllers, services
│   ├── middleware/         # correlation id, logging, validation
│   ├── db/                 # db client adapters
│   ├── workers/            # background workers and jobs
│   └── utils/              # helpers and error types
├── test/                   # unit & integration tests
├── Dockerfile
├── docker-compose.yml
├── openapi.json            # optional
├── .env.example
├── package.json
├── ARCHITECTURE.md
├── TUTORIAL.md
├── TASKS.md
└── README.md
```

---

## Configuration & environment variables

Configuration follows 12-factor principles. The template reads from environment variables (with optional `.env` during local dev). Key variables:

* `NODE_ENV` — `development` / `production` / `test`
* `PORT` — HTTP port (default `3000`)
* `SERVICE_NAME` — service name used in logs/metrics
* `DATABASE_DSN` — database connection string (Postgres/Mongo)
* `REDIS_URL` — Redis connection for cache & queues
* `CORS_ORIGINS` — comma-separated allowed origins
* `SWAGGER_ENABLED` — `true` to enable Swagger UI (dev only)
* `LOG_LEVEL` — `info`/`debug`/`warn`
* `RATE_LIMIT_MAX`, `RATE_LIMIT_WINDOW_MS` — rate limiting settings

Never commit secrets (use platform secret stores in production).

---

## Run locally (dev)

Install dependencies and run with nodemon for live reload:

```bash
npm ci
npm run start:dev
```

Run tests:

```bash
npm test
```

Use `supertest` or `http` clients for programmatic route tests; the app factory allows `createApp()` to be used in tests without starting real network listeners.

---

## Docker & docker-compose

A multi-stage `Dockerfile` and `docker-compose.yml` are included for development stacks (app + Postgres + Redis). Recommendations:

* Use multi-stage builds to reduce final image size.
* Run the container as non-root in production images.
* Provide secrets via environment variables or mounted secrets, never via committed files.

Build and run:

```bash
docker build -t my-express-service:dev .
docker run --rm -e NODE_ENV=development -p 3000:3000 my-express-service:dev
# or with docker-compose
docker-compose up --build
```

---

## Health checks, metrics & observability

* Health: `/health` (composite), `/live` (liveness), `/ready` (readiness). Map these to Kubernetes probes.
* Metrics: `/metrics` (Prometheus) with default Node metrics and HTTP request metrics.
* Logging: structured JSON logs to stdout via `pino` for easy ingestion.
* Tracing: optional OpenTelemetry bootstrap points included; enable via env to export traces to OTLP/Jaeger.

Protect `/metrics` and `/docs` in production (network restrictions or auth).

---

## Background jobs & queues

* BullMQ scaffolding provided for Redis-backed background jobs.
* Run workers as separate processes/containers to scale independently.
* Implement idempotent jobs and configure retry/backoff and a dead-letter queue for poisoned messages.
* Monitor queue metrics (length, failed jobs) and expose to Prometheus.

---

## Security

* Enforce `NODE_ENV=production` in release builds and disable dev-only features (Swagger UI).
* Use `helmet` to set secure headers and enable `CORS` with restricted origins in production.
* Protect sensitive endpoints and metrics from public access.
* Validate environment variables at startup and fail fast if required secrets are missing.
* Enable dependency scanning (Dependabot/Snyk) and patch high/critical findings promptly.

---

## Testing

* Unit tests with `jest` and integration tests with `supertest` or dockerized dependencies.
* Use Testcontainers or `docker-compose` to run ephemeral databases and queues in CI for reliable integration tests.
* Add smoke tests in CI that deploy the built image to an ephemeral environment, check `/ready` and basic routes.

---

## CI/CD recommendations

* CI pipeline should include: lint (`eslint`/`prettier`), unit tests, integration tests, and security scans.
* Build and push Docker images to a registry (GHCR, Docker Hub) tagged with `sha-<commit>` and semantic versions.
* Run migrations as a dedicated CI/CD step or Kubernetes Job before routing traffic to new releases.
* Deploy using immutable images and promote the same image between environments. Use canary or blue/green strategies for safe rollouts.

---

## Kubernetes & production deployment

* Deploy as a Deployment + Service behind an Ingress or API Gateway.
* Use readiness (`/ready`) and liveness (`/live`) probes and configure resource requests/limits and an HPA.
* Store secrets in Kubernetes Secrets or an external secret manager and mount/inject at runtime.
* Run migrations as a pre-deploy Job. Use PodDisruptionBudget and configure RBAC for runtime jobs.

---

## Template variables & customization

`template.json` contains scaffold variables (project name, node version, feature flags for Docker, BullMQ, OpenTelemetry, GitHub Actions and tests). Use these to automate project creation and token replacement.

---

## Contributing

Contributions welcome. Suggested flow:

1. Fork and create a feature branch.
2. Run linters and tests locally.
3. Open a pull request referencing the appropriate items in `TASKS.md`.
4. Ensure CI passes and reviewers approve before merging.

---

## License

This template is distributed under the MIT License. See `LICENSE` for details.
