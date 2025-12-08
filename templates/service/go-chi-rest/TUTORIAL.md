# PRODSTARTER.GO-CHI-REST — TUTORIAL

This tutorial walks you through scaffolding, building, testing, running, packaging and releasing a production-ready REST service based on the `go-chi-rest` template from **ProdStarterHub**. It focuses on best practices: configuration, observability, graceful shutdown, reproducible builds, testing strategy, containerization and CI/CD.

> Audience: Go backend engineers, SREs and DevOps who build and operate HTTP services.

---

## Table of contents

1. Prerequisites
2. Scaffold & first-run
3. Project layout overview
4. Configuration (file / env / flags) and examples
5. Local development and iteration
6. Build: local, cross-compile and reproducible builds
7. Run examples and common commands
8. Observability: logging, metrics, tracing
9. Testing: unit, integration, smoke & contract tests
10. Packaging & releases (binaries & containers)
11. CI/CD recommendations (GitHub Actions examples)
12. Troubleshooting & debugging
13. Release checklist
14. Next steps & extensions

---

## 1. Prerequisites

* Go toolchain (recommended: 1.20+). Pin version in CI.
* Git.
* Docker (optional) for reproducible builds and integration tests.
* Optional developer tools: `golangci-lint`, `gofumpt`/`gofmt`, `govulncheck`.

## 2. Scaffold & first-run

Copy or generate the template into a working directory:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/service/go-chi-rest
cp -R . ~/projects/my-service
cd ~/projects/my-service
```

Initialize module and tidy dependencies:

```bash
go mod init github.com/yourorg/my-service
go mod tidy
```

Build and run locally:

```bash
go build -trimpath -o bin/my-service ./cmd/server
./bin/my-service --help
```

## 3. Project layout overview

```
cmd/server/main.go        # application bootstrap and HTTP server
internal/
  ├─ api/                 # transport layer (http handlers, DTOs)
  ├─ app/                 # business services / use-cases
  ├─ infra/                # adapters (db, cache, http clients)
  ├─ config/              # typed config and loader
  ├─ logging/             # zap setup and helpers
  ├─ metrics/             # prometheus metrics registration
  └─ tracing/             # opentelemetry bootstrap (optional)
configs/                  # example config files
build/                    # scripts, Dockerfile, build helpers
test/                     # integration test helpers
Makefile
Dockerfile
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Keep business logic in `internal/app` so it is easily unit-testable.

## 4. Configuration (file / env / flags)

Precedence (highest → lowest):

1. Command-line flags (pflag)
2. Environment variables (Viper with `APP_` prefix)
3. Config file provided with `--config` (YAML/JSON/TOML)
4. Defaults in code

Example `configs/development.yaml`:

```yaml
bind_addr: ":8080"
read_timeout: "5s"
write_timeout: "10s"
idle_timeout: "120s"
shutdown_timeout: "15s"
environment: "development"
enable_metrics: true
metrics_listen: ":9090"
log_level: "debug"
```

Tips:

* Use environment variables for secrets and CI-injected settings.
* Provide a `--config` example and `--print-config` helper if useful.

## 5. Local development and iteration

* Run the server locally and edit handlers; use `go run ./cmd/server` for fast iteration.
* Use `dlv` (delve) in your IDE for debugging.
* Use `httptest` and table-driven tests for handler logic.
* Use `mock` packages or interfaces for infra adapters to make unit tests deterministic.

## 6. Build: local, cross-compile and reproducible builds

### Local build

```bash
VERSION=0.1.0
go build -trimpath -ldflags "-s -w -X main.version=${VERSION} -X main.commit=$(git rev-parse --short HEAD) -X main.buildTime=$(date -u +%Y-%m-%dT%H:%M:%SZ)" -o bin/my-service ./cmd/server
```

### Cross compile

