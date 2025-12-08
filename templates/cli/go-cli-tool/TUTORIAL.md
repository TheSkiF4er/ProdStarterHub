# PRODSTARTER.CLI.GO — TUTORIAL

This tutorial walks you through scaffolding, building, testing, running, packaging, and releasing a CLI produced from the `go-cli-tool` template in **ProdStarterHub**. It emphasizes production-ready practices: configuration, observability, graceful shutdown, reproducible builds, testing, and CI/CD.

> Audience: Go developers, DevOps engineers and maintainers building and operating native CLI utilities and worker services.

---

## Table of contents

1. Prerequisites
2. Scaffold the project
3. Project layout overview
4. Dependency management and `go.mod`
5. Build (local / Docker / CI)
6. Run examples (commands)
7. Configuration & precedence
8. Observability: logging, metrics, tracing
9. Testing strategy (unit / integration / e2e)
10. Packaging & releases
11. CI/CD recommendations (GitHub Actions example)
12. Troubleshooting & debugging
13. Release checklist
14. Next steps & common extension points

---

## 1. Prerequisites

* Go toolchain (recommended: Go 1.20+; pin in CI). Install from [https://go.dev/dl/](https://go.dev/dl/).
* Git.
* Docker (optional) for reproducible builds and container images.
* Optional developer tools: `golangci-lint`, `gofmt` (or `gofumpt`), `govulncheck`.

## 2. Scaffold the project

Copy the template into your workspace and rename:

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/cli/go-cli-tool
cp -R . ~/projects/my-tool
cd ~/projects/my-tool
```

Initialize a Git repository and create your first branch:

```bash
git init
git checkout -b feature/initial
```

Customize module name in `go.mod` (or run `go mod init github.com/yourorg/my-tool`).

## 3. Project layout overview

```
cmd/tool/main.go         # CLI entrypoint (cobra wiring)
internal/
  ├─ app/                # application logic and services
  ├─ config/             # typed config and loader
  ├─ infra/              # adapters (http, db, queue)
  ├─ logging/            # zap setup and enrichers
  └─ metrics/            # prometheus metrics registration
configs/                 # sample configs (dev/prod)
build/                   # build helper scripts
test/                    # test helpers and fixtures
Dockerfile
Makefile
go.mod
go.sum
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Keep `cmd/` minimal; delegate logic to `internal/` for testability.

## 4. Dependency management and `go.mod`

* Use a single `go.mod` for your module. Run `go mod tidy` to prune unused deps.
* Pin major versions intentionally; review transitive upgrades in PRs.
* Use `go.work` only if you build multi-module workspaces locally.

Example:

```bash
go mod init github.com/yourorg/my-tool
go get github.com/spf13/cobra@latest
go get github.com/spf13/viper@latest
go get go.uber.org/zap@latest
go get github.com/prometheus/client_golang@latest
go mod tidy
```

## 5. Build (local / Docker / CI)

### Local build

```bash
# Build binary
go build -o bin/tool ./cmd/tool

# Build with version information
go build -ldflags "-s -w -X main.version=1.2.3" -o bin/tool ./cmd/tool
```

Recommended build flags for reproducibility:

* `-trimpath` to hide local paths
* `-ldflags "-s -w -X main.version=${VERSION}"` for deterministic metadata

### Docker reproducible build

Use the included multi-stage `Dockerfile` (builder -> minimal runtime). Example workflow:

```bash
docker build -t my-tool:build .
# extract artifact
docker create --name tmp my-tool:build
docker cp tmp:/app/tool ./dist/tool
docker rm tmp
```

### CI builds

CI should restore modules, run linters, run tests, and build artifacts for targeted OS/architectures (linux/amd64, linux/arm64, darwin/amd64 as needed).

## 6. Run examples (commands)

The template provides several commands (replace names as needed):

* `run` — primary processing pipeline
* `serve-metrics` — metrics and health endpoints
* `version` — prints build/time/commit
* `config` — show effective configuration

Examples:

```bash
# show help
./bin/tool --help

# run processing with an input file
./bin/tool run --input ./data/input.txt --dry-run

# run metrics server
./bin/tool serve-metrics --listen :9090

# print effective configuration
./bin/tool config --print
```

## 7. Configuration & precedence

Configuration precedence (highest → lowest):

1. CLI flags
2. Config file provided with `--config` (YAML/JSON/TOML)
3. Environment variables (prefix `TOOL_` or `APP_`)
4. Built-in defaults

**Tip:** Use Viper keys consistently. Avoid placing secrets in config files; prefer environment variables or secret stores.

## 8. Observability: logging, metrics, tracing

### Logging (zap)

* Development: console-friendly logs
* Production: JSON logs for ingestion (stdout)
* Include fields: `application`, `environment`, `version`, and optional `trace_id`

Change verbosity with a flag (e.g., `--verbose`) and avoid logging sensitive data.

### Metrics (Prometheus)

* Register metrics in `internal/metrics` and expose via `/metrics`
* Use `serve-metrics` to run a small HTTP server that serves `/metrics`, `/ready`, `/live`
* For short-lived commands, consider pushing metrics to a Pushgateway or writing a summary to stdout for automation

### Tracing

* Provide a hook to initialize OpenTelemetry (OTLP exporter). Make it opt-in via config/env.
* Propagate context when making HTTP or RPC calls.

## 9. Testing strategy (unit / integration / e2e)

### Unit tests

* Keep business logic pure and testable. Use interfaces for adapters and inject mocks in tests.
* Run `go test ./...` and aim for fast, deterministic tests.

### Integration tests

* Use ephemeral services or testcontainers to test real integrations (e.g., Postgres, Kafka).
* Keep integration tests in a separate package and run in CI selectively.

### E2E / smoke tests

* After CI builds artifacts, run smoke tests by executing the binary in a clean environment and asserting expected behavior and exit codes.

### Linters and static checks

* Run `gofmt`/`gofumpt`, `go vet`, `golangci-lint` and `govulncheck` in CI.

## 10. Packaging & releases

### Binary artifacts

Produce tarballs per platform:

```
my-tool-1.2.3-linux-amd64.tar.gz
 ├─ tool  (binary)
 ├─ LICENSE
 └─ USAGE.md
```

Include SHA256 checksums and optionally GPG signatures.

### Container images

Publish minimal images (scratch / distroless / alpine) with a non-root user. Scan images with Trivy in CI.

## 11. CI/CD recommendations (GitHub Actions example)

Recommended pipeline stages:

1. **PR checks** — `gofmt` check, lint (`golangci-lint`), `go vet`, unit tests
2. **Build** — build artifacts for a matrix of OS/arch and run `go test ./...` with coverage
3. **Sanity** — smoke tests on produced binary
4. **Security** — `govulncheck`, image scanning (Trivy)
5. **Release** — create GitHub Release, upload artifacts, checksums, and (optional) GPG signatures

Example job snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Go
        uses: actions/setup-go@v4
        with:
          go-version: '1.20'
      - run: go env
      - run: go mod download
      - run: go test ./...
      - run: go build -ldflags "-s -w -X main.version=${{ github.sha }}" -o bin/tool ./cmd/tool
```

## 12. Troubleshooting & debugging

* Increase verbosity (`--verbose`) to get more logs.
* Reproduce failures locally with the same config and inputs.
* For panics, capture full stack trace; enable `GOTRACEBACK=all` to include goroutine traces.
* Use `pprof` for CPU/memory profiles when diagnosing performance issues.
* For networking issues, inspect TLS certs and endpoint connectivity.

## 13. Release checklist

Before creating a release tag:

* [ ] CI green for build, tests, linters and security scans
* [ ] All critical and high vulnerabilities fixed or accepted with mitigation
* [ ] Artifacts built for supported platforms and checksums generated
* [ ] Release notes and `CHANGELOG.md` prepared
* [ ] Documentation (`README`, `USAGE`, `TUTORIAL`) updated
* [ ] Monitoring and alerting configured for production runs

## 14. Next steps & common extension points

* Add OpenTelemetry instrumentation and a collector in your observability stack
* Provide shell completion scripts (bash/zsh/fish) generated from Cobra
* Add a plugin or extension mechanism if your tool needs third-party extensions
* Provide packaged installers (Homebrew formula, Debian package) for end-users
