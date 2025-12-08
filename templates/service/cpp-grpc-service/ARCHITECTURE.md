# PRODSTARTER.CPP.GRPC.SERVICE — ARCHITECTURE

> Production-ready architecture document for the `cpp-grpc-service` template. This document describes design decisions, component responsibilities, configuration, observability, security, packaging, testing and operational guidance for a hardened C++ gRPC microservice scaffold.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout
5. Core components & responsibilities
6. Configuration & environment
7. Logging, metrics & tracing
8. Security (TLS, secrets, hardening)
9. Error handling & exit codes
10. Signal handling & graceful shutdown
11. Build systems & reproducible builds
12. Testing strategy
13. Packaging, distribution & containerization
14. CI/CD & quality gates
15. Operational runbook
16. Extending the template
17. References

---

## 1. Purpose & goals

The `cpp-grpc-service` template is an opinionated, production-ready scaffold for building gRPC-based services in C++. It focuses on:

* Robust lifecycle management (graceful shutdown, health transitions).
* Safe and observable defaults (structured logs, health checks, optional metrics/tracing).
* Portable and reproducible builds across Linux distributions and container images.
* Minimal dependencies and clear extension points for business logic and infra adapters.

This template is suitable for low-latency RPC services, background workers exposing RPC endpoints, and thin adapters in polyglot systems.

## 2. Non-functional requirements

* **Portability:** build on major Linux distributions; optional macOS support for local dev.
* **Reliability:** deterministic shutdown and health state transitions; clear exit codes.
* **Security:** secure-by-default TLS, least privilege file permissions and secret handling.
* **Observability:** structured logs, health endpoints, Prometheus metrics (optional), and support for tracing via SDKs or sidecar collectors.
* **Performance:** low-latency RPC handling, tunable worker threads and completion queues.

## 3. High-level architecture

```
                 +----------------+
                 |  Clients/API   |
                 +-------+--------+
                         |
                    gRPC (TLS)
                         |
                 +-------v--------+
                 |  cpp-grpc-svc   |  <- main binary (server)
                 |  - gRPC server  |
                 |  - Health / Ref |
                 |  - Prometheus   |
                 +---+---+---+-----+
                     |   |   |
       +-------------+   |   +-------------+
       |                 |                 |
  Infra Adapters   Background Workers  Outbound Clients
 (DB, Cache, MQ)      (consumers)       (HTTP, DB drivers)
```

Key runtime responsibilities:

* Accept RPCs, authenticate/authorize as required, perform business logic and reply.
* Keep health status accurate: `SERVING` when ready; `NOT_SERVING` during shutdown.
* Export metrics and logs for observability.

## 4. Project layout

Opinionated, scalable layout:

```
proto/                           # .proto definitions and options
src/
  main.cpp                       # bootstrap + server lifecycle
  service/                       # generated + handwritten service impls
  infra/                          # DB, cache, HTTP adapters
  config/                         # config parsing and typed structs
  metrics/                        # prometheus metrics registration
  logging/                        # spdlog wrappers/enrichers
  util/                           # helpers (file, tls loader)
include/                          # public headers for the service
tests/
  unit/                           # unit tests (gtest)
  integration/                    # integration tests (docker/testcontainers)
CMakeLists.txt or Bazel BUILD      # build orchestration
Dockerfile                         # multi-stage container build
README.md, ARCHITECTURE.md, TASKS.md, TUTORIAL.md
```

Guidelines:

* Keep generated protobuf artifacts in `proto/gen/` (or under `build/`) — don't check generated code into VCS unless necessary.
* Put runtime config examples under `configs/` (dev/prod).

## 5. Core components & responsibilities

### main.cpp (server bootstrap)

* Parse CLI flags and environment, set up logging and metrics, load TLS credentials, register services, and start gRPC server.
* Install signal handlers and orchestrate graceful shutdown.

### Service implementations (`service/`)

* Implement generated gRPC service interfaces. Keep methods focused and delegate to `infra/` adapters.
* Validate inputs and return proper gRPC status codes.

### Infra adapters (`infra/`)

* Provide typed clients for external systems (DB, caches, message queues). Apply retry/backoff and timeouts.
* Keep adapters small and unit-testable; inject through constructor.