For linux/amd64 and linux/arm64:

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -trimpath -ldflags "-s -w -X main.version=${VERSION}" -o dist/my-service-linux-amd64 ./cmd/server
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -trimpath -ldflags "-s -w -X main.version=${VERSION}" -o dist/my-service-linux-arm64 ./cmd/server
```

### Docker reproducible build (multi-stage)

Use a multi-stage Dockerfile that builds inside an official Go builder image and copies the artifact into a minimal runtime (distroless/scratch).

## 7. Run examples and common commands

Start service (dev):

```bash
./bin/my-service --config configs/development.yaml
```

Start with metrics disabled:

```bash
./bin/my-service --config configs/development.yaml --enable-metrics=false
```

Health checks:

```bash
curl http://localhost:8080/healthz
curl http://localhost:8080/readyz
```

API example:

```bash
curl http://localhost:8080/api/v1/ping
# -> {"message":"pong"}
```

## 8. Observability: logging, metrics, tracing

### Logging (zap)

* Development: console encoder, human-friendly.
* Production: JSON encoder, structured logs on stdout.
* Include `service`, `env`, `version`, and `request_id` in every log line.

### Metrics (Prometheus)

* Register counters/histograms for requests, durations, errors.
* Expose `/metrics` on a configurable port (default `:9090`).

Example metrics to register:

* `http_requests_total{method,route,status}` counter
* `http_request_duration_seconds` histogram

### Tracing (OpenTelemetry)

* Provide optional OTLP exporter initialization behind a config flag.
* Propagate context with `traceparent` and include trace ids in logs.

## 9. Testing: unit, integration, smoke & contract tests

### Unit tests

* Keep fast and deterministic. Mock infra adapters. Use table-driven tests.

```bash
go test ./internal/... -short
```

### Integration tests

* Use Docker Compose or Testcontainers to run real DB/Redis and test end-to-end flows.
* Run integration tests in CI or a separate job.

### Smoke tests

* After building artifacts, run smoke tests that call `/healthz`, `/readyz`, and a few critical endpoints.

### Contract tests

* If other teams consume your API, maintain contract tests (PACT) to avoid breaking changes.

## 10. Packaging & releases (binaries & containers)

### Binary releases

* Produce tarballs per OS/arch with `bin/`, `USAGE.md`, and `LICENSE`.
* Include SHA256 checksums and optional GPG signatures.

### Container images

* Build multi-arch images via `docker buildx` or have CI produce separate images and push to registry.
* Scan images with Trivy and generate SBOM (Syft).

## 11. CI/CD recommendations (GitHub Actions)

Suggested pipeline:

1. **PR checks** — `gofmt`, `golangci-lint`, `go vet`, unit tests.
2. **Build** — cross-compile artifacts for target OS/arch.
3. **Integration** — run integration tests using Docker Compose (optional on PRs).
4. **Package** — create artifacts (tarballs), checksums and container images.
5. **Security** — run `govulncheck` and image scanning (Trivy).
6. **Release** — on tag create GitHub Release and upload artifacts.

Job snippet (build & test):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.20'
      - name: Cache modules
        uses: actions/cache@v4
        with:
          path: ~/.cache/go-build
          key: ${{ runner.os }}-go-${{ hashFiles('**/go.sum') }}
      - name: Install linters
        run: go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
      - name: Lint
        run: golangci-lint run ./...
      - name: Test
        run: go test ./... -cover
      - name: Build
        run: go build -trimpath -ldflags "-s -w" -o bin/my-service ./cmd/server
```

## 12. Troubleshooting & debugging

* If server does not start, check config path and required env variables.
* Increase log level to `debug` to see initialization details.
* For panic/stack traces, enable core dumps in development and attach debugger (`delve`) locally.
* For performance issues use `pprof` (expose debug endpoint behind auth) and analyze CPU/memory profiles.

## 13. Release checklist

* [ ] CI green for build, tests, lint and security scans
* [ ] Binaries built for supported OS/arch and checksums generated
* [ ] Container images scanned and SBOM attached
* [ ] Documentation updated (README, USAGE, ARCHITECTURE, TUTORIAL)
* [ ] Release notes / CHANGELOG prepared and published

## 14. Next steps & extensions

* Add OpenTelemetry instrumentation and configure a collector in your observability stack.
* Generate OpenAPI/Swagger from handlers and publish developer docs.
* Add middleware for authentication, rate-limiting and request/response validation.
* Provide installers or Helm charts for distribution in Kubernetes.
