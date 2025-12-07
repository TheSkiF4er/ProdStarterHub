# PRODSTARTER.FASTAPI — TASKS (Release Checklist)

Comprehensive, opinionated checklist and actionable tasks to prepare the `fastapi-python-api` template for production release. Use this document to track work, open PRs, and verify readiness.

> Mark items ✅ when complete. Break large tasks into focused PRs and reference checklist items in PR descriptions.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, features, links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (e.g., MIT, Apache-2.0).
* [ ] ✅ **Project structure** — ensure `app/`, `tests/`, `Dockerfile`, `docker-compose.yml`, `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`, and `template.json` (if applicable) exist and are consistent.
* [ ] ✅ **Supported runtime versions** — document Python versions (e.g., 3.11+) and dependency pinning in requirements/pyproject.

## 2. Code quality & formatting

* [ ] ✅ **Linters & formatters** — configure and pass `ruff`/`flake8`, `black`, and `isort`.
* [ ] ✅ **Static typing** — add `mypy` or a type-check strategy for critical modules.
* [ ] ✅ **Pre-commit** — enable `pre-commit` hooks (format, lint, safety checks).
* [ ] ✅ **Code documentation** — module docstrings, API endpoint summaries, and OpenAPI descriptions.

## 3. Configuration & environment

* [ ] ✅ **Typed settings** — Pydantic `BaseSettings` in `config` with sensible defaults and `.env` support.
* [ ] ✅ **12-factor compliance** — externalize config; no secrets in source.
* [ ] ✅ **Environment docs** — document required env vars: `ENVIRONMENT`, `DATABASE_DSN`, `REDIS_DSN`, `SECRET_KEY`, `CORS_ORIGINS`, `OTEL_*`, etc.
* [ ] ✅ **Config validation** — validate required settings on startup and fail fast if missing or invalid.

## 4. Security & secrets

* [ ] ✅ **No secrets in repo** — scan repository with `git-secrets`, `truffleHog`, or `detect-secrets`.
* [ ] ✅ **Secure defaults** — `DEBUG=False` for production, Trusted Host and allowed origins configured.
* [ ] ✅ **Secret management** — document and integrate with Vault / K8s Secrets / cloud secret managers.
* [ ] ✅ **Transport security** — TLS termination at edge; ensure HSTS guidance is present.
* [ ] ✅ **Auth skeleton** — include JWT/OIDC placeholders or integration guidance and protect sensitive routes.
* [ ] ✅ **Dependency scanning** — enable Dependabot or SCA and address high/critical findings.
* [ ] ✅ **Rate limiting** — guidance for API Gateway rate limits; optional in-app throttling middleware.

## 5. Logging, observability & telemetry

* [ ] ✅ **Structured logging** — `structlog` or json logging configured; logs to stdout.
* [ ] ✅ **Correlation IDs** — middleware for request IDs and propagation across services.
* [ ] ✅ **Metrics** — Prometheus `/metrics` endpoint enabled and tested; expose request counters and latency.
* [ ] ✅ **Tracing** — OpenTelemetry initialization example and docs for OTLP exporter.
* [ ] ✅ **Health endpoints** — `/health`, `/live`, `/ready` implemented and include dependency checks.
* [ ] ✅ **Log enrichment** — include service name, environment, request id, and user id (when available).

## 6. Database & migrations

* [ ] ✅ **DB adapter** — include async-compatible DB adapter example (SQLAlchemy async or databases) and configuration.
* [ ] ✅ **Migrations** — Alembic (or chosen tool) configured; sample migrations present and tested.
* [ ] ✅ **Migration strategy** — document running migrations in CI or as K8s Job; avoid risky auto-migrations during rolling updates.
* [ ] ✅ **Connection pool & timeouts** — configured sensible pool sizes and DB timeouts for production.

## 7. Background processing & async tasks

* [ ] ✅ **Worker scaffold** — include Celery/Dramatiq (or recommended async worker) scaffolding and example tasks.
* [ ] ✅ **Broker/backends** — documented examples for Redis/RabbitMQ and result backends.
* [ ] ✅ **Task idempotency** — examples and guidance for idempotent task design and DLQ handling.
* [ ] ✅ **Worker observability** — metrics, logs, and tracing for background workers.