### Health & reflection

* Use gRPC health check service to report liveness/readiness. Enable reflection optionally for debug with `grpc_cli`.

### Metrics (`metrics/`)

* Optional Prometheus exposition via `prometheus-cpp` or an exporter sidecar. Register counters and histograms for RPC counts and latencies.

### Logging (`logging/`)

* Use `spdlog` for structured, leveled logging. Add enrichers for `application`, `version`, and `environment`.

## 6. Configuration & environment

Configuration sources and precedence (highest → lowest):

1. CLI flags (e.g., `--bind`, `--tls`, `--config`)
2. Environment variables (e.g., `PROD_`, `APP_`) — follow `UPPER_SNAKE` convention
3. Config file (YAML/JSON/TOML) provided via `--config`
4. Built-in defaults

Recommendations:

* Use a small typed `ServerConfig` struct and validate on startup.
* Do not store secrets in plain text in config files in VCS. Use mounted secrets or secret stores (Vault, cloud KMS).
* Document required environment variables in `README.md` and `configs/`.

## 7. Logging, metrics & tracing

### Logging

* Use `spdlog` with colored console sink for dev and JSON sink for production. Example fields: `timestamp`, `level`, `service`, `version`, `trace_id`, `span_id`.
* Provide `--verbose` to raise log level to DEBUG for troubleshooting.

### Metrics

* If `prometheus-cpp` is enabled, expose `/metrics` on a separate HTTP port (e.g., 9090) or use a sidecar pattern.
* Register metrics: RPC request counter (`rpc_requests_total`), request duration histogram (`rpc_duration_seconds`), error counter (`rpc_errors_total`), queue length, and background job metrics.

### Tracing

* Provide hooks to integrate OpenTelemetry SDK (OTLP exporter). Prefer sidecar collector or OTLP endpoint for production.
* Propagate trace context from inbound gRPC to outbound requests.

## 8. Security (TLS, secrets, hardening)

### TLS

* Enable TLS by default in production. Load certificate and key files from paths provided by environment or config.
* Prefer server-only TLS (mutual TLS optional) depending on your threat model.

### Secrets

* Use secret stores (Vault, cloud provider KMS) in production. For containers, mount secrets as files with restrictive permissions.
* Avoid logging secrets. Use structured logging with scrubbers for sensitive fields.

### Hardening

* Run as a non-root user in containers. Set secure file permissions (600) for private keys.
* Enable ASLR and stack protections where possible. Use hardened base images.
* Scan dependencies and binary images for vulnerabilities (govulncheck equivalent for C++ libs, Trivy for images).

## 9. Error handling & exit codes

Adopt a small set of process exit codes and map gRPC status codes to application-level statuses when needed.

Recommended exit codes:

* `0` — Success
* `1` — Generic failure
* `2` — Configuration error (invalid flags or missing files)
* `3` — Startup failure (unable to bind port, TLS load errors)
* `130` — Interrupted (SIGINT/SIGTERM)

Within gRPC handlers:

* Return appropriate `grpc::Status` (e.g., `Status::INVALID_ARGUMENT`, `Status::NOT_FOUND`, `Status::UNAVAILABLE`) and include machine-friendly error details when useful.

## 10. Signal handling & graceful shutdown

* Install handlers for `SIGINT` and `SIGTERM` that set an atomic shutdown flag.
* On shutdown: set health to `NOT_SERVING`, call `server->Shutdown()` to stop accepting new RPCs, wait for in-flight RPCs to finish (with a configurable timeout), stop background workers, then `server->Wait()` and finalize metrics/logging.
* Configure a `ShutdownTimeout` (e.g., 30s) to bound shutdown time; if exceeded, force exit and log stack traces.

## 11. Build systems & reproducible builds

Supported build systems:

* **CMake** (recommended) with `vcpkg` or `conan` to manage dependencies. Provide a `CMakePresets.json` and pinned toolchain for CI.
* **Bazel** for monorepos or strict hermetic builds.

Reproducibility:

