# PRODSTARTER.NODE.EXPRESS — TASKS (Release Checklist)

Comprehensive, opinionated checklist and actionable tasks to prepare the `node-express-javascript` template for production release. Use this document to track work, open PRs, and verify readiness.

> Mark items ✅ when complete. Break large tasks into smaller PRs and reference checklist items in PR descriptions.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — clear overview, quickstart, features, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, or chosen license).
* [ ] ✅ **Project layout** — ensure `src/`, `test/`, `Dockerfile`, `docker-compose.yml`, `package.json`, and docs are present and consistent.
* [ ] ✅ **Node versions** — define supported Node.js versions (e.g., 18/20) and include `.nvmrc` and `engines` in `package.json`.

## 2. Code quality & formatting

* [ ] ✅ **Linters & formatters** — configure `eslint` (with a recommended style), `prettier`, and enforce in CI.
* [ ] ✅ **Type support** — consider TypeScript or JSDoc types; if TypeScript is not used, include clear runtime validation patterns.
* [ ] ✅ **Static security checks** — configure `npm audit` / `snyk` and fail on critical vulnerabilities in CI.
* [ ] ✅ **Pre-commit hooks** — enable `husky` and `lint-staged` to run format/lint on commit.

## 3. Configuration & environment

* [ ] ✅ **12-factor compliance** — externalize configuration via env vars; provide a `.env.example` with required variables.
* [ ] ✅ **Config validation** — use `joi`, `zod`, or `envalid` to validate env at startup and fail fast.
* [ ] ✅ **Environment docs** — list required env vars: `NODE_ENV`, `DATABASE_DSN`, `REDIS_URL`, `SERVICE_NAME`, `PORT`, `CORS_ORIGINS`, etc.

## 4. Security & secrets

* [ ] ✅ **No secrets committed** — scan repo (git-secrets/truffleHog/detect-secrets) and scrub history if needed.
* [ ] ✅ **Secure defaults** — `NODE_ENV=production` for releases; CORS restricted in prod; helmet enabled.
* [ ] ✅ **Auth skeleton** — provide JWT/OAuth2 integration guide or simple middleware scaffold.
* [ ] ✅ **Rate limiting & abuse protection** — sensible defaults and docs to configure via env.
* [ ] ✅ **Dependency scanning** — enable Dependabot or Snyk and address critical/high findings.

## 5. Logging, observability & telemetry

* [ ] ✅ **Structured logging** — pino or bunyan configured; logs to stdout in JSON; include `service` and `environment` fields.
* [ ] ✅ **Correlation IDs** — middleware that propagates `X-Request-Id` and includes it in logs and responses.
* [ ] ✅ **Metrics** — Prometheus metrics endpoint `/metrics` is present and tested (http_request_count, latencies).
* [ ] ✅ **Tracing** — OpenTelemetry bootstrap example and instructions for enabling OTLP exporter.
* [ ] ✅ **Health checks** — `/health`, `/live`, `/ready` endpoints implemented and included in orchestration probes.

## 6. Database & migrations

* [ ] ✅ **DB adapter docs** — examples for Postgres (`pg`/`knex`/`sequelize`) and optional Mongo (`mongoose`).
* [ ] ✅ **Migrations** — include migrations tooling (knex/umzug/sequelize migrations) and sample migration files.
* [ ] ✅ **Migration strategy** — document running migrations as CI step or pre-deploy Job; provide non-destructive migration guidance.
* [ ] ✅ **Connection pooling & timeouts** — sensible defaults and env-configurable values.

## 7. Background processing & queues

* [ ] ✅ **Worker scaffold** — include sample worker pattern (BullMQ, Bee-Queue, or RabbitMQ example) and recommended broker backends.
* [ ] ✅ **Idempotency & DLQ** — documentation and examples for idempotent workers and dead-letter strategies.
* [ ] ✅ **Worker observability** — expose worker metrics and logs and instrument retry/failure counters.

## 8. API design & documentation

