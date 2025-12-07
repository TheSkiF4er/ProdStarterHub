# PRODSTARTER.API — TASKS (Release Checklist)

This file contains a comprehensive, opinionated checklist and actionable tasks to prepare the `aspnetcore-webapi-csharp` template for production release. It is intended to be used by maintainers and contributors to ensure the template is complete, high-quality, secure, and easy to consume.

> Use this checklist as a guide — mark items as ✅ when complete and create separate PRs for non-trivial items.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **Update `README.md`** — concise overview, quickstart, required prerequisites, usage examples (scaffold from template), and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **Verify LICENSE** — MIT or chosen license is present and correct.
* [ ] ✅ **Solution & Project files** — `*.sln` and `src/ProdStarter.Api/*.csproj` are valid and build locally (`dotnet build`).
* [ ] ✅ **Set package versions** — use explicit, supported package versions (no floating `*`).

## 2. Code & API quality

* [ ] ✅ **Static analysis & format** — configure and run analyzers (Roslyn analyzers, EditorConfig) and ensure `dotnet format` passes.
* [ ] ✅ **Code comments & XML docs** — public API surface documented; XML docs generation enabled in project file.
* [ ] ✅ **Controller/DTO validation** — model validation applied (attributes, FluentValidation where appropriate).
* [ ] ✅ **API versioning** — ensure versioning is configured and documented; sample `v1` endpoints exist.
* [ ] ✅ **Error handling** — centralized error handling implemented and tested (no leaked stack traces in production).
* [ ] ✅ **DTO mapping** — mappings (AutoMapper or manual) are covered by unit tests.

## 3. Security & secrets

* [ ] ✅ **No secrets in repo** — scan repo (git-secrets, truffleHog) and remove any secrets.
* [ ] ✅ **Secure defaults** — CORS restricted by default, HTTPS enforced, HSTS enabled in production.
* [ ] ✅ **Auth placeholders** — JWT/OIDC scaffolding included or documented; sample `Authorize` attributes applied to protected endpoints.
* [ ] ✅ **Dependency scanning** — enable Dependabot or SCA; address critical vulnerabilities.
* [ ] ✅ **Security.md** — add `SECURITY.md` with disclosure process and contact info.

## 4. Configuration & environment

* [ ] ✅ **Config examples** — include `appsettings.json` and `appsettings.Development.json` examples with placeholders (no secrets).
* [ ] ✅ **Environment variable conventions** — document important env vars (DB connection, Redis, Swagger:Enabled, Cors:Origins, Logging).
* [ ] ✅ **12-factor readiness** — config is externalized; app can run without local file edits.

## 5. Observability

* [ ] ✅ **Structured logging** — Serilog configured; sample sinks and configuration documented.
* [ ] ✅ **Health checks** — `/healthz`, `/live`, `/ready` implemented and documented.
* [ ] ✅ **Metrics** — provide `/metrics` or document how to enable Prometheus metrics (if included).
* [ ] ✅ **Tracing** — OpenTelemetry configuration example or clear instructions for enabling tracing.
* [ ] ✅ **Correlation IDs** — middleware for correlation ID propagation or guidance included.

## 6. Persistence & migrations

* [ ] ✅ **EF Core integration** — sample `DbContext` or placeholder with migration strategy documented.
* [ ] ✅ **Migrations folder** — migrations present (if sample DB used) or clear instructions to generate migrations.
* [ ] ✅ **Migration strategy in docs** — document recommended approach (CI vs startup job vs pre-deploy job).

## 7. Tests

* [ ] ✅ **Unit tests** — meaningful unit tests for domain and application logic; passing.
* [ ] ✅ **Integration tests** — basic integration test(s) for controllers and health endpoints.
* [ ] ✅ **Test coverage** — target baseline coverage (e.g., 70% for core logic); document expectations.
* [ ] ✅ **Test automation** — tests run in CI; flaky tests investigated and fixed.

## 8. CI/CD

* [ ] ✅ **CI workflow** — GitHub Actions or other CI configured for build, test, lint, and security scanning.
* [ ] ✅ **Publish workflow** — container image build and push (to Docker Hub / GHCR / private registry) with tags per commit and semantic-release tags for releases.
* [ ] ✅ **Release notes** — automated changelog generation (semantic-release or keep a manual `CHANGELOG.md`).
* [ ] ✅ **Deploy strategy docs** — document blue/green or canary recommendations and rollback steps.

