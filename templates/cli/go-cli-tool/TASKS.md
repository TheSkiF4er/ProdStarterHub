# PRODSTARTER.CLI.GO — TASKS (Release Checklist)

A comprehensive, opinionated checklist and actionable task list to prepare the `go-cli-tool` template for production release. Use this file to break work into issues/PRs, assign owners, and verify readiness.

> Mark items ✅ when complete. Break large items into smaller PRs and reference checklist IDs in PR descriptions.

---

## 0. How to use

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break checklist items into issues and PRs; reference checklist IDs in PR descriptions.
3. Ensure CI runs on every PR and that tests and static checks pass before merging.
4. When mandatory items are ✅ and CI is green, tag and publish artifacts.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, features, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, or chosen license).
* [ ] ✅ **Project layout** — `cmd/`, `internal/`, `pkg/`, `configs/`, `test/`, `build/`, `Dockerfile`, `Makefile`, and docs present and consistent.
* [ ] ✅ **Supported Go versions** — document supported Go versions in `README` and pin via `go.mod` toolchain comment or CI matrix.
* [ ] ✅ **Versioning** — initial semantic version and `VERSION` file (optional).

## 2. Code quality & formatting

* [ ] ✅ **gofmt/gofumpt** — ensure code formatted; run check in CI.
* [ ] ✅ **Static analysis** — configure `golangci-lint` and address critical issues; fail CI for regressions.
* [ ] ✅ **Vet & race** — run `go vet` and `go test -race` as part of CI.
* [ ] ✅ **Pre-commit hooks** — add hooks for formatting and linting.

## 3. Build & reproducibility

* [ ] ✅ **go.mod** — tidy dependencies and pin minimal versions.
* [ ] ✅ **Makefile** — targets: `build`, `test`, `lint`, `fmt`, `package`, `clean`, `docker-build`.
* [ ] ✅ **Dockerfile** — multi-stage reproducible build (builder + minimal runtime), CGO disabled for static binary where possible.
* [ ] ✅ **Deterministic builds** — use `-trimpath` and `-ldflags` (`-s -w`) and record `go version` in build artifacts.

## 4. Configuration & environment

* [ ] ✅ **Config precedence** — implement and document: CLI flags → config file (`--config`) → environment variables → defaults.
* [ ] ✅ **Config examples** — include `configs/development.yaml` and `configs/production.yaml` examples.
* [ ] ✅ **Secrets guidance** — document how to provide secrets (env vars, secret manager) and avoid committing secrets.
* [ ] ✅ **Validation** — validate critical configuration at startup and fail fast with actionable messages.

## 5. Security & safe defaults

* [ ] ✅ **Avoid unsafe shell usage** — audit uses of `exec.Command` and sanitize inputs.
* [ ] ✅ **Dependency scanning** — run `govulncheck` or SCA in CI and address critical vulnerabilities.
* [ ] ✅ **TLS defaults** — enforce certificate validation for outgoing HTTP by default.
* [ ] ✅ **File handling** — use safe atomic writes and validate file paths and permissions.

## 6. Observability & diagnostics

* [ ] ✅ **Structured logging** — implement zap logger with environment-based presets (dev vs prod).
* [ ] ✅ **Correlation IDs** — propagate trace or request IDs in logs when applicable.
* [ ] ✅ **Metrics** — register Prometheus metrics and provide a `serve-metrics` command with `/metrics`, `/ready`, `/live`.
* [ ] ✅ **Tracing hooks** — provide extension point for OpenTelemetry; document enabling/disabling.

## 7. Commands & UX

* [ ] ✅ **Cobra help & examples** — verify help text, examples, and consistent global flags (verbosity, config, env).
* [ ] ✅ **Exit codes** — document and implement stable exit codes (0,1,2,3,4,130).
* [ ] ✅ **Machine-readable output** — support `--json` or `--machine` mode for automation where appropriate.
* [ ] ✅ **Dry-run & safety flags** — add `--dry-run` for commands that modify external state.

## 8. Testing

* [ ] ✅ **Unit tests** — add unit tests for core app logic (use Go testing + testify or stdlib assertions).
* [ ] ✅ **Integration tests** — provide integration tests using ephemeral resources or test containers where appropriate.
* [ ] ✅ **E2E / smoke tests** — CI job that builds a binary and runs basic smoke tests validating core flows.
* [ ] ✅ **Sanitizers & race** — run `go test -race` and consider running tests under `ASAN`/`UBSAN` via cgo-enabled builds if needed.

## 9. Packaging & distribution

* [ ] ✅ **Artifacts** — produce OS/arch tarballs: `tool-<version>-<os>-<arch>.tar.gz` containing binary, LICENSE, USAGE, checksums.
* [ ] ✅ **Checksums & signatures** — generate SHA256 checksums and optionally GPG-sign release artifacts.
* [ ] ✅ **Container images** — provide and scan minimal container images; publish to registry if applicable.

## 10. CI/CD

* [ ] ✅ **CI pipeline** — lint, fmt check, build, unit tests, integration or smoke tests, artifact packaging.
* [ ] ✅ **Matrix builds** — build for supported OS/arch targets (linux/amd64, linux/arm64, darwin/amd64 as needed).
* [ ] ✅ **Security & vulnerability checks** — run `govulncheck` or SCA and image scanning (Trivy) in pipeline.
* [ ] ✅ **Release job** — create GitHub Release with artifacts, checksums, and optional signatures.

## 11. Documentation & UX

* [ ] ✅ **USAGE.md** — examples for common tasks and automation snippets.
* [ ] ✅ **TUTORIAL.md** — step-by-step guide for building, running, testing and releasing.
* [ ] ✅ **CHANGELOG** — maintain changelog for releases.

## 12. Operational readiness

* [ ] ✅ **Runbook** — include incident steps: reproduction, logs collection, core dump capture, and rollback guidance.
* [ ] ✅ **Monitoring & alerts** — define basic alerts for error rate, high latency, and worker crash loops.
* [ ] ✅ **Health checks** — verify readiness/liveness endpoints and test probe timings.

## 13. Post-release & maintenance

* [ ] ✅ **Dependency updates** — schedule periodic dependency maintenance and SCA reviews.
* [ ] ✅ **Issue triage** — define support & triage process for production issues.
* [ ] ✅ **Telemetry review** — monitor metrics and logs closely for 48–72 hours after a release.

## 14. Optional enhancements (future)

* [ ] ✅ **OpenTelemetry full pipeline** — OTLP exporter, sampling, and dashboards.
* [ ] ✅ **Plugin architecture** — add plugin extension points (careful with Go plugin portability).
* [ ] ✅ **Homebrew/apt packaging** — provide packaging recipes for end users.
* [ ] ✅ **Fuzz tests** — add fuzzing for parsers and input handling.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break items into issues and PRs. Tag PRs with checklist item identifiers.
3. Use project boards or issues to assign owners and track progress.
4. When all mandatory items are ✅ and CI is green, create the release and publish artifacts.
