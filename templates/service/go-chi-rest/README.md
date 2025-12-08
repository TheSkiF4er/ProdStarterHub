# ProdStarter — Go chi REST Service

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Production-ready Go REST service template built with `chi`, `zap`, `viper` and `prometheus`. Opinionated defaults for configuration, logging, metrics, graceful shutdown, testing and reproducible builds.

---

## Contents

* Quickstart
* Highlights & features
* Project layout
* Prerequisites
* Build & run
* Configuration & precedence
* Endpoints & examples
* Logging, metrics & health
* Testing & quality gates
* Packaging & Docker
* CI/CD recommendations
* Contributing
* License

---

## Quickstart

```bash
# copy template into your workspace
cp -R ProdStarterHub/templates/service/go-chi-rest ~/projects/my-service
cd ~/projects/my-service

# initialize module and tidy deps
go mod init github.com/yourorg/my-service
go mod tidy

# build
go build -trimpath -ldflags "-s -w -X main.version=0.1.0" -o bin/my-service ./cmd/server

# run (dev)
./bin/my-service --config configs/development.yaml

# health
curl http://localhost:8080/healthz
curl http://localhost:8080/readyz

# metrics
curl http://localhost:9090/metrics
```

---

## Highlights & features

* `chi` router with middleware scaffolding (request ID, real IP, recoverer).
* Structured logging with `zap` (console for dev, JSON for prod).
* Configuration via `viper` (flags, env, config file precedence).
* Optional Prometheus metrics server and health/readiness endpoints.
* Graceful shutdown with configurable timeout and proper shutdown ordering.
* Example request logging middleware and safe JSON response helpers.
* Template metadata (`template.json`) and docs: `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.

---

## Project layout

```
cmd/server/main.go        # server bootstrap
internal/
  ├─ api/                 # HTTP handlers and DTOs
  ├─ app/                 # application services and business logic
  ├─ infra/                # adapters (db, cache, clients)
  ├─ config/              # typed config
  ├─ logging/             # zap setup and helpers
  ├─ metrics/             # prometheus registration
configs/                   # example config files
build/                     # Dockerfile, Makefile, helpers
test/                      # integration / fixture helpers
Dockerfile
Makefile
go.mod
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

---

## Prerequisites

* Go toolchain (recommended: 1.20+). Pin Go version in CI.
* Git.
* Docker (optional) for reproducible builds.
* Optional tools: `golangci-lint`, `gofumpt`, `govulncheck`.

---

## Build & run

### Local

```bash
# build
go build -trimpath -ldflags "-s -w -X main.version=0.1.0 -X main.commit=$(git rev-parse --short HEAD)" -o bin/my-service ./cmd/server

# run
./bin/my-service --config configs/development.yaml
```

### Environment variables and flags

Configuration precedence (highest → lowest): CLI flags → config file (`--config`) → environment variables (`APP_` prefix) → defaults.

Sensitive values (secrets) should be injected via environment variables or secret stores — do not commit secrets to the repo.

---

## Endpoints & examples

* `GET /healthz` — basic liveness check
* `GET /readyz` — readiness (should validate dependencies in production)
* `GET /api/v1/ping` — example ping endpoint returning `{ "message": "pong" }`

Add routes under `cmd/server` or in `internal/api` following the example patterns.

---

## Logging, metrics & health

* Logging: `zap` configured via environment (`log_level`, `environment`). Development uses console encoder; production uses JSON.
* Metrics: optional Prometheus endpoint (default `:9090`). Register application-specific counters and histograms in `internal/metrics`.
* Health: readiness should reflect external dependency states; liveness is a lightweight process check.

---

## Testing & quality gates

* Unit tests: place under `internal/...` and run `go test ./...`.
* Integration tests: use ephemeral dependencies (Docker Compose / Testcontainers) in CI.
* Linters: run `gofmt`, `gofumpt`, and `golangci-lint` in CI.
* Security: run `govulncheck` and SCA scans in CI.

---

## Packaging & Docker

Use the included multi-stage Dockerfile pattern to produce minimal, reproducible images. Example build (locally):

```bash
docker build -t my-service:latest .
```

Recommended runtime image: distroless or scratch for smaller attack surface. Run containers as non-root.

---

## CI/CD recommendations

Suggested pipeline stages (GitHub Actions/GitLab):

1. Format & lint (`gofmt`, `golangci-lint`).
2. Unit tests and `go vet`.
3. Build artifacts for target platforms.
4. Integration tests (optional on merge).
5. Build & scan Docker images (Trivy) and publish artifacts.
6. Run `govulncheck` and fail on critical issues.

Include signed releases, checksums, and SBOM generation for compliance.

---

## Contributing

Contributions welcome! Suggested workflow:

1. Fork and branch from `main`.
2. Run `gofmt` and linters locally.
3. Add tests for new behavior and open a PR with a clear description and associated `TASKS.md` references.
4. Ensure CI passes and respond to review feedback.

---

## License

This template is provided under the MIT License. See `LICENSE` for full text.
