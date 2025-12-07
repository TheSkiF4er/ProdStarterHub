# ProdStarter — Spring Boot (Java) API

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)
[![Template](template.json)](template.json)

> Production-ready Spring Boot (Java) template. Opinionated defaults for Micrometer, Actuator, structured logging, Flyway migrations, OpenAPI, containerization and Kubernetes deployments.

---

## Contents

* Quickstart
* Highlights & Features
* Project layout
* Configuration & profiles
* Run locally (IDE / CLI)
* Docker & docker-compose
* Health checks & observability
* Security
* Testing
* CI/CD & release recommendations
* Kubernetes & production deployment
* Template variables & customization
* Contributing
* License

---

## Quickstart

Clone the template and build/run the service locally:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/api/springboot-api-java
# copy into workspace
cp -R . ~/projects/my-service && cd ~/projects/my-service

# Build with Gradle wrapper
./gradlew clean build
# or run in development
./gradlew bootRun --args='--spring.profiles.active=dev'
```

Open:

* API root: `http://localhost:8080` (or configured port)
* Actuator health: `http://localhost:8080/actuator/health`
* OpenAPI/Swagger UI (dev): `http://localhost:8080/swagger-ui.html` (if enabled)

---

## Highlights & Features

* Production-focused Spring Boot starter with Java best practices.
* Typed configuration using `@ConfigurationProperties` and validation.
* Micrometer metrics and Prometheus export.
* Spring Boot Actuator with liveness/readiness and health groups.
* Flyway (optional) for database migrations with sample scripts.
* Structured JSON logging and request correlation (MDC).
* OpenAPI (springdoc) scaffolding and API versioning guidance.
* Multi-stage Dockerfile and `docker-compose.yml` for local stacks.
* Template metadata (`template.json`) for automated scaffolding.

---

## Project layout

```
src/main/java/com/prodstarter/    # application package (replaceable token)
  ├── Application.java           # app entrypoint + graceful shutdown
  ├── config/                    # typed configuration classes
  ├── controller/                # REST controllers
  ├── service/                   # business logic
  ├── repository/                # persistence layer
  └── events/                    # messaging producers/consumers
src/main/resources/
  ├── application.yml
  ├── application-dev.yml
  └── application-prod.yml
Dockerfile
docker-compose.yml
k8s/
tests/
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json
README.md
```

Notes:

* Replace `com.prodstarter` with your `GroupId` when scaffolding.
* Prefer modularization (api, service, infra) for large projects.

---

## Configuration & profiles

Configuration uses Spring profiles. Files:

* `application.yml` — common defaults
* `application-dev.yml` — developer defaults
* `application-prod.yml` — production overrides

Key environment variables and properties:

* `SPRING_PROFILES_ACTIVE` — `dev`/`prod`/`test`
* `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
* `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE`
* `LOGGING_LEVEL_ROOT`
* `OTEL_EXPORTER_OTLP_ENDPOINT` (if OpenTelemetry enabled)

Use platform secret stores (Vault, K8s Secrets) for production secrets. Include `.env.example` for local dev.

---

## Run locally (IDE / CLI)

### From IDE (IntelliJ)

* Import as Gradle/Maven project.
* Run `Application.java` with the `dev` profile: add `--spring.profiles.active=dev` to program arguments.

### From CLI

```bash
# Run using Gradle wrapper
./gradlew bootRun --args='--spring.profiles.active=dev'
# Or run the packaged jar
./gradlew bootJar
java -jar build/libs/my-service.jar --spring.profiles.active=dev
```

---

## Docker & docker-compose

A multi-stage `Dockerfile` and `docker-compose.yml` are included.

Build and run:

```bash
docker build -t my-service:dev .
docker run --rm -e SPRING_PROFILES_ACTIVE=dev -p 8080:8080 my-service:dev
# or with docker-compose
docker-compose up --build
```

Run migrations in container or as a CI job before exposing the service.

---

## Health checks & observability

* Actuator endpoints: `/actuator/health`, `/actuator/info`, `/actuator/prometheus` (if enabled).
* Readiness (`/actuator/health/readiness`) and liveness (`/actuator/health/liveness`) for orchestration.
* Micrometer metrics with Prometheus scraping.
* Structured logging (JSON) with MDC/correlation ID support.
* Optional OpenTelemetry traces export to OTLP/Jaeger.

---

## Security

* Do not commit secrets. Use K8s Secrets or a secret manager.
* Set `spring.profiles.active=prod` in production and limit actuator exposure.
* Enable TLS at the edge and consider mTLS inside cluster for service-to-service.
* Protect `/actuator` and `/metrics` behind auth or internal-only networks in production.
* Run dependency scans and address critical vulnerabilities.

---

## Testing

* Unit tests with JUnit5; integration tests with Testcontainers for DB/Kafka.
* Run tests:

```bash
./gradlew test
```

* CI should include lint/static-analysis, unit/integration tests, and security scans.

---

## CI/CD recommendations

* CI pipeline: format checks, static analysis, build, tests, image build, SBOM and security scans.
* Tag images with commit-SHA and semantic version tags.
* Run DB migrations in CI or as a Kubernetes Job prior to rolling updates.
* Use canary or blue/green deployments and automated smoke tests.

---

## Kubernetes & production deployment

* Deploy behind an API Gateway or Ingress with TLS.
* Use Deployment + Service + Ingress; readiness/liveness probes must point to actuator endpoints.
* Use resource requests/limits and HPA. Run migrations using a Job.
* Store secrets in secret manager and mount/inject at runtime.

---

## Template variables & customization

`template.json` parameters: `ProjectName`, `GroupId`, `ArtifactId`, `Author`, `Company`, `License`, `JavaVersion`, `BuildTool`, and feature flags for Docker, Flyway, OpenTelemetry, GitHub Actions and Tests.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Run linters and tests locally.
3. Open a PR and reference `TASKS.md` items covered by your changes.
4. Ensure CI passes and reviewers approve before merging.

---

## License

This template is provided under the Apache-2.0 License. See `LICENSE` for details.
