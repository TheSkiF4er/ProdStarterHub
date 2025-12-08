# PRODSTARTER.GO-CHI-REST — TASKS (Release Checklist)

An opinionated, comprehensive checklist and actionable task list to prepare the `go-chi-rest` template for production release. Use this file to break work into issues/PRs, assign owners, and verify readiness.

> Mark items ✅ when complete. Split large tasks into smaller PRs and reference checklist IDs in PR descriptions.

---

## 0. How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break checklist items into issues and PRs; reference checklist IDs in PR descriptions.
3. Run CI on every PR and ensure tests and static checks pass before merging.
4. When mandatory items are ✅ and CI is green, tag and publish artifacts.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include appropriate license file and ensure metadata in `template.json` matches.
* [ ] ✅ **Repository layout** — `cmd/`, `internal/`, `configs/`, `build/`, `test/`, `Dockerfile`, `Makefile`, `go.mod`, and docs present and consistent.
* [ ] ✅ **Supported Go versions** — document supported Go versions in `README` and pin toolchain in CI matrix.
* [ ] ✅ **Versioning & changelog** — define semantic versioning strategy and include an initial `CHANGELOG.md` or release notes process.

## 2. Code quality & formatting

* [ ] ✅ **gofmt/gofumpt** — ensure formatting and include a CI check.
* [ ] ✅ **Static analysis** — configure `golangci-lint` and address critical findings; fail CI on regressions.
* [ ] ✅ **Vet & race** — run `go vet` and `go test -race` in CI where applicable.
* [ ] ✅ **Pre-commit hooks** — add hooks for formatting, linting, and tests.

## 3. Build & reproducibility

* [ ] ✅ **go.mod** — tidy dependencies and pin minimal versions.
* [ ] ✅ **Makefile** — provide common targets: `build`, `test`, `lint`, `fmt`, `docker-build`, `release`.
* [ ] ✅ **Dockerfile** — provide multi-stage Dockerfile: builder (Go) → minimal runtime (scratch/distroless) with non-root user.
* [ ] ✅ **Deterministic builds** — use `-trimpath` and `-ldflags "-s -w -X main.version=..."`; record `go version` in build artifacts.

## 4. Configuration & environment

* [ ] ✅ **Config precedence** — implement and document: CLI flags → config file (`--config`) → environment variables → defaults.
* [ ] ✅ **Config examples** — include `configs/development.yaml` and `configs/production.yaml`.
* [ ] ✅ **Secrets guidance** — document secret management (env vars, KMS, mounted files) and ensure no secrets are committed.
* [ ] ✅ **Validation** — validate critical configuration at startup and fail fast with actionable messages.

## 5. Security & safe defaults

* [ ] ✅ **Transport security** — document TLS termination strategy; if server-level TLS is supported, validate cert/key loading.
* [ ] ✅ **Dependency scanning** — run `govulncheck` or SCA in CI and address critical vulnerabilities.
* [ ] ✅ **HTTP hardening** — set safe headers (HSTS, X-Frame-Options, X-Content-Type-Options) where applicable.
* [ ] ✅ **Input validation** — validate and sanitize user inputs; limit body sizes and timeouts.

## 6. Observability & diagnostics

* [ ] ✅ **Structured logging** — use zap with environment-based presets (console for dev, JSON for prod) and include `service`, `env`, `version`, `request_id`.
* [ ] ✅ **Correlation IDs** — propagate request IDs and trace context across handlers and outbound requests.
* [ ] ✅ **Metrics** — register Prometheus metrics and provide `/metrics`, `/healthz`, `/readyz` endpoints; include example application metrics (requests, latencies, errors).
* [ ] ✅ **Tracing** — provide optional OpenTelemetry initialization and configuration guidance.

## 7. API & UX

