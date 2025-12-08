# PRODSTARTER.CLI.JAVA — ARCHITECTURE

> Production-ready architecture document for the `java-cli-tool` template. This document captures design principles, component responsibilities, configuration, packaging, observability, security, testing strategy, CI/CD, and an operational runbook for a hardened Java-based command-line tool.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout
5. Core components & responsibilities
6. Configuration & environment
7. Logging, metrics & tracing
8. Error handling & exit codes
9. Signal handling & graceful shutdown
10. Security considerations
11. Packaging, distribution & release strategy
12. Testing strategy
13. CI/CD & quality gates
14. Operational runbook & troubleshooting
15. Extending the template
16. References

---

## 1. Purpose & goals

The `java-cli-tool` template is an opinionated, production-grade starting point for building CLI utilities in Java. It aims to provide:

* A clear and testable structure using small, focused components.
* Robust configuration and environment handling (file + env + flags).
* Observability: structured logging, health probes and optional metrics.
* Predictable lifecycle: graceful shutdown, deterministic exit codes.
* Reproducible builds and packaging for distribution (fat JAR, native image, container).

Intended users: DevOps engineers, backend engineers, SREs, and teams shipping platform utilities and automation scripts in Java.

## 2. Non-functional requirements

* **Portability:** run on JVMs across Linux, macOS, and Windows.
* **Reliability:** deterministic exit codes, graceful termination, and clear error propagation.
* **Performance:** adequate startup time for short-lived commands; efficient streaming IO.
* **Security:** safe defaults, avoid leaking secrets, and validate inputs.
* **Maintainability:** modular layout, DI-friendly services, and test coverage.

## 3. High-level architecture

```
User/Scripts -> CLI (picocli) -> Command Handlers -> Services -> Infra Adapters
                                          |                          |
                                          +--> Logging/Telemetry      +--> External systems (HTTP, DB, Message Queues)
```

* Picocli handles parsing and help generation. Command handlers are thin and delegate to services.
* Services encapsulate business logic and call infra adapters (HTTP clients, DB connectors, file system).
* Observability and telemetry are pluggable and configured via application settings.

## 4. Project layout

Opinionated layout to scale from small tools to more complex utilities:

```
src/main/java/com/prodstarter/
  ├─ Tool.java                     # CLI bootstrap (picocli wiring)
  ├─ commands/                     # command handler classes (RunCommand, ConfigCommand...)
  ├─ service/                      # business services and interfaces
  ├─ infra/                        # adapters (http, file, db clients)
  ├─ config/                       # config loader and typed configuration classes
  └─ util/                         # logging, metrics, helpers

src/test/java/...                  # unit and integration tests
build.gradle or pom.xml            # build configuration
Dockerfile                         # optional reproducible container image
docs/                              # README, USAGE, TUTORIAL, ARCHITECTURE

```

Notes:

* Keep `Tool.java` minimal; it should only bootstrap config, logging and register commands.
* Place production logic into `service` and `infra` packages to allow for easy unit testing and mocking.

## 5. Core components & responsibilities

### CLI bootstrap (`Tool.java`)

* Wire Picocli subcommands and global options (verbosity, config path).
* Provide a consistent execution flow and mapping to exit codes.
* Install graceful shutdown semantics and lifecycle hooks.

### Command handlers

* Implement `Callable<Integer>` or `Runnable` as Picocli commands.
* Validate inputs, call services, handle exceptions, and return exit codes.
* Be small — delegate heavy lifting to services.

### Services

* Contain business logic and orchestrate infra adapters.
* Use interfaces to enable mocking in tests.
* Design methods to accept Cancellation/Timeout tokens if applicable (use Java `Future`/`CompletableFuture` with timeouts).

### Infra adapters

* Wrap HTTP clients, database clients, filesystem interactions, and third-party integrations.
* Apply retry/backoff and timeout policies at the adapter boundary (e.g., using Resilience4j or custom logic).

### Configuration loader

* Load config from file (properties/YAML/JSON) and merge with environment variables.
* Validate required settings and provide defaults.

### Observability

* Structured logs (SLF4J API with Logback/log4j2 implementation), metrics endpoint (optional), and health probes.

## 6. Configuration & environment

Configuration precedence (highest → lowest):

1. Command-line options (Picocli flags)
2. Explicit configuration file passed via `--config` (properties or YAML)
3. Environment variables (e.g., `PROD_`, `APP_` prefixes)
4. Default values embedded in the template

Guidelines:

* Use typed configuration objects (POJOs) and validate them at startup.
* Keep secrets out of checked-in files; document secret injection via environment variables or secret stores.
* Support `--config` to allow users to provide environment-specific settings.

## 7. Logging, metrics & tracing

### Logging

* Use SLF4J API with a concrete implementation (Logback or Log4j2). Default to console appenders.
* Structured logging (JSON) in production is recommended for log aggregators; human-readable console logs for local dev.
* Include contextual fields: `application`, `environment`, `version`, and optional `correlationId`.

### Metrics

* For long-running worker modes, provide a metrics HTTP endpoint exposing Prometheus-format metrics.
* Keep metrics lightweight for short-lived commands; emit counters/stats to stdout or a metrics backend if required.

### Tracing

