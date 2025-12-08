# PRODSTARTER.LARAVEL-MONOLITH-PHP — ARCHITECTURE

> Production-ready architecture document for the `laravel-monolith-php` template. This document describes the design principles, component responsibilities, configuration, deployment, observability, security, testing, scaling and operational guidance for shipping a hardened Laravel monolith suitable for production.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout and conventions
5. Core components & responsibilities
6. Configuration, secrets & environment
7. Security best-practices
8. Performance, caching & scaling
9. Background jobs, queues & workers
10. Database & migrations
11. Logging, metrics & tracing
12. Testing strategy
13. Packaging, containerization & reproducible builds
14. CI/CD & release pipelines
15. Operational runbook & run-time tasks
16. Backups, disaster recovery & migrations
17. Upgrades, dependency management & support policy
18. Extending the template
19. References

---

## 1. Purpose & goals

This architecture describes an opinionated, production-ready Laravel monolith template intended as a starting point for teams that prefer a single, well-structured application that owns web, API and background workloads. Goals:

* Secure defaults out of the box (auth, CSRF protection, input validation, secrets handling).
* Observability: structured logs, metrics and tracing hooks.
* Reproducible builds and containerized deployments.
* Developer ergonomics: clear layout, environment parity and testability.
* Operational readiness: backups, runbooks and health checks.

## 2. Non-functional requirements

* **Availability:** Support rolling deploys with zero-downtime where possible; health/readiness checks for orchestration.
* **Security:** Minimize attack surface (up-to-date dependencies, secure headers, least privilege secrets).
* **Maintainability:** Clear separation of concerns: controllers, services, repositories and jobs.
* **Performance:** Cache aggressively where appropriate; optimize DB queries and use pagination.
* **Portability:** Runs in containers and on common cloud platforms (AWS, GCP, Azure) and on-prem.

## 3. High-level architecture

```
            +----------------------+
            |  Load Balancer/ CDN  |
            +----------+-----------+
                       |
               TLS termination (edge)
                       |
            +----------v-----------+
            |  Laravel Monolith    |  (web, api, admin)
            |  - HTTP Kernel       |
            |  - Controllers      |
            |  - Services & Repos |
            |  - Jobs (queue)     |
            +---+---+----+---------+
                |   |    |
  +-------------+   |    +-------------+
  |                 |                  |
DB (Primary)    Cache (Redis)     External APIs / Storage
  |                 |                  |
  +--------+--------+------------------+
           | Shared observability & infra |
```

Notes:

* Edge (load balancer / CDN) handles TLS termination and caching of static assets.
* App instances serve HTTP and enqueue background jobs to Redis (or alternative broker).
* Workers consume jobs and perform async tasks (emails, reports, syncs).

## 4. Project layout and conventions

Follow standard Laravel layout with opinionated additions:

```
app/
  Console/                # Artisan commands and job definitions
  Exceptions/
  Http/
    Controllers/          # Controllers: thin, delegate to services
    Middleware/
    Requests/             # FormRequests for validation
  Models/
  Services/               # Business logic, orchestrators
  Repositories/           # Data access layer (optional)
  Providers/              # Service providers
bootstrap/
config/
database/
  migrations/
  factories/
  seeders/
public/
resources/
routes/
  web.php
  api.php
tests/
  Feature/
  Unit/
.env.example
Dockerfile
docker-compose.yml (dev)
.ci/ (pipeline templates)
README.md
ARCHITECTURE.md
TASKS.md
TUTORIAL.md
```

Conventions:

* Use FormRequest classes for validation and authorization on incoming requests.
* Keep controllers minimal: map request → service call → resource response.
* Services encapsulate business rules; repositories wrap database queries and are easy to mock.

## 5. Core components & responsibilities

### HTTP layer (Kernel, Middleware)

* Manage middleware stack: rate-limiting, authentication, authorization, CSRF, TrustedProxies, CORS, and request logging.
* Add a readiness middleware that returns 503 when the app is not fully initialized.

### Controllers

* Thin controllers that validate requests (FormRequests), call service layer and return resources (API Resources / JSON responses).

### Services / Domain logic

* Encapsulate business rules, orchestrate calls to repositories and external APIs. Keep side effects (I/O) isolated.

### Repositories / Eloquent models

* Provide a data access abstraction. Use Eloquent where convenient; for complex queries or performance-sensitive paths, use raw queries or query builder and consider read replicas.

