# PRODSTARTER.GO-CHI-REST — ARCHITECTURE

> Production-ready architecture document for the `go-chi-rest` template. This document describes design goals, architecture, configuration, observability, security, packaging, testing, CI/CD, and operational guidance to ship a hardened HTTP REST service using Go + chi.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout
5. Core components and responsibilities
6. Configuration & environment
7. Logging, metrics and tracing
8. Error handling, validation & API contracts
9. Signal handling & graceful shutdown
10. Security considerations
11. Packaging, distribution & containerization
12. Testing strategy
13. CI/CD & quality gates
14. Operational runbook & run-time checks
15. Extending the template
16. References

---

## 1. Purpose & goals

This template is an opinionated, production-first starting point for building HTTP REST services in Go using the `chi` router. It focuses on:

* Small, well-structured codebase you can evolve safely.
* Strong observability (structured logs, metrics, traces).
* Predictable lifecycle (graceful shutdown, health/readiness probes).
* Secure defaults and guidance to integrate secrets safely.
* Reproducible builds and CI-ready workflows.

Target workloads include internal microservices, public REST APIs, and admin/control plane services.

## 2. Non-functional requirements

* **Portability:** build with the Go toolchain, cross-compile for linux/amd64 and linux/arm64.
* **Reliability:** deterministic exit codes, graceful shutdown, health checks.
* **Performance:** low-latency request handling and efficient resource usage.
* **Security:** safe defaults (no secrets in VCS), TLS by default at the edge, input validation.
* **Observability:** structured logs, Prometheus metrics, OpenTelemetry traces.

## 3. High-level architecture

```
Clients (HTTP/REST)
   |
   v
Load Balancer / API Gateway (TLS, auth)
   |
   v
go-chi-rest service
  ├─ HTTP layer (chi + middleware)
  ├─ Handlers -> Application services
  ├─ Services -> Repositories / Adapters (DB, Cache, Queue)
  ├─ Observability (logs, metrics, traces)
  └─ Health / readiness probes
```

Design principles:

* Keep HTTP handlers thin: translate HTTP requests → DTOs → call application services → map result to HTTP responses.
* Use interfaces for adapters to allow deterministic unit testing with mocks.
* Use `context.Context` for request cancellation, timeouts and trace propagation.

## 4. Project layout

Opinionated layout that scales from small services to medium-size systems:

```
cmd/server/main.go          # bootstrap: config, logger, router, server
internal/
  ├─ api/                   # http handlers and request/response DTOs
  ├─ app/                   # application services / use-cases
  ├─ infra/                 # DB, cache, queue, external clients
  ├─ config/                # typed config and loader
  ├─ logging/               # zap setup and helpers
  ├─ metrics/               # prometheus metrics registration
  └─ tracing/               # opentelemetry setup
pkg/                        # reusable helpers (optional)
configs/                    # example YAML/TOML configs
deploy/                     # k8s manifests / helm charts (optional)
build/                      # build scripts, Dockerfiles
test/                       # integration and e2e helpers
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
Makefile
go.mod
```

Notes:

* `internal/` prevents external consumers from importing internals.
* `api/` holds only transport concerns — no business logic.

## 5. Core components and responsibilities

### cmd/server

* Wire up configuration, logging, tracing, metrics and the HTTP router.
* Minimal logic: start servers, handle graceful shutdown, record build metadata.

### api (HTTP handlers)

* Parse and validate HTTP requests, bind URL/path/query/body parameters to DTOs.
* Convert service errors into proper HTTP status codes and machine-readable error responses.

### app (services)

* Business logic and orchestration. Use small, well-named interfaces to allow mocking.

### infra (adapters)

* Database (SQL or NoSQL), cache (Redis), message brokers, external HTTP clients.
* Provide retries with exponential backoff, timeouts, and circuit breakers where appropriate.

### config

* Typed config structs, validation, and documentation for required env vars.

### logging/metrics/tracing

* Centralized initialization and helpers to enrich logs/metrics with `service`, `env`, `version`, and `trace_id`.

## 6. Configuration & environment

Precedence (highest → lowest):

1. Command-line flags
2. Environment variables (uppercase, `APP_` prefix recommended)
3. Config file (YAML/TOML/JSON)
4. Hard-coded defaults in code

Guidelines:

* Keep secrets out of config files in version control. Use environment injection or secret stores (Vault, cloud KMS).
* Provide `configs/development.yaml` and `configs/production.yaml` examples.
* Validate required fields on startup and fail fast with clear error messages.

Example config keys:

```yaml
bind_addr: ":8080"
read_timeout: "5s"
write_timeout: "10s"
idle_timeout: "120s"
shutdown_timeout: "15s"
database:
  dsn: "postgres://user:pass@db:5432/app?sslmode=disable"
metrics:
  enabled: true
  listen: ":9090"
log:
  level: "info"
  json: true
```

## 7. Logging, metrics and tracing

### Logging

* Use `go.uber.org/zap` structured logger.
* Production: JSON-formatted logs to stdout. Development: console-friendly output.
* Include fields: `service`, `environment`, `version`, `trace_id`, `span_id`.
* Avoid logging sensitive fields (redact or omit).

### Metrics

* Use Prometheus client library (`promhttp`) to expose metrics.
* Register application metrics: counters for requests, histograms for latency, gauges for in-flight requests.
* Expose `/metrics`, `/healthz`, `/readyz` on a separate port or the same server behind a path.

### Tracing

