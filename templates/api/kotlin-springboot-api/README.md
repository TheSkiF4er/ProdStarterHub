# ProdStarter — Kotlin Spring Boot API

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Template](template.json)](template.json)

> Production-ready Kotlin + Spring Boot template. Opinionated defaults for Micrometer, Actuator, structured logging, Flyway migrations, OpenAPI, containerization and Kubernetes deployments.

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
cd ProdStarterHub/templates/api/kotlin-springboot-api
# copy into workspace
cp -R . ~/projects/my-service && cd ~/projects/my-service

# Build with Gradle wrapper
./gradlew clean build
# or run in development
./gradlew bootRun -Dspring.profiles.active=dev
```

Open `http://localhost:8080` (or configured port). Actuator endpoints available under `/actuator` when enabled. OpenAPI/Swagger UI is available in dev if configured.

---

## Highlights & Features

* Production-ready Spring Boot starter with Kotlin idioms.
* Micrometer metrics and common tags (application, environment).
* Spring Boot Actuator with health/readiness/liveness groups.
* Flyway migrations scaffold and sample migrations (if enabled).
* Structured JSON logging and request correlation support.
* OpenAPI (springdoc) scaffolding and API versioning guidance.
* Multi-stage Dockerfile and `docker-compose.yml` for local stacks.
* Template metadata for generator integration (`template.json`).
* Optional OpenTelemetry, Celery-like worker guidance (via background module), and GitHub Actions CI sample.

---

## Project layout

```
├── build.gradle.kts or pom.xml
├── src/main/kotlin/com/prodstarter/    # application package (replaceable token)
│   ├── Application.kt                  # app entrypoint + graceful shutdown
│   ├── config/                         # typed config classes
│   ├── controller/                     # REST controllers
│   ├── service/                        # business logic
│   ├── repository/                     # persistence layer
│   └── background/                     # message consumers / schedulers
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   └── application-prod.yml
├── Dockerfile
├── docker-compose.yml
├── k8s/
├── tests/
├── ARCHITECTURE.md
├── TUTORIAL.md
├── TASKS.md
├── template.json
└── README.md
```

Notes:

* Replace `com.prodstarter` with your `GroupId` if you use the template engine or manual search/replace.
* Prefer splitting into modules (api, service, infra) for larger systems.

---

## Configuration & profiles

Configuration follows Spring profiles and externalized config practices. Files:

* `application.yml` — common defaults
* `application-dev.yml` — developer-friendly defaults (H2/local DB, swagger enabled)
* `application-prod.yml` — production overrides (DB URL from secrets, actuator locked down)

Important environment variables / properties:

* `SPRING_PROFILES_ACTIVE` — `dev` / `prod` / `test`
* `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
* `FLYWAY_*` — Flyway migration settings
* `MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE` — restrict actuator endpoints in prod
* `LOG_LEVEL_ROOT` — control logging verbosity

Secrets should be provided by your platform (Kubernetes Secrets, Vault, cloud secret manager).

---

## Run locally (IDE / CLI)

### From IDE (IntelliJ):

* Import project as Gradle/Maven.
* Run `Application.kt` with `dev` profile: set `SPRING_PROFILES_ACTIVE=dev`.

### From CLI:

```bash
./gradlew bootRun -Dspring.profiles.active=dev
# or run the packaged jar
./gradlew bootJar && java -jar build/libs/my-service.jar --spring.profiles.active=dev
```

---

## Docker & docker-compose

A multi-stage `Dockerfile` is included. Example build/run:

```bash
docker build -t my-service:dev .
docker run --rm -e SPRING_PROFILES_ACTIVE=dev -p 8080:8080 my-service:dev
```

`docker-compose.yml` is provided for local stacks (Postgres, Redis). Use:

```bash
docker-compose up --build
# run migrations (Flyway) if needed
```

Make sure to mount or provide `.env` for local secrets — do not commit `.env`.

---

## Health checks & observability

* Actuator endpoints: `/actuator/health`, `/actuator/metrics`, `/actuator/info` (configurable).
* Readiness and liveness probes available via actuator health groups; map to k8s probes.
* Micrometer + Prometheus: expose `/actuator/prometheus` for scraping.
* Logging: JSON encoder option for Logback included; add MDC/correlation ID filter to propagate request IDs.
* Tracing: optional OpenTelemetry configuration hooks are present in the template (enable via profile).

---

## Security

* Do not commit secrets. Use platform secret stores.
* Default to `production` profile for releases; ensure debug logging is disabled.
* Protect actuator endpoints in production (authentication or IP allowlist).
* Use OAuth2/OIDC or an API Gateway for auth; document the recommended approach for your organization.
* Enable dependency scanning (Dependabot / Snyk) and fix critical vulnerabilities before release.

---

## Testing

* Unit tests with JUnit5 and MockK (Kotlin-friendly).
* Integration tests using Spring Boot test slices and Testcontainers for Postgres/Kafka.
* Run tests locally:

```bash
./gradlew test
```

* Add E2E smoke tests in CI that verify health endpoints and a handful of API calls against the built image.

---

## CI/CD & release recommendations

* CI pipeline should run: formatting/linting (ktlint/detekt), unit + integration tests, build artifact, and static analysis.
* Build Docker images with commit-SHA tags and publish to a registry (GHCR, Docker Hub).
* Use immutable images and promote the same image between environments.
* Run Flyway migrations as a CI/CD job or a pre-deploy Kubernetes Job.
* Use canary or blue/green strategies for low-risk releases and maintain rollback steps.

---

## Kubernetes & production deployment

Recommended manifests/helm values:

* Deployment with resource `requests`/`limits` and `readiness`/`liveness` probes pointing to actuator endpoints.
* Service (ClusterIP) and Ingress/IngressRoute for TLS termination.
* ConfigMaps for non-sensitive config and Secrets for credentials.
* PodDisruptionBudget for availability during maintenance.
* Run migrations as a Job before switching traffic to a new release.

Example probe snippet:

```yaml
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
```

---

## Template variables & customization

`template.json` exposes parameters to customize name, groupId, Java version, build tool, and optional features (Docker, Flyway, OpenTelemetry, GitHub Actions, Tests). Use these to automate scaffolding and token replacement.

---

## Contributing

Contributions are welcome. Please:

1. Fork the repo and create a branch.
2. Run linters and tests locally before committing.
3. Open a PR with a clear description and reference related TODOs in `TASKS.md`.
4. Ensure CI is green and reviewers approve before merging.

Refer to `CONTRIBUTING.md` if present for code style and PR requirements.

---

## License

This template is provided under the MIT License. See the `LICENSE` file for details.
