# PRODSTARTER.SPRINGBOOT.JAVA — TUTORIAL

This tutorial walks you through creating, building, running, testing, and deploying a service scaffolded from the `springboot-api-java` template in **ProdStarterHub**. It emphasizes production-ready practices: configuration, migrations, observability, containerization, background processing, and CI/CD.

> Audience: backend engineers, DevOps engineers, and technical leads building Spring Boot microservices in Java.

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Scaffold the project & initial setup](#scaffold-the-project--initial-setup)
3. [Project layout overview](#project-layout-overview)
4. [Build & run locally (Gradle / Maven)](#build--run-locally-gradle--maven)
5. [Configuration & profiles](#configuration--profiles)
6. [Database and migrations (Flyway/Liquibase)](#database-and-migrations-flywayliquibase)
7. [Observability: logging, metrics, tracing, health](#observability-logging-metrics-tracing-health)
8. [Background processing & messaging](#background-processing--messaging)
9. [Testing strategy and examples](#testing-strategy-and-examples)
10. [Containerization & docker-compose for local stacks](#containerization--docker-compose-for-local-stacks)
11. [CI/CD recommendations (GitHub Actions example)](#cicd-recommendations-github-actions-example)
12. [Kubernetes deployment guidance](#kubernetes-deployment-guidance)
13. [Security checklist for production](#security-checklist-for-production)
14. [Troubleshooting & FAQ](#troubleshooting--faq)
15. [Next steps & extension ideas](#next-steps--extension-ideas)

---

## Prerequisites

* JDK 17 or 21 (Temurin or your preferred distribution).
* Gradle or Maven (wrapper included: `./gradlew` / `./mvnw`).
* Docker & docker-compose for containerized local stacks.
* Git.
* Postgres (or other RDBMS) and Redis (optional) for local testing (docker-compose provided).
* Optional: Kubernetes (`kubectl`, `minikube`/`kind`) for cluster testing.

## Scaffold the project & initial setup

1. Copy the template into your workspace:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/springboot-api-java
cp -R . ~/projects/my-service
cd ~/projects/my-service
```

2. Adjust package/group and artifact names if you plan to publish artifacts. Use `template.json` tokens or do a search/replace of `com.prodstarter`.

3. (Optional) Initialize Git and create a branch:

```bash
git init
git checkout -b feature/initial
```

## Project layout overview

```
src/main/java/com/prodstarter/
  ├─ Application.java                 # application entrypoint, graceful shutdown
  ├─ config/                          # typed @ConfigurationProperties classes
  ├─ controller/                      # REST controllers (API layer)
  ├─ dto/                             # request/response DTOs
  ├─ service/                         # business logic and use-cases
  ├─ repository/                      # Spring Data repositories / DAOs
  ├─ events/                          # message producers/consumers
  └─ exception/                       # centralized exception handling
src/main/resources/
  ├─ application.yml
  ├─ application-dev.yml
  └─ application-prod.yml
src/test/                              # unit & integration tests
Dockerfile
docker-compose.yml
k8s/                                    # optional Kubernetes manifests / helm
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

## Build & run locally (Gradle / Maven)

### Using Gradle (recommended)

```bash
# build (runs tests)
./gradlew clean build

# run the application locally (dev profile)
./gradlew bootRun --args='--spring.profiles.active=dev'
```

### Using Maven

```bash
./mvnw clean package
java -jar target/my-service.jar --spring.profiles.active=dev
```

Open the app:

* API root: `http://localhost:8080` (or configured port)
* Health endpoints: `http://localhost:8080/actuator/health`
* OpenAPI/Swagger UI: `http://localhost:8080/swagger-ui.html` (if enabled in `dev` profile)

## Configuration & profiles

* Use `application.yml` for common configuration and `application-{profile}.yml` for environment overrides (`dev`, `test`, `prod`).
* Use `@ConfigurationProperties` classes for strongly-typed settings and validation.
* Recommended properties to document and configure via environment variables:

  * `spring.datasource.url`, `spring.datasource.username`, `spring.datasource.password`
  * `spring.profiles.active`
  * `management.endpoints.web.exposure.include` (restrict in prod)
  * `management.endpoint.health.probes.enabled` or custom healthgroup settings
  * `logging.level.root`, `logging.pattern.console` / JSON encoder
  * `management.metrics.export.prometheus.enabled`
  * `otel.*` settings if OpenTelemetry is enabled

**Local dev tip:** use `.env` or your IDE run configuration to set environment variables; never commit secrets.

## Database and migrations (Flyway/Liquibase)

* The template supports Flyway (recommended) or Liquibase. Migration scripts should live in `src/main/resources/db/migration`.

### Create and run migrations

```bash
# example using Flyway
./gradlew flywayMigrate -Dflyway.url=jdbc:postgresql://localhost:5432/mydb -Dflyway.user=postgres -Dflyway.password=secret
```

**Best practice:** run migrations as a CI/CD job or a Kubernetes Job *before* applying the new Deployment, not automatically from multiple replicas. Use a multi-release approach for destructive schema changes.

## Observability: logging, metrics, tracing, health

### Logging

* Structured JSON logging is recommended via Logback encoder. Include `application`, `environment`, and `request_id` (MDC) in logs.
* Use `CommonsRequestLoggingFilter` or custom filters to add request metadata. Avoid logging sensitive payloads in production.

### Metrics

* Micrometer is configured to expose Prometheus metrics via `/actuator/prometheus`.
* Add business metrics (counters, gauges, timers) to critical services.

### Tracing

* Integrate OpenTelemetry for distributed tracing. Enable via profile/env vars and configure an OTLP exporter to your collector (Jaeger/Tempo).
* Ensure HTTP clients, JDBC, and messaging are instrumented.

### Health

* Expose actuator health groups: `/actuator/health`, `/actuator/health/liveness`, `/actuator/health/readiness`.
* Health checks should verify DB connectivity, Redis (if used), and other critical dependencies. Readiness must return `UP` only when the app can serve traffic.

## Background processing & messaging

* For async workloads prefer separate worker deployments. Use Kafka, RabbitMQ, or Amazon SQS depending on your environment.
* Keep consumers idempotent and design retry/backoff and dead-letter handling.
* Example patterns included in the `events/` package (producers/consumers) — adapt to your broker.

## Testing strategy and examples

### Unit tests

* Use JUnit5 and Mockito (or MockK if using Kotlin). Keep unit tests isolated and fast.

### Integration tests

* Use Testcontainers to spin up Postgres, Kafka, Redis for integration tests in CI. Example:

```java
@Container
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine");
```

* Use `@SpringBootTest` slices and test only what is necessary.

### Contract and E2E tests

* Provider/consumer contract tests can be added with Pact or similar tools.
* E2E smoke tests should run against an ephemeral staging environment after image publish.

## Containerization & docker-compose for local stacks

### Dockerfile

* Use a multi-stage Dockerfile: build in Gradle/Maven image, then copy artifact to a slim runtime image (Eclipse Temurin slim or distroless).
* Run as non-root user, set `JAVA_TOOL_OPTIONS` or `JVM_OPTS` for heap sizing, and enable container-aware JVM options.

### docker-compose

* Provided `docker-compose.yml` includes Postgres and Redis services to run locally.

```bash
docker-compose up --build
# run migrations
docker-compose exec app ./gradlew flywayMigrate
```

## CI/CD recommendations (GitHub Actions example)

Recommended pipeline stages:

1. **Lint & static checks:** SpotBugs, Checkstyle, Spotless/format.
2. **Build & tests:** `./gradlew clean build` including integration tests (Testcontainers) where feasible.
3. **Security scans:** SCA (Dependabot/Snyk) and SBOM generation.
4. **Image build & scan:** Build Docker image, scan with Trivy, tag with `sha-<commit>` and `vX.Y.Z`.
5. **Push image & deploy to staging:** run smoke tests; if successful, promote image to production via GitOps or pipeline.

High-level GitHub Actions snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'
      - name: Build & test
        run: ./gradlew clean build
      - name: Build and push Docker image
        uses: docker/build-push-action@v3
        with:
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/my-service:sha-${{ github.sha }}
```

## Kubernetes deployment guidance

* Use Deployment + Service + Ingress (TLS) or API Gateway. Configure `readiness` -> `/actuator/health/readiness` and `liveness` -> `/actuator/health/liveness`.
* Use PodDisruptionBudget, resource requests/limits, and HPA (CPU/custom metrics).
* Run DB migrations as a Kubernetes Job or CI job before switching traffic to new images.
* Use ConfigMaps for non-sensitive config and Secrets for credentials. Consider external secret stores (Vault, K8s External Secrets).

Example readiness probe snippet:

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

## Security checklist for production

* Never commit secrets to VCS.
* Ensure `spring.profiles.active=prod` or `production` in release environments and disable dev-only endpoints.
* Protect actuator endpoints (basic auth, IP allowlist, or OAuth) in production.
* Enable SCA and fix critical vulnerabilities before release.
* Use TLS at the edge; consider mTLS for intra-cluster communication if required.
* Use least-privilege DB users and rotate credentials regularly.

## Troubleshooting & FAQ

**Application fails to start**

* Check logs for missing or invalid configuration. Verify DB credentials and network access.

**Migrations fail in CI/CD**

* Ensure the migration job has the required DB privileges and migrations are deterministic. Prefer running migrations from CI or in a single migration job.

**High latency / GC pressure**

* Tune JVM memory flags and GC. Monitor GC pauses and tune `-Xmx` relative to container limits.

**Health probe failing**

* Check dependency connectivity and timeouts. Increase probe timeouts if needed for slow startups.

## Next steps & extension ideas

* Add optional OpenTelemetry collector and example Grafana dashboards.
* Provide Helm chart and GitOps example (ArgoCD/Flux) for automated deployments.
* Integrate audit logging, feature flags, and API gateway examples.
* Add samples for OAuth2/OIDC integration (Keycloak) and role-based access control.
