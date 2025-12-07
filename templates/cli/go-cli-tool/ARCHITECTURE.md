# PRODSTARTER.CLI.GO — ARCHITECTURE

> Production-ready architecture document for the `go-cli-tool` template. This file describes design principles, component responsibilities, configuration, packaging, observability, security, testing, CI/CD, and an operational runbook for a hardened CLI written in Go.

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

This template provides an opinionated, production-ready starting point for building command-line tools in Go. It focuses on:

* Portability and small dependency surface
* Predictable configuration and secure defaults
* Observability (structured logs, metrics, health probes)
* Reliable lifecycle (graceful shutdown, cancellable operations)
* Testability and reproducible builds

The template is suitable for short-lived command invocations (scripts, automation) and long-running worker modes (queue consumers, schedulers) with the same codebase.

## 2. Non-functional requirements

* **Portability:** build with `go` toolchain; support Linux, macOS, Windows where practical.
* **Reliability:** deterministic exit codes, graceful shutdown, retries for transient failures.
* **Performance:** efficient streaming I/O and low memory use.
* **Security:** safe defaults, avoid shell injection, and limit privileges.
* **Observability:** structured logs, Prometheus metrics, and health endpoints for worker mode.

## 3. High-level architecture

```
User/Scripts -> CLI (cobra) -> Application services -> Infra adapters
                                     |                     |
                                     +--> Metrics/Logging   +--> External systems (HTTP, DB, queues)
```

Key design principles:

* Keep the command handlers thin and delegate to services for business logic.
* Isolate platform-specific code behind adapters to improve testability.
* Use context.Context for cancellation and timeouts across APIs.

## 4. Project layout

Opinionated layout to scale well from small tools to medium-sized utilities:

