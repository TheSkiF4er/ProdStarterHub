# PRODSTARTER.LARAVEL-MONOLITH-PHP — TASKS (Release Checklist)

An opinionated, actionable checklist to prepare the `laravel-monolith-php` template for production release. Use this to create issues/PRs, assign owners, and verify readiness before tagging and publishing.

> Mark items ✅ when complete. Break large items into smaller PRs. Run CI on every PR and ensure required gates pass.

---

## 0. How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Create issues for checklist items and link PRs to issues.
3. Ensure CI runs on every PR (lint, static analysis, unit tests) and gates are enforced.
4. When mandatory items are ✅ and CI is green, tag and publish a release.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (e.g., MIT, Apache-2.0).
* [ ] ✅ **Repository layout** — ensure `app/`, `config/`, `database/`, `public/`, `routes/`, `tests/`, `Dockerfile`, and docs exist and are consistent.
* [ ] ✅ **.env.example** — document required environment variables.
* [ ] ✅ **Supported platforms** — document supported PHP versions, extensions and deployment targets in `README.md`.

## 2. Build & dependency management

* [ ] ✅ **composer.json** — tidy dependencies, lock `composer.lock`, and avoid unnecessary dev deps in production.
* [ ] ✅ **Asset pipeline** — include build steps for frontend assets (Vite / Mix); verify asset digesting works in CI.
* [ ] ✅ **Reproducible builds** — pin base images, vendor installs and use `--no-dev --optimize-autoloader` in production builds.
* [ ] ✅ **Build scripts** — provide `Makefile` or scripts for common tasks (build, test, lint, docker-build).

## 3. Code quality & static analysis

* [ ] ✅ **PHPStan / Psalm** — configure static analysis and enforce in CI (baseline for existing issues if needed).
* [ ] ✅ **PHP CS Fixer / phpcs** — code style and formatting checks in CI.
* [ ] ✅ **Security scanning** — run dependency scanning in CI (SCA), address critical vulnerabilities.
* [ ] ✅ **Pre-commit hooks** — add hooks (e.g., Husky equivalent for PHP) for linting/formatting.

## 4. Configuration & secrets

* [ ] ✅ **Config validation** — provide a bootstrap check to validate critical env vars and fail fast on startup.
* [ ] ✅ **.env management guidance** — document use of `.env` for local dev and secret stores for production (Vault, AWS SSM, Secrets Manager).
* [ ] ✅ **Secret injection** — ensure production deployments use secret mounts or env injection, not checked-in files.

## 5. Security & hardening

* [ ] ✅ **HTTPS & HSTS** — ensure TLS termination at edge and HSTS header guidance in middleware.
* [ ] ✅ **HTTP hardening** — enable secure headers, CSRF protection and strict input validation.
* [ ] ✅ **Least privilege** — ensure runtime user is non-root in containers and DB credentials have minimal permissions.
* [ ] ✅ **Dependency vigilance** — schedule automated PRs for dependency updates and run tests on updates.

## 6. Observability & diagnostics

* [ ] ✅ **Structured logging** — configure Monolog to emit JSON to stdout by default; include `service`, `env`, `version`, `request_id`.
* [ ] ✅ **Correlation IDs** — generate and propagate `X-Request-Id` across requests and background jobs.
* [ ] ✅ **Metrics** — instrument request rates, latencies, job queue sizes; expose Prometheus metrics or pushgateway.
* [ ] ✅ **Tracing** — provide optional OpenTelemetry/Zipkin bootstrap and document enablement.

## 7. Database & migrations

* [ ] ✅ **Migrations** — ensure all schema changes have migrations; avoid destructive changes without compatibility plan.
* [ ] ✅ **Backups** — automate DB backup and test restore procedures; store encrypted backups offsite.
* [ ] ✅ **Zero-downtime schema changes** — document safe migration patterns (additive first, backfill, swap).

## 8. Caching & performance

* [ ] ✅ **Redis sessions & cache** — ensure session store and cache are configured for production and documented.
* [ ] ✅ **Query optimization** — profile slow queries, add indexes, and provide example monitoring dashboards.
* [ ] ✅ **CDN & asset caching** — ensure static assets served via CDN and cache-control headers are set.

## 9. Jobs, queues & workers

* [ ] ✅ **Queue adapter** — configure Redis/SQS; provide sample `worker` process configs (Supervisor / systemd / k8s deployment).
* [ ] ✅ **Idempotency** — ensure jobs are idempotent and include retry/backoff strategies.
* [ ] ✅ **Dead-letter queue** — provide DLQ handling and monitoring for poisoned jobs.

## 10. Testing

* [ ] ✅ **Unit tests** — add PHPUnit unit tests covering business logic.
* [ ] ✅ **Feature tests** — Laravel Feature tests for controllers and middleware.
* [ ] ✅ **Integration tests** — CI job to run tests against ephemeral infra (Docker Compose or testcontainers).
* [ ] ✅ **Test data** — use factories and seeded fixtures and ensure tests are deterministic.

## 11. CI/CD & release automation

* [ ] ✅ **CI pipeline** — lint, static analysis, unit tests, integration tests, and security scans.
* [ ] ✅ **Build pipeline** — composer install (no-dev), asset compile, config cache, route cache, and create image.
* [ ] ✅ **Image scanning & SBOM** — run Trivy and generate SBOM (Syft) as part of CI.
* [ ] ✅ **Deploy strategy** — provide blue/green or canary deployment examples for k8s or cloud platforms.

## 12. Containerization & runtime

* [ ] ✅ **Dockerfile** — multi-stage build with composer install and asset compilation, final runtime on php-fpm + nginx or distroless.
* [ ] ✅ **Runtime settings** — configure php.ini tuned for container resources (memory_limit, opcache, pm settings).
* [ ] ✅ **Process management** — ensure web (php-fpm) and workers are managed separately; use health probes.

## 13. Observability & runbook

* [ ] ✅ **Runbook** — include steps to collect logs, traces, metrics and run basic recovery/rollback.
* [ ] ✅ **Alerting** — define alerts for HTTP error rate, queue depth, migration failures, and CPU/memory pressure.
* [ ] ✅ **Maintenance mode** — document use of `php artisan down` and migration workflows.

## 14. Release checklist

* [ ] ✅ **All CI checks passing** (lint, tests, static analysis, security scans).
* [ ] ✅ **Artifacts built** (container image, SBOM) and checksums generated.
* [ ] ✅ **Documentation updated** (README, ARCHITECTURE, TUTORIAL, TASKS).
* [ ] ✅ **Release notes** and CHANGELOG updated.

## 15. Post-release & maintenance

* [ ] ✅ **Dependency refresh cadence** — schedule weekly/monthly updates and security scans.
* [ ] ✅ **Incident triage** — assign on-call and document escalation path.
* [ ] ✅ **Telemetry review** — monitor dashboards and run post-release review for 48–72 hours.

## 16. Optional enhancements (future)

* [ ] ✅ **Horizon integration** — provide Laravel Horizon dashboard and metrics for Redis queues.
* [ ] ✅ **Feature flags** — integrate a flagging system for safe toggles.
* [ ] ✅ **Service mesh** — add service mesh examples for advanced routing and observability.
* [ ] ✅ **Multi-region DR** — add guidance for cross-region replication and failover.

---

## How to proceed

1. Convert checklist items into issues and assign owners.
2. Use GitHub Actions / GitLab to enforce CI gates and automate builds.
3. Merge and tag a release when all mandatory items are complete and CI is green.
