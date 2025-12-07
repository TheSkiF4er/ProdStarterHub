# PRODSTARTER.KOTLIN.SPRINGBOOT — TUTORIAL

This tutorial walks you through creating, running, testing, and deploying a new service scaffolded from the `kotlin-springboot-api` template in **ProdStarterHub**. It focuses on production-ready practices: configuration, building, containerization, DB migrations, observability, testing, and CI/CD.

> Audience: backend engineers, DevOps engineers, and technical leads who will build and operate Kotlin + Spring Boot microservices.

---

## Table of contents

1. [Prerequisites](#prerequisites)
2. [Get the template & scaffold a project](#get-the-template--scaffold-a-project)
3. [Project layout overview](#project-layout-overview)
4. [Build systems: Gradle (recommended) and Maven](#build-systems-gradle-recommended-and-maven)
5. [Local development (run & debug)](#local-development-run--debug)
6. [Docker and docker-compose (local stacks)](#docker-and-docker-compose-local-stacks)
7. [Configuration & profiles](#configuration--profiles)
8. [Database, JPA/R2DBC and migrations (Flyway/Liquibase)](#database-jpar2dbc-and-migrations-flywayliquibase)
9. [Observability: Logging, Metrics, Tracing, Health](#observability-logging-metrics-tracing-health)
10. [Background jobs & messaging](#background-jobs--messaging)
11. [Testing strategy and examples](#testing-strategy-and-examples)
12. [CI/CD recommendations (GitHub Actions example)](#cicd-recommendations-github-actions-example)
13. [Kubernetes deployment guidance](#kubernetes-deployment-guidance)
14. [Security checklist for production](#security-checklist-for-production)
15. [Troubleshooting & FAQ](#troubleshooting--faq)
16. [Next steps & extension points](#next-steps--extension-points)

---

## Prerequisites

* JDK 17 or 21 (Temurin or other modern distribution). The template targets Java 17 by default but supports Java 21 where specified.
* Gradle (recommended) or Maven (wrapper included in the project so system-wide install is optional).
* Docker & docker-compose for local stacks and container builds.
* Git and an account on a container registry (GHCR, Docker Hub) for publishing images.
* Optional: Kubernetes (minikube / kind) and kubectl for cluster testing.

## Get the template & scaffold a project

Clone the ProdStarterHub repository and copy the Kotlin Spring Boot template folder:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/kotlin-springboot-api

# Copy template to a new project folder
cp -R . ~/projects/my-service
cd ~/projects/my-service
```

Replace package tokens (`com.prodstarter`) if you want to rename the project package. If you use an automated generator, set `ProjectName` and `GroupId` variables consistently across files.

## Project layout overview

```
├── build.gradle.kts or pom.xml
├── gradle/ or .mvn/
├── src/main/kotlin/com/prodstarter/
│   ├── Application.kt
│   ├── config/                # typed @ConfigurationProperties classes
│   ├── controller/            # REST controllers
│   ├── service/               # business logic
│   ├── repository/            # Spring Data repositories / DAOs
│   ├── model/                 # DTOs & domain models
│   └── background/            # message consumers, schedulers
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
├── Dockerfile
├── docker-compose.yml
├── k8s/                       # optional manifests / Helm chart
├── tests/
├── ARCHITECTURE.md
├── TUTORIAL.md
├── TASKS.md
└── README.md
```

## Build systems: Gradle (recommended) and Maven

### Gradle (recommended)

Use the Gradle wrapper included with the template. Common commands:

```bash
# Build and run tests
./gradlew clean build

# Run application from Gradle
./gradlew bootRun

# Create runnable jar
./gradlew bootJar
```

Set `JAVA_HOME` to your JDK installation if needed.

### Maven

If your fork uses Maven, the template provides a `pom.xml` alternative. Common commands:

```bash
# Build and run tests
./mvnw clean package

# Run the Spring Boot app
./mvnw spring-boot:run
```

## Local development (run & debug)

### Run from IDE

Open the project in IntelliJ IDEA (recommended). Import as a Gradle project. Run `Application.kt` as a Kotlin application using `dev` profile:

* Program arguments / environment: `-Dspring.profiles.active=dev` or set `SPRING_PROFILES_ACTIVE=dev`.

### Run from CLI

Use Gradle wrapper:

```bash
./gradlew bootRun -Dspring.profiles.active=dev
```

By default, in development the app exposes:

* HTTP API (e.g. `http://localhost:8080`) — controllers under `/api/v1` if the template applies versioning.
* Swagger/OpenAPI UI (if enabled in dev): `/swagger-ui.html` or `/swagger-ui/index.html` depending on the library.
* Actuator endpoints: `/actuator/health`, `/actuator/metrics` (exposure depends on config).

## Docker and docker-compose (local stacks)

### Dockerfile

A multi-stage Dockerfile is included which:

* builds the application (Gradle or Maven) in a builder stage,
* produces a minimal runtime image (Temurin slim or distroless),
* runs the JVM with sensible containerized defaults.

Build the image:

```bash
docker build -t my-service:dev .
```

Run with environment variables (example):

```bash
docker run --rm -e SPRING_PROFILES_ACTIVE=dev -p 8080:8080 my-service:dev
```

### docker-compose

The dev `docker-compose.yml` spins up Postgres and Redis alongside the application for local integration testing. Start the stack:

```bash
docker-compose up --build
```

Run migrations (Flyway/Liquibase) in the compose context or via a dedicated container/job before the app accepts traffic.

## Configuration & profiles

The template uses Spring profiles and `application-*.yml` files. Common profiles:

* `dev` — developer defaults (H2 or local Postgres, Swagger enabled, verbose logging)
* `test` — CI/test settings (in-memory DB or testcontainers)
* `prod` or `production` — secure production configuration (DB URL from secrets, minimal actuator exposure, non-verbose logging)

Example to run with production profile locally (use secrets for credentials):

```bash
SPRING_PROFILES_ACTIVE=prod docker run -e SPRING_PROFILES_ACTIVE=prod -p 8080:8080 my-service:dev
```

Keep secrets in environment variables or injected secrets (Kubernetes Secrets, Vault).

## Database, JPA/R2DBC and migrations (Flyway/Liquibase)

### Choose persistence API

* Use Spring Data JPA (Hibernate) for synchronous, relational persistence.
* For reactive workloads, consider Spring Data R2DBC and an async Postgres driver.

### Migrations

* Flyway is recommended and included by default in many templates. Migrations live under `src/main/resources/db/migration`.
* Create a new migration:

```bash
# example for Flyway SQL migration
cat > src/main/resources/db/migration/V1__create_tables.sql <<'SQL'
-- SQL statements
SQL
```

* Apply migrations:

  * Flyway runs on application startup by default (configurable), or
  * Run migrations as a CI/CD step (preferred) before new pods receive traffic.

### Migration strategy

* **Preferred:** run migrations in CI or as a controlled Kubernetes Job that finishes before routing traffic to new replicas.
* **For destructive changes:** employ multi-release migration: add columns, backfill, switch to new column, then remove old column in a later deployment.

## Observability: Logging, Metrics, Tracing, Health

### Logging

* The template configures Logback with a JSON encoder option (for structured logs) or a console pattern for dev.
* Include MDC/correlation id (X-Request-Id) in logs. Use a filter to propagate and expose correlation IDs.

### Metrics

* Micrometer is preconfigured — expose application and JVM metrics to Prometheus via `/actuator/prometheus`.
* Tag meters with `application` and `environment` common tags.

### Tracing

* Integrate OpenTelemetry or Brave. The template provides hooks to initialize OTLP exporters; configure exporter endpoint via env var (e.g. `OTEL_EXPORTER_OTLP_ENDPOINT`).
* Propagate trace context across HTTP clients (WebClient) and messaging systems.

### Health

* Use Spring Boot Actuator health groups and readiness/liveness probes:

  * `GET /actuator/health` — composite health
  * `GET /actuator/health/readiness` — readiness
  * `GET /actuator/health/liveness` — liveness

Protect actuator endpoints in production or expose only selected endpoints.

## Background jobs & messaging

* For streaming/event-driven patterns, add Kafka or RabbitMQ dependencies and implement consumers using `@KafkaListener` or Spring AMQP.
* For scheduled tasks, use `@Scheduled` for simple jobs or delegate to a worker service for heavy tasks.
* Run consumers/workers as separate Deployments when they are heavy or require distinct scaling.

## Testing strategy and examples

### Unit tests

* Use JUnit5 + MockK for Kotlin friendly mocking and assertions.
* Keep unit tests fast and isolated from the Spring context when possible.

### Integration tests

* Use `@SpringBootTest` with Testcontainers to spin up Postgres/Kafka for integration tests in CI.
* Example test snippet:

```kotlin
@SpringBootTest
@Testcontainers
class ExampleIntegrationTest {
  @Container
  val postgres = PostgreSQLContainer("postgres:15-alpine").apply { withDatabaseName("test") }

  @Test
  fun `health endpoint returns UP`() {
    // call actuator/health and assert
  }
}
```

### Contract & E2E tests

* Use REST-assured or http4k tests for API contracts.
* Smoke tests in CI: deploy image to ephemeral environment and run health checks + simple API calls.

## CI/CD recommendations (GitHub Actions example)

A recommended pipeline:

1. **Lint & static analysis:** ktlint, detekt, spotless check
2. **Build & tests:** `./gradlew clean build` (unit + integration on Testcontainers if CI supports it)
3. **Security scans:** SCA or dependency checks
4. **Build Docker image:** use buildx for cross-platform images and tag with `sha-${{ github.sha }}`
5. **Push image to registry** (on `main` or release tags)
6. **Deploy to staging** and run smoke tests
7. **Promote image to production** with canary/blue-green deployments

High-level GitHub Actions snippet:

```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with: distribution: 'temurin', java-version: '17'
      - name: Build and test
        run: ./gradlew clean build
      - name: Build and push Docker image
        uses: docker/build-push-action@v3
        with:
          push: true
          tags: ghcr.io/${{ github.repository_owner }}/my-service:sha-${{ github.sha }}
```

## Kubernetes deployment guidance

Key recommendations:

* Use Deployment + Service + Ingress (TLS) or API Gateway.
* Use readiness and liveness probes pointing to actuator readiness and liveness endpoints.
* Use resource requests/limits, PodDisruptionBudget, and HPA for autoscaling.
* Run DB migrations as a pre-deploy Job or from CI before updating Deployments.
* Use ConfigMaps for non-sensitive configuration and Secrets for credentials.

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

* Do not store secrets in the repository. Use platform-managed secrets (Kubernetes Secrets, Vault, AWS Secrets Manager).
* Set `spring.profiles.active=prod` and `management.endpoints.web.exposure.include` to a minimum in production.
* Protect actuator endpoints behind authentication and IP restrictions.
* Enforce TLS at the edge and consider mTLS inside the cluster if required.
* Use least-privilege DB accounts and rotate credentials regularly.
* Enable Dependabot/SCA and schedule regular dependency maintenance.

## Troubleshooting & FAQ

**Application fails with DB connection errors**

* Verify `spring.datasource.url` / `SPRING_DATASOURCE_URL` and ensure the DB is reachable from the container/network.
* Check DB username/password and network security groups.

**Actuator endpoints are not accessible**

* Confirm `management.endpoints.web.exposure.include` in the active profile. In production, actuator exposure is intentionally limited.

**High memory usage / OOMs**

* Tune JVM flags and container memory limits. Use `-Xmx` and `-Xms` settings appropriate to container size and enable container-aware JVM settings.

**Migrations failing in CI/CD**

* Ensure the migration job has DB privileges and that migrations are deterministic. Consider running migrations in a separate, idempotent Job.

## Next steps & extension points

* Add OAuth2/OIDC integration (Keycloak or cloud provider) for authentication.
* Integrate OpenTelemetry collector and provide Grafana dashboards for standard JVM and app metrics.
* Add a separate worker module (Spring Boot app) for heavy background processing.
* Provide a Helm chart for production deployment and GitOps examples (ArgoCD / Flux).