```
cmd/tool/main.go          # CLI entrypoint (cobra wiring)
internal/
  ├── app/                # application layer (services, use-cases)
  ├── infra/              # infrastructure adapters (http, db, queue)
  ├── config/             # config parsing & typed config structs
  ├── logging/            # zap setup and enrichers
  └── metrics/            # prometheus metrics registration
pkg/                      # optional reusable libraries
configs/                  # example configs for envs
test/                     # integration and fixture helpers
build/                    # build scripts and helper tooling
Dockerfile
Makefile
go.mod
go.sum
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Notes:

* `internal/` prevents accidental external imports.
* Keep main.go minimal: bootstrap config, logger, metrics, and cobra commands.

## 5. Core components & responsibilities

### CLI (cmd/tool)

* Wire cobra commands and flags, register persistent flags (config path, env, verbosity).
* Call into application services; return clear exit codes.

### Configuration (internal/config)

* Use Viper to load config from file and environment and provide typed structs.
* Validate config on startup and fail fast with helpful messages.

### Application layer (internal/app)

* Implement domain logic, orchestrating infra adapters.
* Keep functions pure where possible and side-effects isolated for testing.

### Infrastructure (internal/infra)

* HTTP clients, database adapters, queue consumers/producers, file IO.
* Wrap external calls with retry/backoff policies (context aware).

### Logging & metrics

* Centralized zap logger bootstrap with env-aware presets (dev vs prod).
* Prometheus metrics registration and optional metrics server.

### Health & readiness

* Provide liveness and readiness endpoints when running a metrics/health server.

## 6. Configuration & environment

Configuration precedence (highest → lowest):

1. CLI flags
2. Config file (YAML/TOML/JSON) passed via `--config`
3. Environment variables (prefix `TOOL_` or `APP_`)
4. Built-in defaults

Guidelines:

* Keep secrets out of config files in VCS; prefer environment or secret stores.
* Provide `configs/*.yaml` examples for development and production.
* Validate required fields at startup and show actionable errors.

## 7. Logging, metrics & tracing

### Logging

* Use `go.uber.org/zap` for structured, low-overhead logging.
* Development: console-friendly logs. Production: JSON logs to stdout.
* Include fields: `application`, `environment`, `version`, and `trace_id` when present.

### Metrics

* Use Prometheus client library to register metrics: counters, histograms, gauges.
* Provide a `serve-metrics` command that starts an HTTP server exposing `/metrics`, `/ready`, `/live`.
* For short-lived commands, optionally emit simple counters or export metrics to a pushgateway.

### Tracing

* Provide integration points for OpenTelemetry (OTLP) for distributed tracing.
* Propagate context across HTTP and messaging calls.

## 8. Error handling & exit codes

Return stable exit codes and avoid leaking internal errors to users:

* `0` Success
* `1` Generic error
* `2` Invalid arguments / usage error
* `3` Configuration error
* `4` Runtime failure (external dependency failure)
* `130` Interrupted (signal)

Log full errors at server-side (with stack or context) but present concise messages to users or machine-readable JSON in `--json` mode.

## 9. Signal handling & graceful shutdown

* Use `os/signal` to trap `SIGINT` and `SIGTERM` and cancel root context.
* Ensure long-running tasks periodically check `context.Context` and return quickly on cancellation.
* For the metrics/HTTP server use `Server.Shutdown(ctx)` with a short timeout (e.g., 5s) to drain connections.

## 10. Security considerations

* **Avoid shell execution**: do not use `exec.Command` with untrusted string concatenation; pass arguments as slices.
* **File handling**: validate paths and avoid following untrusted symlinks for sensitive operations.
* **Secrets**: avoid storing secrets in repo; document using environment variables or secret stores.
* **Dependencies**: pin module versions and run `govulncheck`/SCA in CI.
* **Network**: use TLS for outgoing HTTP calls and validate certificates by default.

## 11. Packaging, distribution & release strategy

### Build artifacts

* Use `go build` to produce static/dynamic binaries. For reproducibility, record `go` version and use `-trimpath` and `-ldflags "-s -w -X main.version=..."`.
* For Linux containers, build static binaries (CGO disabled) or use minimal distroless images.

### Release bundles

* Produce tarballs per platform: `tool-<version>-<os>-<arch>.tar.gz` including LICENSE, USAGE, and checksums.
* Optionally publish releases to GitHub Releases with signed checksums.

### Container images

* Provide a multi-stage Dockerfile to build and package the binary into a minimal runtime image (scratch or distroless).

## 12. Testing strategy

### Unit tests

* Keep business logic testable without heavy dependencies.
* Mock adapters using interfaces.

### Integration tests

* Use ephemeral services or testcontainers equivalents where possible; use temporary directories.

### End-to-end tests

* Smoke tests: build artifact, run commands in a disposable environment, assert exit codes and outputs.

### Static analysis & vetting

* Run `go vet`, `gofmt -s`, `golangci-lint` or `staticcheck` in CI.
* Run `govulncheck` regularly for vulnerabilities.

## 13. CI/CD & quality gates

Recommended pipeline (GitHub Actions or other CI):

1. **Lint & format** — `gofmt` check, `golangci-lint`.
2. **Unit tests** — `go test ./...` with coverage.
3. **Build** — `go build` for target OS/arch matrix.
4. **Sanity & smoke** — run the built binary in an ephemeral environment.
5. **Security** — run `govulncheck` and dependency scanning.
6. **Publish** — create artifacts, sign checksums, and upload to GitHub Releases or registry.

Pin Go version with `go.mod` and optionally `go.work` for multi-module workspaces.

## 14. Operational runbook & troubleshooting

Before deployment:

* Ensure config and secrets are provisioned for production.
* Validate metrics and logging ingestion.
* Have an automated smoke test that runs after deployment.

Troubleshooting steps:

1. Re-run command with `--verbose` and `--dry-run` to reproduce.
2. Check logs for correlation IDs and trace info.
3. If crash occurs, collect core dump and run `gdb` or inspect stack traces.
4. Validate network connectivity and TLS certificates for failing outbound calls.

## 15. Extending the template

* Add OpenTelemetry initialization and example exporters (OTLP/Jaeger).
* Add a plugin system (Go plugins or external process hooks) for extensibility.
* Provide installers or package recipes (Homebrew, apt, rpm).
* Add optional configuration backends (Consul, Vault) and secret rotation helpers.

## 16. References

* Cobra documentation — [https://github.com/spf13/cobra](https://github.com/spf13/cobra)
* Viper docs — [https://github.com/spf13/viper](https://github.com/spf13/viper)
* Zap logging — [https://github.com/uber-go/zap](https://github.com/uber-go/zap)
* Prometheus client_golang — [https://github.com/prometheus/client_golang](https://github.com/prometheus/client_golang)
* Go project layout guidance — [https://github.com/golang-standards/project-layout](https://github.com/golang-standards/project-layout)
* Go tooling: `gofmt`, `go vet`, `golangci-lint`, `govulncheck`

---

> This ARCHITECTURE.md is intentionally opinionated to provide a secure, observable, and maintainable baseline for Go CLI tools. Adapt it to your organization’s constraints while preserving the core principles: clarity, safety, observability, and testability.
