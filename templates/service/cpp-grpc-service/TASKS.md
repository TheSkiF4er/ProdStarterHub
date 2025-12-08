# PRODSTARTER.CPP.GRPC.SERVICE — TASKS (Release Checklist)

Comprehensive, opinionated checklist and actionable tasks to prepare the `cpp-grpc-service` template for production release. Use this file to break work into issues/PRs, assign owners, and verify readiness.

> Mark items ✅ when complete. Break large items into incremental PRs and reference checklist IDs in PR descriptions.

---

## 0. How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break checklist items into issues and PRs; reference checklist IDs in PR descriptions.
3. Run CI on every PR and ensure tests and static checks pass before merging.
4. When mandatory items are ✅ and CI is green, tag and publish artifacts.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (Apache-2.0, MIT, or chosen license).
* [ ] ✅ **Repository layout** — `proto/`, `src/`, `include/`, `tests/`, `CMakeLists.txt` or Bazel BUILD, `Dockerfile`, and `template.json` present and consistent.
* [ ] ✅ **Supported platforms** — document supported OSs, architectures and minimum compiler versions in README and CI matrix.
* [ ] ✅ **Versioning** — define semantic versioning strategy and include `VERSION` or release process.

## 2. Build and dependency management

* [ ] ✅ **CMake / Bazel** — provide `CMakeLists.txt` or Bazel build files with clear build targets (dev, release, test).
* [ ] ✅ **Dependency manager** — add `vcpkg.json` or `conanfile.txt` with pinned dependency versions for gRPC, protobuf, spdlog, prometheus-cpp.
* [ ] ✅ **Toolchain pinning** — document and pin compiler versions in CI (gcc/clang versions) and provide `CMakePresets.json` where applicable.
* [ ] ✅ **Reproducible builds** — add build flags (`-fdebug-prefix-map`, `-gno-record-gcc-switches`, `-fno-ident`) and record build metadata (git commit, build time).

## 3. Code quality & formatting

* [ ] ✅ **clang-format** — add `.clang-format` and run `clang-format` checks in CI.
* [ ] ✅ **clang-tidy / static analysis** — configure `clang-tidy` or static analyzer and fail CI on regressions.
* [ ] ✅ **Include-what-you-use** — optional but recommended to reduce transitive includes.
* [ ] ✅ **Pre-commit hooks** — add hooks for formatting and basic static checks.

## 4. Configuration & secrets

* [ ] ✅ **Typed runtime config** — implement and document `ServerConfig` with validation and defaults.
* [ ] ✅ **Config precedence** — document and implement precedence: CLI flags → env vars → config file → defaults.
* [ ] ✅ **Secret handling** — document recommended secret provisioning (mounted files, Vault, cloud KMS) and ensure no secrets in VCS.
* [ ] ✅ **Config examples** — include `configs/development.yaml` and `configs/production.yaml` for common deployments.

## 5. Security & hardening

* [ ] ✅ **TLS** — support TLS with cert/key paths; validate file permissions and fail when missing.
* [ ] ✅ **mTLS (optional)** — provide notes or optional build path for mutual TLS if required by your architecture.
* [ ] ✅ **Minimal privileges** — document running service as non-root and recommend dropped capabilities in containers.
* [ ] ✅ **Dependency scanning** — include automated SCA (software composition analysis) in CI and address critical findings.
* [ ] ✅ **Binary scan** — scan final images with Trivy or similar in CI.

## 6. Logging, metrics & tracing

* [ ] ✅ **Logging** — integrate `spdlog` with environment-based presets (console for dev, JSON for prod). Ensure no secrets are logged.
* [ ] ✅ **Structured fields** — include `service`, `version`, `env`, and `correlation_id` in logs.
* [ ] ✅ **Metrics** — expose Prometheus metrics (counter/histogram) via `prometheus-cpp` or document sidecar pattern.
* [ ] ✅ **Health endpoints** — implement gRPC health service and optional HTTP health endpoints for readiness/liveness.
* [ ] ✅ **Tracing hooks** — provide an extension point for OpenTelemetry (OTLP) integration and context propagation.

## 7. Service behaviors & UX