* [ ] ✅ **HTTP contract** — document API routes, request/response schemas and example payloads (OpenAPI/Swagger recommended).
* [ ] ✅ **Error model** — implement a consistent machine-readable error response and document mapping to HTTP status codes.
* [ ] ✅ **Rate limiting & throttling** — provide example middleware or guidance for API rate limiting and backpressure.
* [ ] ✅ **CORS & security headers** — include example CORS configuration and secure header defaults.

## 8. Testing

* [ ] ✅ **Unit tests** — add unit tests for handlers, services and utilities using standard libraries and test helpers.
* [ ] ✅ **Integration tests** — create integration tests using ephemeral resources (Docker Compose or Testcontainers) for DB/Redis/etc.
* [ ] ✅ **E2E / smoke tests** — CI job that builds the artifact and runs smoke tests against the binary/container.
* [ ] ✅ **Linters & static checks** — enforce `gofmt`, `go vet`, `golangci-lint` in CI.

## 9. Packaging & distribution

* [ ] ✅ **Artifacts** — produce tarballs or archives with binary, `USAGE.md`, and `LICENSE`.
* [ ] ✅ **Container images** — build minimal immutable container images and publish to registry; scan images in CI.
* [ ] ✅ **Checksums & signatures** — generate SHA256 sums and optionally sign artifacts for release.

## 10. CI/CD

* [ ] ✅ **CI pipeline** — lint, format check, unit tests, integration/smoke tests and build matrix for target platforms.
* [ ] ✅ **Matrix builds** — perform builds for `linux/amd64` and `linux/arm64` if required.
* [ ] ✅ **Security scans** — run `govulncheck`, SCA, and container scanning (Trivy) in CI.
* [ ] ✅ **Release job** — package artifacts, publish to GitHub Releases and push container images.

## 11. Operational readiness

* [ ] ✅ **Runbook** — include incident steps: reproduction, logs collection, trace/metrics links, and rollback guidance.
* [ ] ✅ **Monitoring & alerts** — define alerts for error rate, latency p99, and memory/CPU pressure.
* [ ] ✅ **Health checks** — ensure readiness and liveness endpoints and document probe timings for Kubernetes.
* [ ] ✅ **Logging retention & costs** — provide guidance for log levels and retention in production.

## 12. Documentation & UX

* [ ] ✅ **USAGE.md** — examples for common run modes, flags, and automation snippets.
* [ ] ✅ **TUTORIAL.md** — step-by-step guide for building, running, testing and releasing (link to CI docs).
* [ ] ✅ **OpenAPI / API docs** — generate and publish API docs; include example client snippets.

## 13. Release checklist

* [ ] ✅ **All CI checks passing** (build, tests, lint and vulnerability scans)
* [ ] ✅ **Artifacts built & checksums generated**
* [ ] ✅ **Documentation updated** (README, USAGE, TUTORIAL, ARCHITECTURE)
* [ ] ✅ **Monitoring & alerts configured** for the release
* [ ] ✅ **Release notes / CHANGELOG prepared**

## 14. Post-release & maintenance

* [ ] ✅ **Dependency updates** — schedule periodic dependency updates and vulnerability reviews.
* [ ] ✅ **Issue triage** — define support & triage process for production incidents.
* [ ] ✅ **Telemetry review** — monitor metrics and logs closely for 48–72 hours after release.

## 15. Optional enhancements (future)

* [ ] ✅ **OpenTelemetry full pipeline** — OTLP exporter, sampling, and dashboards.
* [ ] ✅ **API Gateway integration** — example policies for auth, rate-limiting and routing.
* [ ] ✅ **Client SDKs / OpenAPI** — generate and publish client SDKs for consumer languages.
* [ ] ✅ **Feature flags** — integrate a feature-flag system for safe rollouts.
* [ ] ✅ **Chaos testing** — schedule controlled chaos tests to validate resilience and recovery.

---

## How to proceed

1. Create issues and PRs that map to the checklist items above.
2. Use CI to enforce formatting, static checks, unit tests and integration tests.
3. When all mandatory items are complete and CI is green, tag and publish a release.