* Pin dependency versions in `vcpkg.json` or `conanfile.txt`.
* Use deterministic build flags: `-fno-ident`, `-fdebug-prefix-map`/`-Xlinker --build-id=none` to minimize build differences.
* Record `git commit`, `build time` and `toolchain versions` into `--ldflags` or a manifest file embedded in the binary.

## 12. Testing strategy

### Unit tests

* Use GoogleTest (gtest) for unit tests. Mock network/DB via fakes or interfaces.
* Structure tests to be hermetic and fast.

### Integration tests

* Use Docker Compose or testcontainers-like approach to spin up dependencies (DB, Kafka) in CI.
* Run integration tests in an isolated stage in CI.

### System / E2E tests

* Deploy the service into a disposable environment (k8s namespace or ephemeral VM) and run end-to-end tests validating RPC behavior, health probes, and metrics.

### Fuzzing & sanitizers (optional)

* Use AddressSanitizer/UndefinedBehaviorSanitizer in CI for critical builds to catch memory/UB issues.
* Add libFuzzer-based tests for parsing logic if applicable.

## 13. Packaging, distribution & containerization

### Binaries

* Produce statically linked binaries where feasible or minimal dynamic dependencies; prefer musl-based builds for small size.
* Create release artifacts that include checksums and signatures.

### Docker

* Provide a multi-stage `Dockerfile` using a builder (with toolchain) and a minimal runtime image (distroless or alpine). Example pattern:

  1. Build stage: compile with CMake and install into `/app`.
  2. Runtime stage: copy the binary and set a non-root user.

Security: run container as non-root and limit capabilities.

## 14. CI/CD & quality gates

Suggested pipeline stages (GitHub Actions/GitLab/Jenkins):

1. **Static checks**: clang-tidy, clang-format, include-what-you-use, dependency scanning.
2. **Unit tests**: run with sanitizers where possible.
3. **Build**: compile release artifacts for target platforms (linux/amd64, linux/arm64).
4. **Integration**: bring up dependency containers and run integration tests.
5. **Packaging**: produce tarballs, checksums and Docker images.
6. **Security scanning**: Trivy for images, SCA for deps.
7. **Release**: sign artifacts and publish to GitHub Releases / artifact registry.

Pin compilers and toolchains in CI worker images; cache dependency downloads for speed.

## 15. Operational runbook

**Startup checks**

* Verify service starts and binds to configured port.
* Confirm health probe returns `200` and metrics endpoint is available (if enabled).

**Common incident steps**

1. Collect logs (stdout/stderr), metrics, and the binary version (`--version` output).
2. Check health endpoints and recent errors in logs.
3. If RPCs are failing with `UNAVAILABLE`, check downstream infra (DB, upstream services).
4. For memory corruption or crashes, enable core dumps (securely) and gather backtrace using `gdb`.
5. Rollback to a previous artifact if necessary and redeploy.

**Post-incident**

* Record timeline, root cause, and remediation. Add tests to prevent regression.

## 16. Extending the template

* Add OpenTelemetry native instrumentation and automatic context propagation.
* Provide an operator Helm chart for k8s deployments with probes, resource limits and RBAC.
* Implement mTLS and authorization integration (JWT/OAuth introspection) as pluggable modules.
* Add a small admin HTTP endpoint (protected) to expose runtime diagnostics (pprof-like) behind auth.

## 17. References

* gRPC C++ docs — [https://grpc.io/docs/languages/cpp/](https://grpc.io/docs/languages/cpp/)
* Protobuf — [https://developers.google.com/protocol-buffers](https://developers.google.com/protocol-buffers)
* spdlog — [https://github.com/gabime/spdlog](https://github.com/gabime/spdlog)
* prometheus-cpp — [https://github.com/jupp0r/prometheus-cpp](https://github.com/jupp0r/prometheus-cpp)
* vcpkg — [https://github.com/microsoft/vcpkg](https://github.com/microsoft/vcpkg)
* Conan — [https://conan.io/](https://conan.io/)
* Bazel — [https://bazel.build/](https://bazel.build/)

---

This `ARCHITECTURE.md` is opinionated and intended to provide a hardened, maintainable starting point for production-grade C++ gRPC services. Adapt policies and implementation choices to your operational constraints and organizational requirements.