## 9. Containerization & local run

* [ ] ✅ **Dockerfile (multi-stage)** — build image optimized for size and security.
* [ ] ✅ **docker-compose** — development compose with DB and redis examples.
* [ ] ✅ **Local run instructions** — step-by-step run guide for local dev using docker-compose and dotnet run.
* [ ] ✅ **Container health checks** — `HEALTHCHECK` in Dockerfile or rely on K8s probes configuration.

## 10. Kubernetes manifests (optional but recommended)

* [ ] ✅ **Minimal K8s manifests** — Deployment, Service, HPA example, ConfigMap/Secret usage notes, and Job for migrations.
* [ ] ✅ **Values for Helm** — sample `values.yaml` if publishing a Helm chart.
* [ ] ✅ **Readiness/Liveness** — probes configured in manifests and documented.

## 11. Documentation & samples

* [ ] ✅ **TUTORIAL.md** — step-by-step guide to scaffold a project from the template and implement a simple endpoint.
* [ ] ✅ **ARCHITECTURE.md** — high-level architecture and rationale (already included).
* [ ] ✅ **Example requests** — include `curl` and HTTPie examples and sample Postman/Insomnia collection or OpenAPI client instructions.
* [ ] ✅ **Migration guide** — how to upgrade the template version and adapt breaking changes.

## 12. Packaging & template metadata

* [ ] ✅ **Template registry entry** — ensure `core/templates-registry.json` includes this template with metadata: `name`, `path`, `language`, `status`, `supportedVersions`, `lastTestedCommit`.
* [ ] ✅ **Template variables** — define customizable variables and document (project name, namespace, author, license).
* [ ] ✅ **Template tests** — smoke tests that scaffold a project and build it.

## 13. Release readiness checklist

* [ ] ✅ **Versioning** — set initial semantic version (e.g., `0.1.0` -> `1.0.0` as stable when ready).
* [ ] ✅ **Changelog** — `CHANGELOG.md` or automated release notes available.
* [ ] ✅ **Release PR** — create a release PR that bundles final items (docs, badges, version bump).
* [ ] ✅ **Badges** — add CI, coverage, license, and NuGet/Docker badges to README (if applicable).
* [ ] ✅ **Tag & publish** — tag release and publish artifact (image, nuget, or template package).

## 14. Post-release tasks

* [ ] ✅ **Monitor first deployments** — watch logs, errors, latency, and health checks for the first 24–72 hours.
* [ ] ✅ **Hotfix process** — fast path for critical fixes and emergency releases.
* [ ] ✅ **Community feedback** — collect user feedback and issues and prioritize follow-ups.

## 15. Maintenance & governance

* [ ] ✅ **Dependabot / SCA** — keep dependencies up-to-date and patch critical issues.
* [ ] ✅ **Owners & CODEOWNERS** — set responsible maintainers for template areas (src, docs, CI).
* [ ] ✅ **Contribution guidelines** — `CONTRIBUTING.md` with PR checklist and templates.
* [ ] ✅ **Security policy** — `SECURITY.md` and clear disclosure contact.

## 16. Optional enhancements (future releases)

* [ ] ✅ **OpenTelemetry OTLP exporter defaults** — preconfigured exporters for traces/metrics.
* [ ] ✅ **Prometheus + Grafana dashboard** — example dashboards for common metrics.
* [ ] ✅ **Tracing sample** — end-to-end trace across HTTP and a sample background worker.
* [ ] ✅ **Feature flags** — sample feature-flag integration.
* [ ] ✅ **GitOps sample** — demonstrate GitOps-based deployment with ArgoCD/Flux.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Create PRs for items that are not yet complete. Each PR should reference which checklist items it satisfies.
3. Use GitHub project board or Issues to track progress and assign owners.
4. When all mandatory items are complete and test/pipeline green — create the release and tag it.

---

> Tip: For larger teams, split responsibilities across owners (Docs, CI, Security, Infra) so the release flow is parallelizable and efficient.
