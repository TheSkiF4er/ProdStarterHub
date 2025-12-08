# PRODSTARTER.LARAVEL-MONOLITH-PHP — TUTORIAL

This tutorial guides you through bootstrapping, developing, testing, building, and operating the `laravel-monolith-php` template from **ProdStarterHub**. It emphasizes production-grade practices: secure defaults, reproducible builds, migrations strategy, background jobs, observability, graceful deploys, and incident readiness.

> Audience: Laravel developers, DevOps and SREs responsible for building and operating production monoliths.

---

## Table of contents

1. Prerequisites
2. Scaffold & initial repo setup
3. Local development environment
4. Project layout and responsibilities
5. Configuration and secrets management
6. Running the app locally (artisan, queues, workers)
7. Database migrations and backwards-compatible changes
8. Asset pipeline (Vite / Mix) and static assets
9. Testing strategy (unit, feature, integration, e2e)
10. Building production artifacts and container images
11. CI/CD pipeline recommendations (GitHub Actions example)
12. Deploy strategies (k8s, VM, PaaS) and zero-downtime deploys
13. Observability: logging, metrics, tracing and dashboards
14. Backup, restore and disaster recovery exercises
15. Troubleshooting & common issues
16. Release checklist
17. Next steps & extensions

---

## 1. Prerequisites

* PHP 8.1+ (follow the `ARCHITECTURE.md` to pin supported versions).
* Composer 2.x.
* Node.js (LTS) for asset pipeline (Vite/Mix).
* Docker (for local ephemeral infra and CI).
* A relational DB (Postgres or MySQL) and Redis for sessions/queues in real deployments.

Optional:

* Laravel Sail for local Docker-based development.
* Laravel Horizon for queue monitoring (Redis).

---

## 2. Scaffold & initial repo setup

1. Copy the template and create a new repository:

```bash
cp -R ProdStarterHub/templates/web/laravel-monolith-php ~/projects/my-laravel-app
cd ~/projects/my-laravel-app
git init
git checkout -b feature/initial
```

2. Create `.env` from `.env.example` and configure local DB/Redis credentials for development.

3. Install PHP dependencies:

```bash
composer install
php artisan key:generate
```

4. Install Node dependencies and build frontend assets:

```bash
npm ci
npm run dev    # development watch
# or
npm run build  # production build
```

5. Run database migrations and seeders for a first run:

```bash
php artisan migrate --seed
```

---

## 3. Local development environment

Options:

* **Native**: install PHP, Composer, Node locally and use local DB/Redis. Fast iteration but environment drift risk.
* **Docker (recommended)**: use Docker Compose or Laravel Sail for environment parity. Example `docker-compose up -d` brings up DB, Redis and the app.

Recommended local commands (with Docker Compose):

```bash
# start services
docker compose up -d
# run migrations
docker compose exec app php artisan migrate --seed
# tail logs
docker compose logs -f
```

Developer tips:

* Use Tinker (`php artisan tinker`) to explore models and quick experiments.
* Use `php artisan test` to run PHPUnit tests.
* Use `artisan serve` only for quick demos; prefer PHP-FPM + nginx or Docker in production parity testing.

---

## 4. Project layout and responsibilities

Review `ARCHITECTURE.md` for the canonical layout. Quick recap:

* `app/Http/Controllers` — controllers should be thin and delegate to services.
* `app/Services` — business logic and orchestration.
* `app/Repositories` — data access abstractions (optional).
* `app/Jobs` & `app/Console` — queued jobs and artisan commands.
* `routes/` — route definition separated for web and api.
* `resources/` & `public/` — frontend assets and compiled assets.
* `tests/` — unit & feature test suites.

Keep domain logic out of controllers for testability and reusability.

---

## 5. Configuration and secrets management

* Use `.env` for local development only; do not commit secrets. Maintain `.env.example` to document required envs.
* In production, use a secrets manager or environment injection (Kubernetes Secrets, AWS Secrets Manager, Vault).
* Validate critical config at startup (database URLs, app key, queue connection) and exit with actionable error messages if missing.
* Example: implement a `config:validate` artisan command that checks required envs and prints warnings/errors.

---

## 6. Running the app locally (artisan, queues, workers)

Start web server (Docker):

```bash
docker compose up -d nginx php
```

Run workers locally (in separate terminal or process manager):

```bash
# start a single worker
php artisan queue:work --sleep=3 --tries=3 --timeout=90
# run Horizon (recommended for Redis)
php artisan horizon
```

Run scheduled tasks:

```bash
# for cron-less environments, use scheduler in docker or run every minute
php artisan schedule:run
```

Use Supervisor in production or Kubernetes Jobs/CronJobs for scheduled tasks and process management.

---

## 7. Database migrations and backwards-compatible changes

Principles for safe migrations:

1. Deploy code that supports both old and new schemas (additive changes first).
2. Backfill data in production if new non-nullable fields are introduced -- do it in a separate, idempotent job.
3. Switch traffic to new code that uses the new column.
4. Remove legacy columns in a later release after confident observation.

Migration workflow:

```bash
# create migration
php artisan make:migration add_xxx_to_table --table=xxx
# run locally
php artisan migrate
# in CI: run migrations in a dedicated migration job before switching traffic
```

Database versioning and rollback:

* Avoid destructive automatic rollbacks in production. Use tested rollback scripts and backup before migrations.

---

## 8. Asset pipeline (Vite / Mix) and static assets

* Use **Vite** (Laravel Breeze / Jetstream) or **Laravel Mix** depending on template. Configure build scripts in `package.json`:

```json
"scripts": {
  "dev": "vite",
  "build": "vite build"
}
```

