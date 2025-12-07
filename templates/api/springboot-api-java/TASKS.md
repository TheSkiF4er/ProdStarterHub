# PRODSTARTER.SPRINGBOOT.JAVA — TASKS (Release Checklist)

Comprehensive, opinionated checklist and actionable tasks to prepare the `springboot-api-java` template for production release. Use this document to track work, open PRs, and verify readiness.

> Mark items ✅ when complete. Break large tasks into focused PRs and reference checklist items in PR descriptions.

---

## 0. How to use

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break checklist items into issues/PRs; reference checklist IDs in PR descriptions.
3. Run CI on every PR and ensure tests and static checks pass before merging.
4. When all mandatory items are complete and CI is green, tag and release.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — clear overview, quickstart, links to `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, or chosen license).
* [ ] ✅ **Build** — `./gradlew build` or `./mvnw package` should succeed on a clean machine.
* [ ] ✅ **Project layout** — ensure `src/`, `src/test/`, `Dockerfile`, `docker-compose.yml`, `k8s/`, and docs exist and match references.
* [ ] ✅ **Supported JDK** — document supported JVM versions (17/21) and include `toolchain` or `engines` settings in build files.

## 2. Code quality & formatting

* [ ] ✅ **Static analysis** — configure and pass `spotless`, `ktlint`/`google-java-format`, `checkstyle` or `spotbugs` as applicable.
* [ ] ✅ **Security static analysis** — run `spotbugs` with security rules, and address critical findings.
* [ ] ✅ **Pre-commit hooks** — enable formatting and linting with `pre-commit` or git hooks.
* [ ] ✅ **API docs and KDoc/Javadoc** — public classes and controllers have documentation and OpenAPI annotations.

## 3. Configuration & environment

* [ ] ✅ **Typed configuration** — `@ConfigurationProperties` classes for typed settings and validation.
* [ ] ✅ **Profiles** — `application.yml`, `application-dev.yml`, `application-prod.yml` with secure defaults.
* [ ] ✅ **12-factor compliance** — externalize secrets; provide `.env.example` or docs for required env vars.
* [ ] ✅ **Config validation** — validate critical env/config at startup and fail fast when misconfigured.

## 4. Security & secrets

* [ ] ✅ **No secrets in repo** — scan repository with `git-secrets`/`truffleHog` and scrub history if necessary.
* [ ] ✅ **Secure defaults** — `management.endpoints.web.exposure` limited in prod; `spring.profiles.active=production` as default for releases.
* [ ] ✅ **Auth/ACL scaffold** — include skeleton for OAuth2/OIDC or JWT integration and docs on how to enable auth.
* [ ] ✅ **Dependency scanning** — enable Dependabot/Snyk and remediate high/critical vulnerabilities.
* [ ] ✅ **Security headers & CSP** — document and optionally configure recommended response headers.

## 5. Observability & telemetry

* [ ] ✅ **Logging** — JSON structured logging option (logback encoder) and inclusion of MDC/correlation id.
* [ ] ✅ **Correlation IDs** — request filter to propagate `X-Request-Id` and include in logs and traces.
* [ ] ✅ **Metrics** — Micrometer enabled and Prometheus endpoint (`/actuator/prometheus`) documented and tested.
* [ ] ✅ **Tracing** — OpenTelemetry bootstrap example and instructions for enabling OTLP exporter.
* [ ] ✅ **Health checks** — Actuator health with readiness/liveness groups and dependency checks (DB, cache, broker).

## 6. Persistence & migrations

* [ ] ✅ **DB adapter** — sample Spring Data JPA (Hibernate) or R2DBC config for Postgres with HikariCP.
* [ ] ✅ **Migrations** — Flyway or Liquibase configured; include sample migrations in VCS.
* [ ] ✅ **Migration strategy** — document running migrations in CI or as a K8s Job before rolling updates.
* [ ] ✅ **Connection tuning** — Hikari pool and DB timeouts exposed as configuration.

## 7. Background processing & messaging

* [ ] ✅ **Worker pattern** — scaffolding for message consumers/producers (Kafka or RabbitMQ) in `events/` or `background/`.
* [ ] ✅ **Idempotency & DLQ** — guidance/examples for idempotent consumers and dead-letter handling.
* [ ] ✅ **Worker observability** — metrics for worker throughput, failures and retries.

## 8. API design & documentation

* [ ] ✅ **OpenAPI** — springdoc-openapi configuration and sample OpenAPI metadata included; UI toggled by profile.
* [ ] ✅ **Versioning** — implement and document API versioning strategy (path-based `/api/v1`).
* [ ] ✅ **Error model** — consistent error response schema and examples in docs.
* [ ] ✅ **Examples** — curl examples and sample responses included in README or docs directory.

## 9. Testing

* [ ] ✅ **Unit tests** — JUnit5 tests with Mockito/MockK where appropriate; focus on business logic.
* [ ] ✅ **Integration tests** — Testcontainers for Postgres/Kafka in CI; `@SpringBootTest` slices added where needed.
* [ ] ✅ **Contract tests** — consumer/provider tests for API and message contracts where applicable.
* [ ] ✅ **E2E smoke tests** — CI job runs smoke tests against a built image in an ephemeral environment.

## 10. Containerization & local run

* [ ] ✅ **Multi-stage Dockerfile** — build with Gradle/Maven and produce small runtime image (non-root user).
* [ ] ✅ **docker-compose.yml** — development compose with DB, Redis, and local mocks; docs to run migrations and tests locally.
* [ ] ✅ **Docker healthcheck** — include `HEALTHCHECK` or rely on k8s probes mapped to actuator endpoints.
* [ ] ✅ **Image scanning** — integrate Trivy or image scanning stage in CI.

## 11. Kubernetes manifests & Helm (optional)

* [ ] ✅ **K8s manifests** — Deployment, Service, Ingress, ConfigMap, Secret, and Job for migrations, or a Helm chart scaffold.
* [ ] ✅ **Probes** — readiness and liveness probes mapped to actuator health groups.
* [ ] ✅ **Resource requests/limits** — recommended CPU/memory and HPA example.
* [ ] ✅ **PodDisruptionBudget & RBAC** — include sensible PDB and minimal RBAC for migration jobs.

## 12. CI/CD

* [ ] ✅ **CI pipeline** — GitHub Actions (or chosen CI) to run static checks, unit & integration tests, and build artifacts.
* [ ] ✅ **Build & publish image** — build, tag (sha+semver), and push Docker image to registry (GHCR/ECR/GCR).
* [ ] ✅ **Migration job** — run DB migrations as a controlled step in CD before deploying new replicas.
* [ ] ✅ **Release strategy** — recommend canary or blue/green deployments and documented rollback procedures.

## 13. Release readiness checklist

* [ ] ✅ **Semantic versioning** — set initial version and maintain semver for releases.
* [ ] ✅ **CHANGELOG** — maintain changelog or use autogenerated release notes.
* [ ] ✅ **Badges** — add CI, license, coverage, and security badges to README.
* [ ] ✅ **Final smoke tests** — run smoke tests against staging before production rollout.
* [ ] ✅ **Runbook** — ensure runbook and incident triage steps are documented and accessible.

## 14. Post-release & maintenance

* [ ] ✅ **Monitoring window** — actively monitor metrics and logs for 48–72 hours post-release.
* [ ] ✅ **Hotfix process** — documented emergency fix and patch-release flow.
* [ ] ✅ **Dependency updates** — scheduled Dependabot/SCA maintenance and patching cadence.
* [ ] ✅ **Issue triage** — process for prioritizing and addressing production issues.

## 15. Optional enhancements (future)

* [ ] ✅ **OTel collector & dashboards** — provide example OTLP collector config and Grafana dashboards.
* [ ] ✅ **Policy-as-code** — OPA/Gatekeeper checks for K8s manifests in CI.
* [ ] ✅ **Service mesh** — example Istio/Linkerd integration for mTLS and traffic control.
* [ ] ✅ **Chaos testing** — scheduled chaos experiments in staging to validate resilience.
