# PRODSTARTER.NODE-SERVICE-TYPESCRIPT — ARCHITECTURE

> Production-ready architecture document for the `node-service-typescript` template. This file documents design goals, component responsibilities, configuration, observability, security, packaging, testing, CI/CD, and operational runbook for a hardened Express-based TypeScript service.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout
5. Core components & responsibilities
6. Configuration & environment
7. Logging, metrics & tracing
8. Error handling & HTTP contract
9. Signal handling & graceful shutdown
10. Security considerations
11. Packaging, distribution & containerization
12. Testing strategy
13. CI/CD & release process
14. Operational runbook & troubleshooting
15. Extensibility & best practices
16. References

---

## 1. Purpose & goals

This template is an opinionated, production-first starting point for building HTTP services in Node.js using TypeScript and Express. It aims to provide:

* A maintainable project layout and clear separation between transport, application logic and infrastructure adapters.
* Secure-by-default settings (helmet, rate limiting, gzip/compression, CORS guidance).
* Observability primitives (structured logging, Prometheus metrics, request tracing hooks) that are easy to extend.
* Predictable lifecycle (graceful startup, readiness/liveness probes and controlled shutdown).
* Reproducible build and release patterns suitable for containers and serverless deployments.

Intended users: backend developers, SREs and platform engineers shipping internal or public HTTP services.

## 2. Non-functional requirements

* **Portability:** runs on Node 18+ (LTS recommended) and supports containerized deployments across Linux distributions.
* **Reliability:** deterministic shutdown, health checks, and graceful retryable behavior for transient failures.
* **Security:** sane defaults for HTTP headers, input size limits, rate limiting, and safe secrets handling.
* **Observability:** structured logs, Prometheus metrics, and integration points for tracing (OpenTelemetry).
* **Performance:** lightweight middleware stack and efficient JSON handling for typical REST workloads.

## 3. High-level architecture

```
Clients -> LB / API Gateway -> Express HTTP server (this service)
                             |-- Auth / Rate Limit middleware
                             |-- Handlers / Controllers (api/v1)
                             |-- Services (business logic)
                             |-- Infra Adapters (DB, cache, message bus, external HTTP)
                             |-- Metrics & Tracing (Prometheus / OpenTelemetry)
```

Design principles:

* Keep transport layer (Express handlers) thin. All business logic lives in typed service classes under `services/` or `internal/app`.
* Use dependency injection (manual or light-weight) so infra adapters (DB/Redis/HTTP clients) can be mocked in tests.
* Encapsulate operations with context-aware timeouts and cancellation when applicable.

## 4. Project layout

Suggested, opinionated layout:

```
/src
  /cmd                    # executable entrypoints (start scripts)
  /server                 # express app initialization and server lifecycle
  /api                    # route wiring and controllers
  /services               # business logic, use-case classes
  /infra                  # adapters: db, cache, http clients, queues
  /config                 # typed config loader and schema
  /logging                # logger init and helpers (pino)
  /metrics                # prometheus registrations
  /middleware             # auth, rate limit, validation, error handling
  /types                  # shared TypeScript types and DTOs
/tests                    # unit and integration tests
/package.json
/tsconfig.json
/Dockerfile
/README.md
/ARCHITECTURE.md
/TUTORIAL.md
/TASKS.md
```

Keep `src/` small and avoid putting implementation logic in `cmd` or top-level files. Export `app` for tests and keep `server` responsible only for lifecycle (start/stop).

## 5. Core components & responsibilities

### Entrypoint (`cmd` / `server`)

* Instantiate configuration, logger, metrics and tracing.
* Create Express app and register middleware, routes and health endpoints.
* Start HTTP listener(s) and metrics server (optional) and manage shutdown sequence.

### API / Controllers (`/api`)

* Validate request shape and types, map to service DTOs, call services, and map results to HTTP responses.
* Should return clear status codes and consistent error bodies for consumers.

### Services (`/services`)

* Implement business logic. Keep side-effects (DB, network) behind infra adapters.
* Accept context/timeout parameters to bound long-running operations.

### Infra adapters (`/infra`)

* Encapsulate external integrations (Postgres, Redis, Kafka, external HTTP APIs). Provide retries, timeouts and circuit-breaking where appropriate.
* Expose simple typed methods used by services.

### Middleware (`/middleware`)

* Cross-cutting concerns: request ID, logging enrichment, request validation, rate limiting, CORS, auth.
* Use composable middleware and keep small.

### Observability

* Logging: pino for structured JSON logs. Include service, environment and version fields.
* Metrics: prom-client exported on `/metrics` (or separate port) with request counters and latency histograms.
* Tracing: provide an initialization hook for OpenTelemetry SDK to attach exporters (OTLP).

## 6. Configuration & environment

Configuration precedence and approach:

1. Environment variables (12-factor approach) — preferred for secrets and runtime overrides.
2. Config file loaded in development via `.env` or a config file path (for local testing only).
3. Defaults encoded in code.

Guidelines:

* Use a central typed config module (e.g., `env-schema`, `zod` validations, or `joi`) to validate and coerce env vars on startup.
* Avoid loading secrets from files checked into VCS. Use orchestration-level secret injection (Kubernetes Secrets, Vault, cloud KMS).
* Expose important runtime flags: `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`, `ENABLE_METRICS`, `METRICS_PORT`, `RATE_LIMIT_*`, `SHUTDOWN_TIMEOUT_MS`.

## 7. Logging, metrics & tracing

### Logging (Pino)