* In CI, run `npm ci && npm run build` and copy `public/build` into the final image. Prefer uploading static assets to a CDN (S3 + CloudFront) for production.
* Use hashed filenames for cache busting; serve assets with long `Cache-Control` and leverage CDN invalidation on deploy.

---

## 9. Testing strategy (unit, feature, integration, e2e)

* **Unit tests**: test models, services, and small helpers. Use mocking for external services.
* **Feature tests**: test controllers/routes with `Illuminate\Foundation\Testing\RefreshDatabase` in-memory sqlite or a test DB.
* **Integration tests**: spin up DB and Redis via Docker Compose in CI to test end-to-end flows.
* **E2E / Smoke tests**: run post-deploy tests against staging/production (health endpoints, key user flows).

Local test commands:

```bash
php artisan test
# or
vendor/bin/phpunit --testsuite=Feature
```

CI recommendations:

* Run unit and static checks on PRs; run longer integration/E2E on merge to main or on a schedule.

---

## 10. Building production artifacts and container images

Multi-stage Dockerfile pattern:

1. **Builder stage**: install composer deps, build front-end assets, run tests.
2. **Runtime stage**: copy built vendor, compiled assets and optimized configs; use php-fpm + nginx or a minimal runtime.

Example build steps for production image:

```bash
# in CI
docker build -t registry/myorg/myapp:${VERSION} .
# push
docker push registry/myorg/myapp:${VERSION}
```

Docker best practices:

* Use `composer install --no-dev --optimize-autoloader`.
* Cache `composer.lock` layer to speed CI builds.
* Remove build-time secrets and dev-only files from final image.
* Run final image as non-root user and set `healthcheck` for container runtime.

---

## 11. CI/CD pipeline recommendations (GitHub Actions example)

Suggested pipeline stages:

1. **Lint & Static checks**: PHPStan/Psalm, phpcs.
2. **Unit tests**: phpunit with coverage.
3. **Build**: composer install, asset build, run tests again.
4. **Security scans**: SCA, composer audit.
5. **Image build & scan**: build Docker image, generate SBOM (Syft), run Trivy.
6. **Deploy to staging**: run smoke tests.
7. **Deploy to production**: controlled rollout (canary/blue-green).

Example GitHub Actions job snippet (build & test):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
          extensions: mbstring, pdo_mysql, redis
      - name: Install composer deps
        run: composer install --no-progress --no-suggest --prefer-dist
      - name: Run static analysis
        run: vendor/bin/phpstan analyse
      - name: Run tests
        run: vendor/bin/phpunit --configuration phpunit.xml
      - name: Build assets
        run: npm ci && npm run build
```

---

## 12. Deploy strategies (k8s, VM, PaaS) and zero-downtime deploys

### Kubernetes (recommended for scale)

* Use Deployments for web pods and separate Deployment/StatefulSet for workers.
* Use `readinessProbe` and `livenessProbe` for traffic control.
* Implement rolling update strategy and consider blue/green or canary releases for critical changes.
* Run migrations as a separate pre-deploy job; ensure migration job completes before new pods serve traffic.

### VMs / PaaS

* Use feature-based deploys with a load balancer; drain instances before upgrade and run migrations in a controlled window.

Zero-downtime tips:

* Prefer non-blocking migrations.
* Warm workers and caches before switching traffic.
* Use health checks and automated rollback on failure thresholds.

---

## 13. Observability: logging, metrics, tracing and dashboards

### Logging

* Emit structured JSON logs via Monolog to stdout; ingest into ELK/Loki/Datadog.
* Include `request_id`, `user_id` (if available), `trace_id` and `service` metadata.

### Metrics

* Export Prometheus metrics: request counts, latency histograms, DB pool usage, queue depth and worker throughput.
* Expose `/metrics` endpoint or use pushgateway depending on infrastructure.

### Tracing

* Integrate OpenTelemetry or a PHP-compatible tracer to correlate traces between web requests and background jobs.
* Link traces to logs via `trace_id` and surface slow traces in dashboards.

Dashboards & alerts:

* Define alerts for error rate spikes, latency p95/p99 regressions, queue backlog and failed migrations.

---

## 14. Backup, restore and disaster recovery exercises

* Automate daily DB backups and retain rotated snapshots longer-term.
* Test restores from backups quarterly.
* Backup uploaded files and store them in durable object storage (S3) with lifecycle policies.
* Document RTO/RPO targets and test recovery runbooks.

---

## 15. Troubleshooting & common issues

* **App fails to boot**: check `.env` and missing `APP_KEY`, DB connectivity and storage mounts.
* **Long-running migrations**: schedule during maintenance windows and consider breaking into smaller changes.
* **Queue backlog**: scale workers, inspect failed jobs and DLQ, and ensure third-party API limits are respected.
* **Slow queries**: enable slow query logging and use EXPLAIN to optimize indexes and queries.
* **Memory leaks**: monitor memory, use short lived worker processes or restarts and profile with Blackfire or Xdebug.

---

## 16. Release checklist

* [ ] CI green (lint, static analysis, unit tests).
* [ ] Security scans (SCA, Trivy) pass or issues triaged.
* [ ] Assets built and uploaded to CDN (if applicable).
* [ ] Database backup taken before migration.
* [ ] Migrations executed in a controlled manner and verified.
* [ ] Health checks and smoke tests passed on staging.
* [ ] Monitoring and alerting configured for the release.
* [ ] Release notes and changelog updated.

---

## 17. Next steps & extensions

* Add Laravel Horizon and dashboards for queue metrics.
* Implement feature flags for gradual rollouts.
* Provide Helm charts for Kubernetes deployment with sensible resource defaults.
* Add chaos testing scenarios to validate resilience under failures.