* Expose an extension point to integrate OpenTelemetry (OTLP exporter) in environments where tracing is used.
* Propagate trace/correlation IDs through external calls (HTTP headers, message attributes).

## 8. Error handling & exit codes

* Define a small, documented set of exit codes used across commands. Example:

  * `0` — Success
  * `1` — Generic failure
  * `2` — Invalid arguments
  * `3` — Configuration error
  * `4` — Runtime error (external dependency failure)
  * `130` — Interrupted (SIGINT)

* Commands should catch domain exceptions and convert them to user-friendly messages and appropriate exit codes.

* For machine automation, support `--json` or `--machine-readable` output modes.

## 9. Signal handling & graceful shutdown

* Add JVM shutdown hooks that set cancellation flags and perform short cleanup tasks.
* For blocking operations, use interruptible APIs or check cancellation flags and terminate promptly.
* For HTTP servers (metrics/health), call `server.stop()` with a short graceful timeout.

## 10. Security considerations

* **Secrets:** do not commit secrets. Encourage environment injection or secret manager integration.
* **Input validation:** validate and sanitize file paths, URLs, and any untrusted inputs to prevent path traversal or command injection.
* **External calls:** use TLS and validate certificates for external endpoints.
* **Dependency management:** keep dependencies current and run SCA (software composition analysis) and dependency vulnerability tools in CI.
* **Principle of least privilege:** do not require elevated privileges to run the tool. Document if elevated rights are needed for specific operations.

## 11. Packaging, distribution & release strategy

### Artifact types

* **Fat JAR (uber/fat jar):** includes all dependencies — simple to distribute and run with `java -jar`.
* **Platform-specific native image:** build via GraalVM native-image for extremely fast startup and small memory footprint (optional, requires testing).
* **Container image:** multi-stage Docker image to run in containerized workflows.

### Release artifacts

* Produce versioned artifacts (e.g., `tool-1.2.3.jar`, `tool-1.2.3-linux-x64.tar.gz`) with checksums and optional signatures.
* Publish to GitHub Releases, package repository, or internal artifact store.

### Build reproducibility

* Pin toolchain versions in CI (JDK version) and build with deterministic flags where supported.
* Record build metadata (version, commit, build timestamp) in manifest properties or system properties.

## 12. Testing strategy

### Unit tests

* Use JUnit 5. Keep business logic in services testable without starting the CLI.
* Mock infra adapters with Mockito or similar frameworks.

### Integration tests

* Use testcontainers to spin up databases or message brokers when testing integrations.
* Provide integration tests that execute the command as a process where appropriate to validate CLI behavior end-to-end.

### Contract & e2e tests

* For critical external integrations, maintain contract tests (e.g., Pact) to avoid breaking provider changes.

### Static analysis & security

* Run SpotBugs, Checkstyle or PMD, and dependency vulnerability scans in CI.

## 13. CI/CD & quality gates

Recommended pipeline (GitHub Actions / GitLab / Jenkins):

1. **PR validation:** build, unit tests, static analysis (Checkstyle/SpotBugs), format checks.
2. **Integration stage:** run integration tests (Testcontainers) on merge or nightly.
3. **Packaging stage:** create artifacts (fat jar, docker image), run smoke tests against produced artifacts.
4. **Security stage:** SCA and vulnerability scans; fail release on critical issues.
5. **Release stage:** tag, sign artifacts, publish to releases and registries.

Use pinned JDK versions (`.java-version`, `toolchains.xml` or CI runner images) for reproducible builds.

## 14. Operational runbook & troubleshooting

Before deploying or handing to users:

* Ensure configuration is documented and secret handling is in place.
* Ensure logging pipeline and metrics ingestion are configured.
* Prepare smoke tests that verify essential commands and probes.

Troubleshooting steps:

1. Re-run the command with increased verbosity (`-v`) or `--debug` flags.
2. If crash occurs, collect JVM thread dump and GC logs (`jcmd`, `jstack`).
3. Collect application logs with correlation ids; examine external dependency traces.
4. If native-image is used, ensure core dumps and native debugging symbols are available.

## 15. Extending the template

* Add an optional DI container (Dagger/HK2/Spring Boot light) if your tooling needs complex wiring — prefer small DI solutions to keep startup fast.
* Provide pluggable command discovery (service loader pattern) for extensibility.
* Add OpenTelemetry instrumentation and a default OTLP exporter configuration.
* Provide shell completion scripts generation (bash/zsh/powershell) via Picocli.

## 16. References

* Picocli documentation — [https://picocli.info/](https://picocli.info/)
* SLF4J & Logback — [https://www.slf4j.org/](https://www.slf4j.org/) and [https://logback.qos.ch/](https://logback.qos.ch/)
* Resilience4j — [https://resilience4j.readme.io/](https://resilience4j.readme.io/)
* Testcontainers — [https://www.testcontainers.org/](https://www.testcontainers.org/)
* GraalVM native image — [https://www.graalvm.org/reference-manual/native-image/](https://www.graalvm.org/reference-manual/native-image/)
* OWASP recommendations for secure software development

---

> This ARCHITECTURE.md is intentionally opinionated and provides a pragmatic baseline for building production-ready CLI utilities in Java. Adapt policies and tooling choices to your organization's needs while following the core principles: security, observability, maintainability, and predictable lifecycle management.
