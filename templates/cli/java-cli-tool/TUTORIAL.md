# PRODSTARTER.CLI.JAVA — TUTORIAL

This tutorial walks you through scaffolding, building, testing, running, packaging, and releasing a CLI produced from the `java-cli-tool` template in **ProdStarterHub**. It focuses on production-ready practices: configuration, observability, graceful shutdown, reproducible builds, testing, and CI/CD.

> Audience: Java developers, DevOps engineers, SREs, and maintainers building native CLI utilities and worker services in Java.

---

## Table of contents

1. Prerequisites
2. Scaffold the template and initial setup
3. Project layout overview
4. Build systems (Maven & Gradle) and recommended project files
5. Local build & run
6. Configuration: precedence and examples
7. Commands & examples
8. Logging, metrics & health probes
9. Testing strategy (unit, integration, e2e)
10. Packaging, distribution & release artifacts
11. Containerization & reproducible builds
12. CI/CD recommendations (GitHub Actions examples)
13. Troubleshooting & debugging
14. Release checklist
15. Next steps & extension ideas

---

## 1. Prerequisites

* JDK 17 or later (LTS recommended; pin the version in CI). Install from vendors such as Temurin or Azul.
* Maven 3.8+ or Gradle 7+ (if using Gradle). Use wrapper (`mvnw` / `gradlew`) in the repo for reproducible tooling.
* Git, Docker (optional), and a code editor (IntelliJ IDEA / VS Code).
* Tools for testing and static analysis: JUnit 5, Mockito, SpotBugs, Checkstyle/Spotless, and SCA tooling (Dependabot, Snyk).

## 2. Scaffold the template and initial setup

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/cli/java-cli-tool
cp -R . ~/projects/my-java-tool
cd ~/projects/my-java-tool
```

If `template.json` supports replacements, replace package and artifact identifiers. Otherwise update `groupId`/`artifactId` in `pom.xml` or `build.gradle`.

Initialize a Git repository and create an initial branch:

```bash
git init
git checkout -b feature/initial
```

## 3. Project layout overview

```
src/main/java/com/prodstarter/   # Tool.java + commands + services
src/test/java/                  # unit & integration tests
pom.xml or build.gradle         # build configuration
Dockerfile                      # multi-stage reproducible build
docs/                           # README, USAGE, ARCHITECTURE, TASKS
configs/                        # example config files (dev/prod)
LICENSE

```

`Tool.java` is intentionally minimal: bootstrap logging and configuration, register Picocli subcommands, and delegate work to services in `service/`.

## 4. Build systems (Maven & Gradle)

You can use Maven or Gradle. The template is compatible with both; pick one and keep it consistent.

### Recommended Maven features

* Use `maven-shade-plugin` or `spring-boot-maven-plugin` (if using Spring lightweight) to create a fat JAR.
* Use `maven-enforcer-plugin` and `maven-compiler-plugin` to pin Java version.
* Include SpotBugs, Checkstyle, and license plugins for CI checks.

### Recommended Gradle features

* Use `shadow` plugin to produce fat JAR.
* Use `toolchains` to pin JDK for reproducible builds.
* Add `spotless` and `checkstyle` for formatting and static checks.

A sample `pom.xml` or `build.gradle` may be added by the template generator; if not, create one before building.

## 5. Local build & run

### Using Maven

```bash
# build and run unit tests
./mvnw -DskipTests=false clean verify

# build fat jar
./mvnw -DskipTests=true package
# run
java -jar target/my-tool-1.0.0.jar run --input data.json
```

### Using Gradle

```bash
# build and test
./gradlew clean check

# build fat jar (with shadow)
./gradlew shadowJar
# run
java -jar build/libs/my-tool-all.jar run --input data.json
```

### Development iteration

* Run `Tool` from your IDE to iterate faster with debug and breakpoints.
* Use `--config` to point to local config files and `-v`/`--verbose` to increase logging.

## 6. Configuration: precedence and examples

Configuration precedence (highest → lowest):

1. Command-line flags (Picocli options)
2. Config file passed via `--config` (properties, YAML or JSON)
3. Environment variables (prefixed like `PROD_` or `APP_`)
4. Defaults embedded in code

Example `configs/development.properties`:

```properties
app.name=prodstarter-tool
app.log.json=false
metrics.enabled=false
```

Use environment variables for secrets and CI-injected values. Document required env vars in `USAGE.md`.

## 7. Commands & examples

Template includes the following subcommands (examples):

* `run` — run the main processing pipeline (supports `--input`, `--dry-run`).
* `config` — print effective configuration.
* `version` — print version/build metadata.
* `serve-metrics` — run an HTTP server with `/metrics`, `/ready`, `/live`.

Examples:

```bash
# dry-run processing
java -jar target/my-tool-1.0.0.jar run --input payload.json --dry-run

