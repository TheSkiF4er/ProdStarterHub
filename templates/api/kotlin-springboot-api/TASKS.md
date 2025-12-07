# PRODSTARTER.KOTLIN.SPRINGBOOT — TASKS (Release Checklist)

A comprehensive, opinionated checklist and actionable task list to prepare the `kotlin-springboot-api` template for production release. Use this file to track required work, assign owners, open PRs, and mark items done.

> Mark items as ✅ when complete. Break large items into smaller PRs and reference checklist items in PR descriptions.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, features, links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, or chosen license).
* [ ] ✅ **Build files** — `build.gradle.kts` or `pom.xml` compile and produce artifacts locally (`./gradlew build`).
* [ ] ✅ **Project layout** — ensure `src/main/java|kotlin`, `src/test`, resources, Dockerfile, and k8s folders exist and are consistent.
* [ ] ✅ **Supported JDK versions** — document supported JVM versions (e.g., Temurin 17/21) and target compatibility in build files.

## 2. Code quality & formatting

* [ ] ✅ **Linters & formatters** — configure and enforce `ktlint` (or `detekt`) and `spotless`/`ktfmt`. Ensure CI checks these tools.
* [ ] ✅ **Static analysis** — run `detekt` and fix high-severity issues.
* [ ] ✅ **Pre-commit hooks** — enable formatting and linting via `pre-commit` or Git hooks.
* [ ] ✅ **Documentation & JavaDoc/KDoc** — public APIs and controllers have KDoc and meaningful endpoint summaries.

## 3. Configuration & environment

* [ ] ✅ **Typed config** — `@ConfigurationProperties` classes for typed config and `@ConfigurationPropertiesScan` enabled.
* [ ] ✅ **Profiles** — `application.yml`, `application-dev.yml`, and `application-prod.yml` with sensible defaults.
* [ ] ✅ **12-factor compliance** — externalize secrets and runtime config; no secrets in source.
* [ ] ✅ **Environment documentation** — list required env vars and default values in README or `ENVIRONMENT.md`.

## 4. Security & secrets

* [ ] ✅ **No secrets in repo** — scan with `git-secrets`/`truffleHog` and scrub history if necessary.
* [ ] ✅ **Secure defaults** — `spring.profiles.active` default to `production` for release; `management.endpoints.web.exposure.include` limited.
* [ ] ✅ **Auth scaffold** — include OAuth2/JWT skeleton or integration docs and secure actuator endpoints.
* [ ] ✅ **Dependency scanning** — enable Dependabot/Snyk; address critical vulnerabilities.
* [ ] ✅ **Security headers** — configure recommended security headers and content security policy guidance.

## 5. Observability & telemetry

* [ ] ✅ **Logging** — structured JSON logging configured (Logback encoder) and examples for including MDC/correlation IDs.
* [ ] ✅ **Correlation IDs** — middleware/filter for request id propagation (X-Request-Id) and inclusion in logs/traces.
* [ ] ✅ **Metrics** — Micrometer enabled; default JVM and application metrics exported. Document Prometheus scrape endpoint.
* [ ] ✅ **Tracing** — OpenTelemetry or Brave/Zipkin example and instructions for enabling tracing and exporting to OTLP/Jaeger.
* [ ] ✅ **Health endpoints** — actuator health, readiness, and liveness endpoints configured and tested.

## 6. Persistence & migrations

* [ ] ✅ **DB integration** — sample Spring Data JPA (Hibernate) or R2DBC config included and documented for Postgres.
* [ ] ✅ **Migrations** — Flyway or Liquibase configured with sample migration scripts committed.
* [ ] ✅ **Connection tuning** — default connection pool settings (HikariCP) with env-configurable sizes/timeouts.
* [ ] ✅ **Migration strategy docs** — recommend pre-deploy migration job and multi-release migration pattern for destructive changes.

## 7. Background processing & messaging

* [ ] ✅ **Worker scaffold** — include sample message consumer/producer (Kafka or RabbitMQ) or documentation for integrating them.
* [ ] ✅ **Task idempotency guidance** — examples and docs for idempotent consumers and dead-lettering.
* [ ] ✅ **Worker observability** — expose metrics and logs for consumers and workers; document scaling recommendations.