### Jobs & Queues

* Jobs handle background tasks. Jobs should be idempotent and retry-safe. Use queues (Redis/Beanstalk/SQS) and configure retry strategies.

### Providers & Bootstrapping

* Register service providers for telemetry, exception handling, and feature toggles during bootstrap.

## 6. Configuration, secrets & environment

Principles:

* Follow 12-factor app: configuration in environment variables.
* Keep `.env` out of VCS. Provide `.env.example` to document required variables.
* Use a secrets manager in production (AWS Secrets Manager, Parameter Store, HashiCorp Vault, or cloud KMS) and inject secrets via orchestration.

Config organization:

* Centralize runtime configuration in `config/*.php` files and validate at startup where possible.
* Keep feature flags and third-party credentials in env or a protected store.

Secrets lifecycle:

* Use short-lived credentials where possible and rotate regularly.
* Do not log secrets. Use secret redaction in logs and error pages.

## 7. Security best-practices

* **Keep dependencies updated:** run `composer audit` or SCA in CI; pin versions. Run scheduled dependency updates and tests.
* **HTTPS everywhere:** terminate TLS at edge; enforce `RedirectToHttps` and HSTS headers.
* **HTTP security headers:** `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`.
* **CSRF protection:** enabled for web routes; use stateless tokens for API (JWT/Personal Access Tokens) with short TTL.
* **Authentication & Authorization:** centralize logic, prefer Laravel Gates/Policies, and avoid embedding auth logic in controllers.
* **Input validation:** use FormRequests and server-side validation for all user inputs.
* **Least privilege:** run application as non-root in containers and limit DB user privileges (use separate users for migrations vs runtime if needed).
* **File uploads:** validate file types and sizes and store uploads outside webroot (S3 or protected storage).

## 8. Performance, caching & scaling

Caching strategies:

* **HTTP caching:** use CDN for static assets, and cache GET responses where safe with proper cache-control headers and cache keys.
* **Application caching:** use Redis to cache computed results, sessions, and rate-limiting counters. Set sensible TTLs and use cache tags if convenient.
* **Query caching:** cache expensive query results, but ensure invalidation on writes.

Database scaling:

* Use read replicas for read-heavy workloads; implement read/write split at repository layer or via Doctrine packages.
* Optimize indexes and use EXPLAIN to analyze slow queries.

Horizontal scaling:

* App is stateless: scale web instances behind a load balancer. Use sticky sessions only if necessary; prefer session store in Redis.
* Workers scale separately for queue processing.

Resource limits:

* Define CPU/memory requests and limits in Kubernetes; tune PHP-FPM / Supervisor settings according to container size.

## 9. Background jobs, queues & workers

* Use Laravel Queue with Redis or SQS depending on environment needs.
* Worker process management: run `php artisan queue:work` under a process manager (supervisord) or use Laravel Horizon for Redis (provides dashboard & metrics).
* Job design:

  * Make jobs idempotent.
  * Implement exponential backoff and dead-letter queues for poisoned messages.
  * Use rate-limited job dispatch if hitting third-party APIs.

## 10. Database & migrations

* Use migrations for schema evolution and seeders for initial data.
* Run migrations in controlled manner during deploys: either via dedicated migration job (pre-deploy) or as part of a release step with maintenance mode.
* Backwards-compatible schema changes: apply additive changes first (new columns, nullable), deploy code that uses them, then prune old fields later to avoid downtime.
* Use versioned database backups and run restore exercises periodically.

## 11. Logging, metrics & tracing

Logging:

* Structured JSON logs (Monolog) to stdout for collectors. Include fields: `service`, `env`, `version`, `request_id`, `user_id` (when available).
* Log levels: DEBUG in staging, INFO in production by default. Avoid verbose logging in hot paths.
* Redact sensitive fields in logs (passwords, tokens).

Metrics:

* Export application metrics using Prometheus client (PHP Prometheus or pushgateway pattern). Instrument:

  * HTTP request rate, latency (histograms), and error rates;
  * Job queue lengths and processing latencies;
  * Database connection pool metrics and cache hit/miss rates.

Tracing:

* Integrate OpenTelemetry or Zipkin via a PHP tracer to capture distributed traces for slow requests and background jobs.
* Correlate traces with logs using `trace_id` and with metrics using labels.

## 12. Testing strategy

Levels:

* **Unit tests:** test services, helpers, and model logic. Keep database interactions mocked or use in-memory DB.
* **Feature tests:** use Laravel's feature testing utilities to exercise controllers with real middleware and database transactions (refresh database in tests using sqlite or testcontainers).
* **Integration tests:** spin up real infra (DB, Redis) via Docker Compose or ephemeral environments and run suites that exercise end-to-end flows.
* **Acceptance/E2E:** run in an environment that mirrors production (staging k8s) and perform smoke tests.

CI test policy:

* Run fast unit and lint checks on PRs. Run longer integration/E2E on merge or scheduled pipelines.
* Use database snapshots for deterministic integration tests where feasible.

## 13. Packaging, containerization & reproducible builds

Container image builds:

* Use multi-stage Dockerfile: builder stage installs composer deps and builds assets (mix/webpack), final stage uses minimal PHP-FPM + nginx or distroless PHP base.
* Pin base image digests in CI, and cache composer install layer by copying `composer.lock` first.
* Vendor directory: prefer `composer install --no-dev --optimize-autoloader` in production builds.

Asset compilation:

* Compile frontend assets with Laravel Mix or Vite in the build stage and serve them from CDN or `public/`.

Immutable artifacts:

* Produce tagged images with semantic versions and include SBOM (Syft) and vulnerability scans (Trivy) in CI.

## 14. CI/CD & release pipelines

Suggested pipeline stages (GitHub Actions/GitLab/Jenkins):

1. **Static checks:** PHPStan, Psalm, phpcs, ESLint for frontend.
2. **Unit tests:** run phpunit with coverage.
3. **Build:** composer install, compile assets, run artisan commands (config:cache, route:cache).
4. **Security scans:** SCA & composer audit.
5. **Package & image:** build Docker image, generate SBOM, run Trivy.
6. **Integration tests:** optional stage that deploys to ephemeral infra and runs tests.
7. **Deploy:** rollout via Kubernetes/Cloud Run/VMs with canary or blue/green strategies.

Deployment strategies:

* Prefer blue/green or canary deployments to enable safe rollbacks. Use health checks and readiness probes to manage traffic switching.
* Automate database migrations with care: run migrations in a controlled step that is reversible if possible.

## 15. Operational runbook & run-time tasks

Runbook should include:

* **Startup checks:** verify app responds on `/healthz`, DB connectivity, Redis connectivity, queues length and worker status.
* **Incident triage:** collect recent logs, traces and metrics, identify user impact and rollback plan.
* **Scaling:** steps to increase instance count or worker count, and guidance on resource limits.
* **Maintenance:** how to put app into maintenance mode (`php artisan down`) and bring it back up.

Common commands:

* `php artisan migrate --force`
* `php artisan queue:restart`
* `php artisan config:cache && php artisan route:cache`

## 16. Backups, disaster recovery & migrations

Backups:

* Automate DB backups (daily incremental + weekly full) and test restores regularly.
* Backup object storage metadata and ensure S3-like storage is replicated if needed.
* Store backups in a different availability zone/region and with proper encryption.

Recovery:

* Document RTO/RPO targets and test runbooks for restores.
* Have a rollback plan for schema changes incompatible with older code.

## 17. Upgrades, dependency management & support policy

* Schedule regular dependency updates and use Dependabot or Renovate for PRs.
* Maintain a supported PHP version policy (e.g., support last two LTS releases) and plan upgrades ahead of EOL.
* Run minimal test matrix for PHP versions in CI and validate before upgrading production runtime.

## 18. Extending the template

Possible extensions:

* Add Laravel Horizon for Redis queue monitoring and UI.
* Add service mesh integration (e.g., Istio) for advanced traffic control.
* Implement feature flags (LaunchDarkly, Unleash) for controlled rollouts.
* Offer multi-tenant support via schema-per-tenant or row-level separation patterns.

## 19. References

* Laravel official docs — [https://laravel.com/docs](https://laravel.com/docs)
* Laravel Horizon — [https://laravel.com/docs/horizon](https://laravel.com/docs/horizon)
* OpenTelemetry PHP — [https://opentelemetry.io/](https://opentelemetry.io/)
* Composer best practices & security
* Twelve-Factor App methodology

---

This `ARCHITECTURE.md` aims to be an actionable, opinionated guide enabling teams to bootstrap a production-grade Laravel monolith using secure, observable and maintainable practices. Adapt the recommendations to your team's constraints and cloud provider.