## 8. API design & documentation

* [ ] ✅ **OpenAPI** — ensure OpenAPI metadata (title, version, description) and route docs are comprehensive.
* [ ] ✅ **Versioning** — document and implement API versioning strategy (path or header-based).
* [ ] ✅ **Schema validation** — Pydantic models used for request/response; examples and tests for validation errors.
* [ ] ✅ **Example clients** — provide curl examples and optional Postman/Insomnia collection.

## 9. Testing

* [ ] ✅ **Unit tests** — core business logic covered; run quickly locally.
* [ ] ✅ **Integration tests** — tests for endpoints, DB, and background tasks using Testcontainers or ephemeral services.
* [ ] ✅ **E2E smoke tests** — CI job to run smoke tests against built image (health, key endpoints).
* [ ] ✅ **Test fixtures** — factories (factory_boy or similar) or fixtures to create test data.
* [ ] ✅ **Test settings** — separate test settings to isolate test environment (in-memory or ephemeral DB).

## 10. Containerization & local run

* [ ] ✅ **Multi-stage Dockerfile** — build stage and minimal runtime stage; non-root user; security best practices.
* [ ] ✅ **docker-compose.yml** — dev compose for web + db + redis + worker and instructions to run migrations.
* [ ] ✅ **Docker healthcheck** — add `HEALTHCHECK` or rely on app readiness probes.
* [ ] ✅ **Image scanning** — integrate image scanning YAML (Trivy) in CI or pipeline.

## 11. Kubernetes manifests & Helm (optional)

* [ ] ✅ **K8s manifests** — Deployment, Service, Ingress, ConfigMap and Secret examples or Helm chart scaffold.
* [ ] ✅ **Probes** — readiness and liveness probes pointing to `/ready` and `/live`.
* [ ] ✅ **Migration Job** — example migration Job or CI workflow for migrations.
* [ ] ✅ **Scaling** — HPA example and recommended metrics for autoscaling.

## 12. CI/CD

* [ ] ✅ **CI pipeline** — lint, format, type-check, unit tests, integration tests, build image, and run smoke tests.
* [ ] ✅ **Publish workflow** — build and push images to registry (GHCR/DockerHub), tag by commit and semantic versions.
* [ ] ✅ **Secrets in CI** — use CI secret store for registry credentials and deploy secrets.
* [ ] ✅ **Promotion** — promote same immutable image between environments rather than rebuilding.
* [ ] ✅ **Rollback policy** — documented and tested rollback process.

## 13. Release readiness checklist

* [ ] ✅ **Semantic versioning** — set initial version and maintain semver for releases.
* [ ] ✅ **CHANGELOG** — keep a changelog or use auto-generated release notes.
* [ ] ✅ **Badges** — add CI, license, coverage, and template badges to README.
* [ ] ✅ **Final smoke tests** — run smoke tests against staging before production roll-out.
* [ ] ✅ **Runbook** — include runbook steps for deploy, rollback, and incident triage.

## 14. Post-release & maintenance

* [ ] ✅ **Monitoring during rollout** — monitor logs, traces, metrics, and health for 48–72 hours post-release.
* [ ] ✅ **Hotfix process** — documented and practiced emergency fix flow.
* [ ] ✅ **Dependency updates** — schedule Dependabot PRs and regular dependency maintenance windows.
* [ ] ✅ **User feedback loop** — collect issues and prioritize fixes and enhancements.

## 15. Optional enhancements (future)

* [ ] ✅ **OpenTelemetry collector & dashboards** — provide example OTLP collector config and Grafana dashboards.
* [ ] ✅ **Rate limiting middleware** — built-in token bucket throttling for sensitive endpoints.
* [ ] ✅ **Feature toggles** — integrate a feature flag system (Unleash, LaunchDarkly, Flagsmith).
* [ ] ✅ **Service mesh / mTLS examples** — example policies for Istio/Linkerd with mutual TLS.
* [ ] ✅ **Policy-as-code** — OPA/Gatekeeper checks for K8s manifests in CI.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Open issues/PRs for items that are not complete. Each PR should reference the checklist items it addresses.
3. Run CI to ensure gates pass and smoke tests succeed on built images.
4. When all mandatory items are ✅ and CI is green, create the release and publish artifacts (images, template package).