## 8. API design & docs

* [ ] ✅ **OpenAPI / Swagger** — springdoc-openapi or Springfox configured; docs available in non-production with toggle via config.
* [ ] ✅ **API versioning** — document and implement path or header-based versioning strategy (e.g., `/api/v1`).
* [ ] ✅ **Error model** — consistent error response schema and examples for common error codes.
* [ ] ✅ **Example requests** — include curl/postman examples and sample responses in README or docs folder.

## 9. Testing

* [ ] ✅ **Unit tests** — JUnit5 + MockK tests for services and controllers; coverage for core business logic.
* [ ] ✅ **Integration tests** — Spring Boot test slices and Testcontainers for Postgres/Kafka in CI.
* [ ] ✅ **Contract tests** — provider/consumer tests for messaging or HTTP contracts where applicable.
* [ ] ✅ **E2E smoke tests** — CI job to run smoke tests against the published image.
* [ ] ✅ **Test CI gating** — fail PRs that lower critical coverage or introduce new high-severity issues.

## 10. Containerization & local run

* [ ] ✅ **Multi-stage Dockerfile** — use Gradle/Maven build stage and a small runtime stage (Eclipse Temurin slim or distroless).
* [ ] ✅ **Non-root user** — ensure container runs as non-root by default.
* [ ] ✅ **Docker-compose** — dev compose including DB (Postgres), Kafka/Redis (if relevant) and optional mock services.
* [ ] ✅ **Healthcheck** — add `HEALTHCHECK` or rely on Kubernetes probes and expose actuator readiness/liveness.

## 11. Kubernetes manifests & Helm (optional)

* [ ] ✅ **K8s manifests** — Deployment, Service, Ingress, ConfigMap, Secret, and Job for migrations (or Helm chart scaffold).
* [ ] ✅ **Probes** — readiness/liveness probes mapped to actuator endpoints.
* [ ] ✅ **Resource requests/limits** — provide recommended defaults and HPA example.
* [ ] ✅ **PodDisruptionBudget & RBAC** — include example PDB and least-privilege RBAC manifests for cluster resources.

## 12. CI/CD

* [ ] ✅ **CI pipeline** — GitHub Actions or other CI to run lint, static analysis, build, unit and integration tests, and image build.
* [ ] ✅ **Image publishing** — publish Docker images to GHCR/DockerHub with commit-SHA tags and release tags.
* [ ] ✅ **Migration job** — run migrations as a controlled step in CD pipeline before deploying new image.
* [ ] ✅ **Release strategies** — document canary/blue-green deployment procedures and rollback steps.

## 13. Release readiness checklist

* [ ] ✅ **Versioning** — semantic versioning strategy defined and initial version set.
* [ ] ✅ **CHANGELOG** — keep a changelog or use auto-generated release notes.
* [ ] ✅ **Badges** — CI, license, coverage badges added to README.
* [ ] ✅ **Final smoke tests** — run smoke tests against staging before releasing to production.
* [ ] ✅ **Runbook** — ensure runbook exists with deploy, rollback, and incident triage steps.

## 14. Post-release & maintenance

* [ ] ✅ **Monitoring window** — monitor logs, metrics, and traces actively for first 48–72 hours post-release.
* [ ] ✅ **Hotfix process** — defined and tested emergency fix flow.
* [ ] ✅ **Dependency updates** — schedule Dependabot/SCA and regular maintenance windows.
* [ ] ✅ **Issue triage** — process to collect and prioritize user/consumer feedback.

## 15. Optional enhancements (future)

* [ ] ✅ **OpenTelemetry collector & dashboards** — example OTLP collector and Grafana dashboards for JVM and app metrics.
* [ ] ✅ **Service mesh** — example integration with Istio/Linkerd for advanced traffic control and mTLS.
* [ ] ✅ **Policy-as-code** — OPA/Gatekeeper checks for k8s manifests and image policies in CI.
* [ ] ✅ **Chaos testing** — planned chaos tests in staging to validate resilience.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break items into issues and PRs. Tag PRs with checklist item identifiers.
3. Use project boards or issues to assign owners and track progress.
4. When all mandatory items are ✅ and CI is green, create the release and publish artifacts (images, binaries, or template package).