* Structured JSON logs to stdout for ingestion by log collectors (Loki, ELK, Datadog).
* Include consistent fields: `service`, `env`, `version`, `trace_id`, `request_id`.
* Configure log level via env (`LOG_LEVEL`) and support pretty-print in local development only.

### Metrics (Prometheus)

* Register default process and HTTP metrics. Expose the following app-level metrics:

  * `http_requests_total{method,route,status}` (counter)
  * `http_request_duration_seconds{method,route,status}` (histogram)
  * `service_errors_total` (counter)
* Serve metrics on a separate port where possible to minimize risk of public exposure.

### Tracing (OpenTelemetry)

* Provide an optional bootstrap to enable OTLP exporter and automatic instrumentation. Keep disabled by default.
* Ensure trace context (W3C `traceparent`) is propagated through outbound HTTP calls and logs.

## 8. Error handling & HTTP contract

* Use a consistent error shape for machine clients and human consumers. Example:

```json
{ "error": { "code": "invalid_input", "message": "username is required", "details": { ... } } }
```

* Map errors to HTTP codes: validation → 400, unauthorized → 401, forbidden → 403, not found → 404, conflict → 409, transient → 503, unexpected → 500.
* Implement centralized error middleware that logs internal details at `error` level while returning sanitized messages to the caller.
* Support `Accept: application/json` and return JSON error responses consistently.

## 9. Signal handling & graceful shutdown

* Listen for `SIGINT` and `SIGTERM` and start an ordered shutdown sequence:

  1. Mark readiness as `false` so load balancers stop routing new traffic.
  2. Stop accepting new connections (`server.close()`), and wait for in-flight requests with a configurable timeout.
  3. Close infra adapters (DB, queues) and flush traces/metrics.
  4. Exit with appropriate exit code.

* Configure a `SHUTDOWN_TIMEOUT_MS` and force-exit after timeout while emitting diagnostic logs.

## 10. Security considerations

* **Transport:** terminate TLS at the edge (ingress, ALB) where possible. If service exposes TLS directly, manage certs via secrets and support rotation.
* **Input validation:** limit request body sizes (e.g. 1MB) and validate all input via schema validators.
* **Rate limiting:** apply a global or per-route rate limiter to protect downstream systems.
* **Auth & authorization:** prefer external gateway for authentication; if implemented inside service, validate tokens and scopes and fail fast.
* **Secrets:** use vault or cloud secret managers; avoid printing secrets in logs.
* **Dependencies:** run `npm audit` or automated SCA in CI. Pin critical libs and update regularly.

## 11. Packaging, distribution & containerization

### Packaging

* Produce a reproducible Docker image and optionally a tarball with node runtime and compiled JS (or bundle via esbuild/webpack).
* Ensure `NODE_ENV=production` and run `npm ci --only=production` for production images.

### Docker

* Use multi-stage Dockerfile: build stage (install dev dependencies, TypeScript compile / transpile) → runtime stage (minimal Node base image or distroless).
* Run container as non-root user and drop unnecessary capabilities. Limit writable filesystem areas.
* Produce SBOM and scan image with Trivy in CI.

## 12. Testing strategy

* **Unit tests:** fast tests for services and utilities (Jest or Vitest). Mock infra adapters.
* **Integration tests:** run against real infra in ephemeral environment (Docker Compose, Testcontainers, or ephemeral cloud resources). Use a separate CI job or test stage.
* **Contract tests:** when multiple teams consume API, add consumer contracts (Pact or similar).
* **E2E / smoke:** run packaged artifact/container and assert health endpoints, key flows and metrics.
* **Static checks:** ESLint (with TypeScript rules), Prettier, and type checks (`tsc --noEmit`) in CI.

## 13. CI/CD & release process

Suggested pipeline:

1. **PR checks:** lint, type-check, unit tests and vulnerability scan.
2. **Build:** compile TypeScript and bundle (if using bundler). Run integration tests in merge pipeline.
3. **Package:** build Docker image, generate SBOM and run Trivy.
4. **Release:** tag semantic version, publish image to registry, attach checksums and release notes.

Quality gates: fail on lint/type errors, failing tests, or high-severity vulnerabilities.

## 14. Operational runbook & troubleshooting

**Startup checks**

* Verify service starts and health endpoints return expected values.
* Ensure readiness checks validate connectivity to critical dependencies (DB, cache).

**Common incident steps**

1. Check logs (correlate by `request_id` or `trace_id`).
2. Query metrics for spikes in error rates or latency.
3. If crashes occur, collect heap/profile if possible and reproduce locally with same inputs.
4. For dependency failures, check credential rotation and network/DNS issues.

**Post-incident**

* Capture timeline, root cause, remediation and add tests to prevent recurrence.

## 15. Extensibility & best practices

* Use small composable modules and avoid monolithic files. Prefer single-responsibility functions and classes.
* Keep request handlers thin and use `async/await` with proper error propagation.
* Provide feature toggles/flags if you need gradual rollouts.
* Consider compiling to a single bundle with esbuild for faster cold-starts in serverless environments.

## 16. References

* Express documentation and middleware ecosystem
* Pino logger and pino-http for structured logging
* prom-client for Prometheus metrics in Node.js
* OpenTelemetry Node.js SDK for tracing
* Twelve-Factor App methodology for config and processes

---

This ARCHITECTURE.md is intentionally opinionated to provide a secure, observable and maintainable baseline for production-grade Node.js + TypeScript HTTP services. Adapt the recommendations to your organizational policies and operational constraints.
