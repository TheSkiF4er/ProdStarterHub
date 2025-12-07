# PRODSTARTER.DJANGO.REST — TASKS (Release Checklist)

A complete, opinionated checklist and actionable task list to prepare the `django-rest-python` template for production release. Use this file to track required work, assign owners, open PRs, and mark items done.

> Mark items as ✅ when complete. Break large items into smaller PRs and reference checklist items in pull requests.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, supported features, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — choose and include a license (MIT, Apache-2.0, etc.).
* [ ] ✅ **Project layout** — ensure `manage.py`, `src/config`, `src/apps`, `requirements.txt` / `pyproject.toml` and tests folder exist and are consistent.
* [ ] ✅ **Python version** — set and document supported Python versions (e.g., 3.11+). Add `runtime.txt` if required by hosting.

## 2. Code quality & formatting

* [ ] ✅ **Linters & formatters** — add `ruff` (or `flake8`) + `black`, and `isort`. Provide config files and ensure linting passes.
* [ ] ✅ **Type hints** — add `mypy` or type-checking strategy for critical modules.
* [ ] ✅ **Pre-commit hooks** — enable `pre-commit` with formatting and security hooks.

## 3. Security & secrets

* [ ] ✅ **No secrets in repo** — run git-secrets / truffleHog and remove any secrets from history if found.
* [ ] ✅ **Production settings** — `DEBUG=False` in production config; secure `SECRET_KEY` must be provided via env/secret manager.
* [ ] ✅ **Allowed hosts** — enforce `ALLOWED_HOSTS` in production config.
* [ ] ✅ **Dependency scanning** — enable Dependabot or SCA scanning and address critical vulnerabilities.
* [ ] ✅ **Security.md** — add a `SECURITY.md` with disclosure instructions and contact.
* [ ] ✅ **Secure headers** — configure security headers and middleware (`X-Frame-Options`, `X-Content-Type-Options`, `CSP` if applicable).

## 4. Configuration & environment

* [ ] ✅ **Config layering** — `config/base.py`, `config/development.py`, `config/production.py` using `django-environ` or similar.
* [ ] ✅ **Environment variable docs** — list mandatory env vars (`DATABASE_URL`, `SECRET_KEY`, `REDIS_URL`, `S3_*`, etc.).
* [ ] ✅ **12-factor readiness** — ensure config is externalized and no hardcoded secrets.

## 5. Database & migrations

* [ ] ✅ **Recommended DB** — document and test Postgres support.
* [ ] ✅ **Migrations committed** — initial migrations are present and tested.
* [ ] ✅ **Migration strategy** — document CI/CD migration steps (pre-deploy Job or CI migration step).
* [ ] ✅ **Test migrations in CI** — run `manage.py migrate` in CI with an ephemeral DB.

## 6. Authentication & Authorization

* [ ] ✅ **Auth scaffolding** — include `djangorestframework-simplejwt` or recommended auth sample and docs.
* [ ] ✅ **Permission examples** — include sample role/permission based usage in a controller example.
* [ ] ✅ **Protect admin** — admin endpoints restricted in production via `ALLOWED_HOSTS` or IP allow-list.

## 7. Observability

* [ ] ✅ **Structured logging** — set up JSON logging (structlog or configured `logging`) to stdout.
* [ ] ✅ **Health checks** — implement `/healthz`, `/ready`, and `/live` endpoints and health check utilities.
* [ ] ✅ **Metrics** — include `django-prometheus` scaffolding or documentation for enabling metrics.
* [ ] ✅ **Tracing** — provide optional OpenTelemetry config and docs for enabling distributed tracing.
* [ ] ✅ **Correlation IDs** — add middleware for request ID propagation and documentation.

## 8. Background processing

* [ ] ✅ **Worker scaffold** — include Celery (or Dramatiq) example with tasks and recommended broker/backends.
* [ ] ✅ **Idempotent tasks** — document idempotency and retry settings in examples.
* [ ] ✅ **Task tests** — add unit/integration tests for at least one example background task.

## 9. Tests & quality gates

