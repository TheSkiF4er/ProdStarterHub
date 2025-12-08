# ProdStarter — Laravel Monolith (PHP)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Production-ready Laravel monolith template. Secure defaults, asset pipeline, queue/workers (Horizon optional), observability hooks (logs/metrics/traces), reproducible container builds, and CI/CD examples.

---

## Contents

* Quickstart
* Highlights & features
* Project layout
* Prerequisites
* Installation & first run
* Configuration & secrets
* Local development (Docker & native)
* Building & assets
* Testing
* Observability (logging/metrics/tracing)
* Queues & workers
* Packaging & Docker
* CI/CD recommendations
* Deployment strategies
* Contributing
* License

---

## Quickstart

```bash
# copy template
cp -R ProdStarterHub/templates/web/laravel-monolith-php ~/projects/my-laravel-app
cd ~/projects/my-laravel-app

# install PHP deps
composer install
php artisan key:generate

# install node deps & build frontend
npm ci
npm run build

# run migrations and seed (dev)
php artisan migrate --seed

# run local server (or use Docker Compose)
php artisan serve --host=0.0.0.0 --port=8000
```

See `TUTORIAL.md` for a step-by-step developer and ops workflow.

---

## Highlights & features

* Laravel application skeleton with production-focused defaults.
* Secure HTTP middleware pre-configured: CSRF, CORS, security headers.
* Asset pipeline support (Vite/Mix) and hashed asset build output.
* Queue and worker patterns (Redis-backed queues; optional Horizon integration).
* Health checks, readiness gating and graceful shutdown hooks.
* Observability scaffolding: structured logs, Prometheus metrics integration points, and tracing hooks.
* Reproducible multi-stage Dockerfile and CI pipeline templates (optional).
* Documentation: `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`, and `template.json` for generation.

---

## Project layout

```
app/
  Console/
  Exceptions/
  Http/
    Controllers/
    Middleware/
    Requests/
  Models/
  Services/
  Jobs/
config/
database/
  migrations/
  seeders/
public/
resources/
routes/
tests/
Dockerfile
docker-compose.yml
.env.example
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json
```

Follow the principle: keep controllers thin, move business rules to `app/Services`, and encapsulate DB access in repositories when helpful.

---

## Prerequisites

* PHP 8.1+ (see `template.json` for configured target).
* Composer 2.x.
* Node.js LTS (for frontend tooling).
* Docker & Docker Compose (recommended for local parity).
* Database: PostgreSQL or MySQL and Redis for queues/sessions in production.

---

## Installation & first run

1. Copy `.env.example` to `.env` and set database credentials, mailer, and queue connection.
2. Install PHP packages: `composer install`.
3. Generate app key: `php artisan key:generate`.
4. Install Node packages: `npm ci` and build: `npm run build`.
5. Run migrations: `php artisan migrate --seed`.
6. Start the app: `php artisan serve` or using Docker Compose for parity.

Security note: never commit `.env` to version control. Use a secrets manager for production secrets.

---

## Configuration & secrets

* Use environment variables for runtime configuration (12‑factor). Document required variables in `.env.example`.
* In production, inject secrets via your platform (Kubernetes Secrets, AWS Secrets Manager, Vault, etc.).
* Provide a `php artisan config:cache` and `route:cache` in build steps to optimize runtime.

---

## Local development (Docker & native)

### Docker (recommended)

* Start supporting services: `docker compose up -d` (DB, Redis, maildev, etc.).
* Run migrations inside the container: `docker compose exec app php artisan migrate --seed`.

### Native

* Install PHP, Composer, Node locally.
* Create `.env` using `.env.example`, install deps, and use `php artisan serve` for quick iteration.

Prefer Docker for parity with staging/production.

---

## Building & assets

* Use Vite or Mix depending on template selection. `npm run dev` for hot reload; `npm run build` for production assets.
* CI should run `npm ci && npm run build` and copy build artifacts to the runtime image or upload them to a CDN (recommended).

---

## Testing

* Unit tests: `php artisan test --testsuite=Unit`.
* Feature tests: `php artisan test --testsuite=Feature`.
* Integration/E2E: use Docker Compose to bring up DB/Redis and run full test suite in CI.
* Static analysis: run PHPStan/Psalm and phpcs in CI and treat critical findings as blocking.

---

## Observability (logging/metrics/tracing)

* Logging: structured JSON logs (Monolog) to stdout. Include `service`, `env`, `version`, `request_id`.
* Metrics: integration points for Prometheus metrics (HTTP request latencies, job queue sizes). Expose `/metrics` or push to a gateway depending on infra.
* Tracing: provide hooks for OpenTelemetry/Zipkin instrumentation and ensure trace IDs are correlated with logs.

---

## Queues & workers

* Uses Redis-backed queues by default. Configure queue connections in `config/queue.php`.
* Worker / supervisor guidance: include sample Supervisor and systemd unit fragments or Kubernetes manifests for worker deployments.
* For heavy queue workloads, consider using Laravel Horizon for Redis (optional, toggle in `template.json`).

---

## Packaging & Docker

* Use the provided multi-stage Dockerfile to build a production image: builder stage installs dependencies and compiles assets; final stage contains optimized PHP-FPM + nginx or distroless runtime.
* Production build tips:

  * `composer install --no-dev --optimize-autoloader`
  * `php artisan config:cache && php artisan route:cache`
  * Use non-root user in final image and set proper file permissions for storage/cache.
  * Pin base image digests in CI and scan images with Trivy and generate SBOM (Syft).

---

## CI/CD recommendations

Suggested pipeline stages (GitHub Actions/GitLab):

1. Lint & static analysis: PHPStan / Psalm / phpcs.
2. Unit & feature tests (phpunit).
3. Build & asset pipeline (npm build).
4. Security scans (SCA, composer audit).
5. Build Docker image, SBOM, and run container image scanning.
6. Deploy to staging, run smoke tests, then rollout to production (canary/blue-green).

Automate DB migrations carefully—prefer a dedicated migration job and back up DB before schema changes.

---

## Deployment strategies

* **Kubernetes:** Deploy web and workers as separate Deployments, use Readiness and Liveness probes, and handle migrations as Jobs. Consider blue/green or canary rollouts.
* **PaaS / VM:** Use graceful draining of instances, catch-up workers, and scheduled maintenance windows for migrations.

Always test migration strategy in a staging environment that mirrors production.

---

## Contributing

Contributions welcome. Recommended flow:

1. Fork the repo and create a branch.
2. Run formatters and linters locally.
3. Add tests for new behavior and open a PR with a clear description.
4. Ensure CI passes and respond to review feedback.

See `CONTRIBUTING.md` (if present) for repository-specific guidelines.

---

## License

This template is provided under the MIT License. See `LICENSE` for details.