* [ ] ✅ **CLI flags** — implement `--bind`, `--config`, `--tls`, `--prometheus`, `--threads`, `--verbose`, `--help` and validate inputs.
* [ ] ✅ **Exit codes** — document process exit codes (0 success, 1 generic, 2 config, 3 startup failure, 130 interrupted).
* [ ] ✅ **Graceful shutdown** — ensure `SIGINT`/`SIGTERM` cause `NOT_SERVING` then orderly shutdown with configurable timeout.
* [ ] ✅ **Backoff & retry guide** — document recommended retry strategy for outgoing calls and idempotency guidance.

## 8. Testing

* [ ] ✅ **Unit tests** — add GoogleTest unit tests for core logic; mock infra adapters.
* [ ] ✅ **Integration tests** — create integration tests using Docker Compose or testcontainers in CI to validate real dependencies.
* [ ] ✅ **Sanitizers** — run AddressSanitizer/UndefinedBehaviorSanitizer builds in CI for at least one build matrix entry.
* [ ] ✅ **Fuzzing (optional)** — add libFuzzer or AFL for parser fuzzing if service accepts untrusted input.
* [ ] ✅ **CI test coverage** — report basic coverage and ensure critical paths are covered.

## 9. Packaging & distribution

* [ ] ✅ **Artifacts** — produce versioned tarballs or deb/rpm packages with checksums and optional GPG signatures.
* [ ] ✅ **Docker image** — multi-stage Dockerfile: builder stage (compile) → runtime stage (minimal image, non-root user).
* [ ] ✅ **Image scanning & SBOM** — produce SBOM (Syft) and scan images (Trivy) in CI.
* [ ] ✅ **Platform builds** — produce artifacts for target platforms (linux/amd64, linux/arm64) as needed.

## 10. CI/CD & workflows

* [ ] ✅ **PR checks** — run build, unit tests, clang-format, clang-tidy and static analyzers on PRs.
* [ ] ✅ **Matrix builds** — compile on supported compilers/versions and OS matrix entries as required.
* [ ] ✅ **Integration stage** — run integration tests and smoke tests against built artifacts.
* [ ] ✅ **Artifact signing & release** — sign and upload checksummed artifacts to GitHub Releases or internal storage.
* [ ] ✅ **Automatic rollbacks** — document rollback steps and create automation if possible.

## 11. Observability & runbook

* [ ] ✅ **Logging pipeline** — ensure logs are collected by aggregator (ELK, Loki, Datadog) and include necessary fields for triage.
* [ ] ✅ **Metrics & alerts** — define basic alerts: high error rate, high latency p99, memory growth, worker crash loops.
* [ ] ✅ **Runbook** — include steps to reproduce, collect logs and traces, capture core dumps and rollback.
* [ ] ✅ **Post-release monitoring** — monitor for 48–72 hours after release with increased alert sensitivity.

## 12. Documentation

* [ ] ✅ **USAGE.md** — provide examples for running the service locally, in Docker, and in production.
* [ ] ✅ **TUTORIAL.md** — step-by-step guide for building, testing and releasing (link to CI docs).
* [ ] ✅ **CHANGELOG** — maintain a changelog for releases.

## 13. Release checklist

* [ ] ✅ **CI green** for build, tests, lint and security scans.
* [ ] ✅ **Artifacts produced** (tarballs/images) and checksums generated.
* [ ] ✅ **Security scans reviewed** and critical issues addressed.
* [ ] ✅ **Docs updated** (README, USAGE, ARCHITECTURE, TUTORIAL).
* [ ] ✅ **Release notes drafted** and CHANGELOG updated.

## 14. Post-release maintenance

* [ ] ✅ **Dependency updates** — schedule periodic dependency updates and vulnerability scans.
* [ ] ✅ **Incident triage** — define owners, SLAs and communication channels for issues.
* [ ] ✅ **Telemetry review** — review dashboards and logs for anomalies after release and fix issues.

## 15. Optional enhancements (future)

* [ ] ✅ **OpenTelemetry native instrumentation** and collector pipeline.
* [ ] ✅ **Operator / Helm chart** for k8s deployments with probes and RBAC.
* [ ] ✅ **Advanced security** — hardware-backed keys (HSM) or KMS integration for private keys.
* [ ] ✅ **Runtime diagnostics** — admin endpoints (protected) for pprof-like dumps and heap/stack inspection.