* [ ] ✅ **OpenAPI** — provide example `openapi.json` or generator (swagger-jsdoc) and serve Swagger UI in dev only.
* [ ] ✅ **Versioning** — implement path-based versioning (`/api/v1`) and document versioning policy.
* [ ] ✅ **Error model** — consistent error response format and examples for common error cases.
* [ ] ✅ **Sample clients** — include curl examples and optionally Postman/Insomnia collection.

## 9. Testing

* [ ] ✅ **Unit tests** — `jest` (or preferred framework) for unit tests; coverage for core logic.
* [ ] ✅ **Integration tests** — tests that exercise routes and persistence; use Testcontainers or docker-compose for DB in CI.
* [ ] ✅ **E2E smoke tests** — CI job to run smoke tests against the built image (health and a few endpoints).
* [ ] ✅ **Test fixtures & factories** — use factory patterns or fixture builders to create test data.

## 10. Containerization & local development

* [ ] ✅ **Multi-stage Dockerfile** — build stage and minimal runtime stage; use non-root user and environment-friendly JVM (Node) flags.
* [ ] ✅ **docker-compose.yml** — dev compose for app + Postgres + Redis (and worker) with clear instructions to run migrations.
* [ ] ✅ **Docker healthcheck** — optionally add `HEALTHCHECK` in Dockerfile or rely on app readiness endpoints.
* [ ] ✅ **Image scanning** — integrate Trivy or similar in CI to scan built images.

## 11. Kubernetes manifests & Helm (optional)

* [ ] ✅ **K8s manifests** — Deployment, Service, Ingress, ConfigMap, Secret, and Job for migrations or Helm chart scaffold.
* [ ] ✅ **Probes** — readiness -> `/ready`, liveness -> `/live` (or actuator equivalent).
* [ ] ✅ **Resource requests/limits** — recommended defaults and HPA example based on CPU or custom metrics.
* [ ] ✅ **PodDisruptionBudget & RBAC** — include sensible PDB and minimal RBAC rules for infra jobs.

## 12. CI/CD

* [ ] ✅ **CI pipeline** — run lint, format check, unit tests, and security scans on PRs.
* [ ] ✅ **Build & publish** — build Docker image, tag with `sha-<commit>` and `latest`/`vX.Y.Z`, and push to registry in main branch.
* [ ] ✅ **Smoke tests** — run containerized smoke tests in CI against pushed images.
* [ ] ✅ **Secrets in CI** — use GitHub Secrets or CI secret store for registry credentials and production secrets.
* [ ] ✅ **Rollback plan** — documented rollback steps and ability to redeploy previous image/tag.

## 13. Release readiness checklist

* [ ] ✅ **Semantic versioning** — set initial version and follow semver for releases.
* [ ] ✅ **CHANGELOG** — keep a changelog or use auto-generated release notes.
* [ ] ✅ **Badges** — add CI, license, coverage, and security badges to README.
* [ ] ✅ **Final smoke tests** — successful smoke tests against staging prior to production rollout.
* [ ] ✅ **Runbook available** — runbook for deploy, rollback and incident triage present and accessible.

## 14. Post-release & maintenance

* [ ] ✅ **Monitoring window** — actively monitor logs, metrics, and traces for 48–72 hours after release.
* [ ] ✅ **Hotfix process** — documented emergency fix flow and quick patch release path.
* [ ] ✅ **Dependency updates** — schedule Dependabot or SCA updates and regular maintenance windows.
* [ ] ✅ **Issue triage** — process to collect and prioritize bug reports and feature requests.

## 15. Optional improvements (future)

* [ ] ✅ **TypeScript variant** — provide a parallel TypeScript template for stronger typing and DX.
* [ ] ✅ **Policy-as-code** — integrate OPA/Gatekeeper checks for k8s manifests in CI.
* [ ] ✅ **Feature flags** — integrate a feature flag system (Unleash / Flagsmith).
* [ ] ✅ **Observability defaults** — provide Grafana dashboards, Prometheus recording rules, and OTEL collector config.
* [ ] ✅ **GitHub Template / Marketplace** — publish the template as a GitHub template or marketplace entry.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break items into issues and PRs. Tag PRs with checklist item identifiers.
3. Use project boards or issues to assign owners and track progress.
4. When all mandatory items are ✅ and CI is green, create the release and publish artifacts (images, npm package, or template package).