* Integrate OpenTelemetry (OTLP exporter) as an optional hook; make it configurable.
* Propagate context and tracing headers across outgoing HTTP and RPC calls.
* Sample spans at appropriate granularity; instrument database calls and external requests.

## 8. Error handling, validation & API contracts

* Use strong request validation (e.g., `go-playground/validator`) and return structured error responses:

```json
{ "error": { "code": "invalid_request", "message": "username is required", "fields": ["username"] } }
```

* Map application errors to HTTP codes consistently: validation → 400, auth → 401/403, not found → 404, conflict → 409, transient failures → 503.
* Provide `X-Request-Id` and `traceparent`/`tracestate` propagation for correlation.

## 9. Signal handling & graceful shutdown

* Use `os.Signal` with `SIGINT`/`SIGTERM` to trigger shutdown.
* On shutdown: mark readiness as false, stop accepting new requests, wait for in-flight requests to complete (configurable timeout), close infra adapters and flush telemetry.
* Use context cancellation and per-request timeouts to bound request work.

Example shutdown sequence:

1. Receive signal → set `ready=false` / respond 503 on readiness probe.
2. Stop HTTP server (call `Shutdown(ctx)` with timeout).
3. Close DB/queue connections and background workers.
4. Flush logs and metrics exporters, then exit with proper exit code.

## 10. Security considerations

* **Transport security:** terminate TLS at an edge proxy when possible. If service exposes TLS directly, configure certs via secret mounts and auto-reload when rotated.
* **Authentication & Authorization:** prefer centralized API Gateway or mTLS; for in-service auth, validate tokens strictly (JWT, introspection).
* **Input validation & sanitization:** validate and limit payload sizes, use safe DB drivers and prepared statements to prevent SQL injection.
* **Secrets:** never commit secrets. Use secret stores or environment variables injected by orchestration.
* **Least privilege:** run processes as non-root; in containers use non-root user and drop capabilities.
* **Dependency security:** use `govulncheck` and pin module versions; run SCA in CI.

## 11. Packaging, distribution & containerization

### Binaries

* Build with `go build` using `-trimpath` and `-ldflags "-s -w -X main.version=..."` to embed metadata.
* Cross-compile for `linux/amd64` and `linux/arm64` in CI.

### Container images

* Use multi-stage Dockerfile: builder image (golang) → minimal runtime (scratch or distroless).
* Example flags: `CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "-s -w -X main.version=${VERSION}" -o /app/server ./cmd/server`.
* Scan images (Trivy) and produce SBOM (Syft) as part of CI.

## 12. Testing strategy

* **Unit tests:** keep business logic pure and mock adapters. Use `httptest` for handler tests.
* **Integration tests:** run against ephemeral infra (Docker Compose or testcontainers) for DB/redis/queue validation.
* **Contract tests:** if multiple teams consume API, maintain consumer-driven contract tests (PACT).
* **End-to-end tests:** run smoke tests with the packaged binary or container image to validate endpoints and probes.
* **Static checks:** `gofmt`, `go vet`, `staticcheck`, `golangci-lint` in CI.

## 13. CI/CD & quality gates

Suggested pipeline (GitHub Actions / GitLab):

1. **Format & Lint** — `gofmt`, `golangci-lint`.
2. **Unit tests** — `go test ./...` with coverage.
3. **Build** — cross-compile artifacts for target platforms.
4. **Integration** — run integration tests (optional on PRs, required on merge).
5. **Image build & scan** — build image, run Trivy, generate SBOM.
6. **Release** — create GitHub Release, upload artifacts and checksums.

Quality gates: fail if linter/formatting fails, critical vulnerabilities found, or tests regress.

## 14. Operational runbook & run-time checks

**Startup checks:**

* Confirm binary starts and binds to configured address.
* Readiness probe returns `200` only after DB and critical deps are available.
* Metrics endpoint is scrapeable.

**Common incident playbook:**

1. Check logs for correlation id and trace ids.
2. Check health endpoints and metrics for error spikes.
3. If memory or CPU high, collect pstack/pprof and analyze.
4. If service not binding, check port/conflicts and permission.
5. For crashes, inspect core dumps and reproduce with sanitizer build.

**Runbook actions:** include commands to fetch logs, query metrics, and run smoke tests against local/production endpoints.

## 15. Extending the template

* Add OpenTelemetry auto-instrumentation and an OTLP exporter configuration.
* Add middleware for authentication, rate limiting (token-bucket), and request throttling.
* Provide generated client SDKs (OpenAPI generator) and API documentation (Swagger / OpenAPI v3).
* Provide Helm chart and k8s manifests with configurable probes and resource requests.

## 16. References

* chi router — [https://github.com/go-chi/chi](https://github.com/go-chi/chi)
* Zap logging — [https://github.com/uber-go/zap](https://github.com/uber-go/zap)
* Viper (config) — [https://github.com/spf13/viper](https://github.com/spf13/viper)
* Prometheus client_golang — [https://github.com/prometheus/client_golang](https://github.com/prometheus/client_golang)
* OpenTelemetry Go — [https://opentelemetry.io/docs/instrumentation/go/](https://opentelemetry.io/docs/instrumentation/go/)
* Go project layout guidance — [https://github.com/golang-standards/project-layout](https://github.com/golang-standards/project-layout)

---

This `ARCHITECTURE.md` is intentionally opinionated to provide clarity and a secure, observable baseline for REST services built with Go + chi. Adopt the parts that fit your operational constraints and keep the core principles: simplicity, safety, observability, and testability.