* [ ] ✅ **Unit tests** — add meaningful unit tests for domain logic and serializers.
* [ ] ✅ **Integration tests** — add integration tests for views/routers using `pytest-django` and Testcontainers or ephemeral DB.
* [ ] ✅ **E2E smoke tests** — CI job that spins up the built image and checks basic endpoints (health, swagger).
* [ ] ✅ **Coverage baseline** — define a minimum coverage threshold and report coverage in CI.

## 10. Containerization & local development

* [ ] ✅ **Multi-stage Dockerfile** — include non-root user, collect static, and minimal runtime image.
* [ ] ✅ **docker-compose.yml** — local dev compose with Postgres, Redis, and optional MinIO (S3) for media.
* [ ] ✅ **Local run docs** — steps for `docker-compose up --build` and `make` targets.
* [ ] ✅ **Docker healthcheck** — add `HEALTHCHECK` to Dockerfile or rely on app readiness endpoints.

## 11. Kubernetes manifests & Helm (optional but recommended)

* [ ] ✅ **K8s manifests** — Deployment, Service, Ingress (TLS), ConfigMap and Secret usage examples.
* [ ] ✅ **Helm chart** — sample chart or `k8s/` folder with templated manifests and `values.yaml`.
* [ ] ✅ **Migrate job** — example pre-deploy migration Job or CI hook.
* [ ] ✅ **Probes** — readiness/liveness probes configured in manifests.

## 12. CI/CD

* [ ] ✅ **CI workflow** — GitHub Actions (or equiv.) to run lint, tests, build image, and run smoke tests.
* [ ] ✅ **Publish workflow** — push images to GHCR or Docker Hub with semantic tags and `latest` on main.
* [ ] ✅ **Secrets in CI** — store registry credentials and production secrets in GitHub Secrets / CI secret store.
* [ ] ✅ **Release notes / changelog** — automated changelog generation (semantic-release) or PR template for changelog entry.

## 13. API docs & developer experience

* [ ] ✅ **OpenAPI / Swagger** — DRF schema and Swagger UI (enabled in dev by default) with security schemes.
* [ ] ✅ **API examples** — include Postman/Insomnia collection or sample curl commands for common endpoints.
* [ ] ✅ **TUTORIAL.md** — step-by-step tutorial for scaffolding, development, testing, and deploy.

## 14. Documentation & templates

* [ ] ✅ **ARCHITECTURE.md** — completed (this exists).
* [ ] ✅ **TUTORIAL.md** — user-facing guide included.
* [ ] ✅ **TASKS.md** — this checklist is present and actionable.
* [ ] ✅ **Contributing.md** — contribution guide and PR template.
* [ ] ✅ **CODEOWNERS** — list maintainers for critical directories.

## 15. Release readiness checklist

* [ ] ✅ **All mandatory tasks complete** — mark this checklist done.
* [ ] ✅ **CI green** — all CI checks passing on `main` / release branch.
* [ ] ✅ **Smoke tests passed** — successful smoke tests against built image.
* [ ] ✅ **Tag release** — create `v1.0.0` (or chosen semantic version) and publish image/templates.
* [ ] ✅ **Badges** — add CI, license, coverage, and template badges to `README.md`.

## 16. Post-release & maintenance

* [ ] ✅ **Monitoring during rollout** — observe logs, traces, metrics, and alerts during first 48–72 hours.
* [ ] ✅ **Community feedback** — triage issues and prioritize bugfixes for a follow-up minor release.
* [ ] ✅ **Dependabot / SCA** — keep dependences updated and address security advisories.

## 17. Optional improvements (future)

* [ ] ✅ **GitHub Template / Marketplace** — publish template to GitHub Template repository or package for `dotnet new`-style generator for Python.
* [ ] ✅ **Policy-as-Code** — add OPA/Gatekeeper policies for Kubernetes manifests.
* [ ] ✅ **Feature flags** — integrate a feature flagging SDK for safe rollouts.
* [ ] ✅ **Observability defaults** — bundle Prometheus Grafana dashboards and OpenTelemetry collector config.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break items into focused issues and PRs. Tag PRs with the checklist item numbers.
3. Use GitHub project boards or Issues to assign owners and track progress.
4. Once all mandatory items are complete and CI is green — create the release and publish the template.