# run metrics server
java -jar target/my-tool-1.0.0.jar serve-metrics --listen 0.0.0.0:9090

# print configuration
java -jar target/my-tool-1.0.0.jar config configs/development.properties
```

Commands should return documented exit codes and support `--json` output where automation is expected.

## 8. Logging, metrics & health probes

### Logging

* Use SLF4J API and a concrete backend (Logback or Log4j2).
* Development: console-friendly pattern. Production: JSON layout for aggregator ingestion.
* Enable log level override via CLI or config (e.g., `-v`/`--verbose` or `logging.level` property).

### Metrics

* For worker mode, expose Prometheus-compatible metrics or integrate with Micrometer.
* The `serve-metrics` command should expose `/metrics`, `/ready`, `/live`.

### Health probes

* `/ready` should reflect application readiness (config and downstream dependencies OK).
* `/live` should return liveness; if unhealthy, respond non-200.

## 9. Testing strategy (unit, integration, e2e)

### Unit tests

* Use JUnit 5. Keep core logic in services and mock adapters with Mockito.
* Run unit tests as part of PR checks.

### Integration tests

* Use Testcontainers for external dependencies (Postgres, Kafka) where needed.
* Place integration tests in a separate profile (Maven `integration-test`) or Gradle `integrationTest` task.

### E2E / Smoke tests

* After packaging, run the JAR in an ephemeral environment and assert exit codes and endpoints (metrics/health).
* Smoke tests can be a separate CI job that validates the artifact before release.

### Static analysis

* Run SpotBugs, Checkstyle, and license checks in CI.

## 10. Packaging, distribution & release artifacts

Produce one or more of the following artifacts:

* **Fat JAR**: `my-tool-1.2.3.jar` — simplest to distribute (`java -jar`).
* **Tarball**: `my-tool-1.2.3-linux-x64.tar.gz` containing the JAR, LICENSE, USAGE.md, and checksum.
* **Container image**: multi-stage Docker image with a minimal runtime (distroless or slim JRE).
* **Native image** (optional): use GraalVM native-image for small, fast-starting binary.

For releases include checksums and optionally GPG signatures.

## 11. Containerization & reproducible builds

Use a multi-stage Dockerfile:

1. **Build stage**: use Maven/Gradle to produce the fat JAR.
2. **Runtime stage**: use a minimal JRE or distroless base image and copy the JAR.

Example (high-level):

```Dockerfile
FROM maven:3.8-jdk-17 AS build
WORKDIR /workspace
COPY . .
RUN mvn -DskipTests package

FROM eclipse-temurin:17-jre-jammy
COPY --from=build /workspace/target/my-tool-1.0.0.jar /app/my-tool.jar
ENTRYPOINT ["java", "-jar", "/app/my-tool.jar"]
```

Scan final image with Trivy in CI and run smoke tests after pushing.

## 12. CI/CD recommendations (GitHub Actions examples)

Suggested pipeline:

* **PR checks**: `mvn -DskipTests=false verify` or `./gradlew check`, run SpotBugs and Checkstyle, run unit tests.
* **Integration**: run integration tests (Testcontainers) on merge or nightly.
* **Publish**: build artifacts for release (fat JAR, tarball), generate checksums, sign, and upload to GitHub Releases.
* **Image publish**: build Docker image, scan with Trivy, push to registry with immutable tag.

Example GitHub Actions job snippet (build & test):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK
        uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17
      - name: Build and test
        run: ./mvnw -DskipTests=false clean verify
```

## 13. Troubleshooting & debugging

* Increase logging verbosity (`-v` or `--debug`) to capture more details.
* For JVM issues, collect thread dumps with `jstack`, heap dumps with `jmap`, and GC logs.
* If a native-image is used, ensure you have debug symbols and test the image thoroughly on target OS.
* For container issues, run the image locally and inspect logs and health endpoints.

## 14. Release checklist

Before tagging a release:

* Ensure CI passes for build, tests, static analysis and vulnerability checks.
* Artifacts produced and checksums generated.
* GPG-sign artifacts if required by your organization.
* Update `CHANGELOG.md` and release notes.
* Validate the release artifact with smoke tests (run commands, check metrics endpoint, check exit codes).

## 15. Next steps & extension ideas

* Add OpenTelemetry instrumentation and OTLP exporter for distributed tracing.
* Provide shell completion generation (bash, zsh, powershell) using Picocli's completion features.
* Add a plugin or extension mechanism for third-party extensions (careful with classloader complexity).
* Provide installation packages (deb/rpm/MSI) for enterprise deployments.
