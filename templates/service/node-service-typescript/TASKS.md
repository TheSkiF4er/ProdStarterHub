# PRODSTARTER.NODE-SERVICE-TYPESCRIPT — TASKS (Release Checklist)

A pragmatic, opinionated checklist to prepare the `node-service-typescript` template for production release. Use this file to break work into issues/PRs, assign owners, and verify readiness before tagging and publishing.

> Tick items ✅ as they are completed. Large items should be split into smaller PRs and cross-referenced.

---

## 0. How to use this file

1. Create a release branch (e.g. `release/v1.0.0`).
2. Create issues for checklist items and link PRs to each issue.
3. Ensure CI runs on every PR and all gates pass before merging.
4. When mandatory items are complete and CI is green, create a release and publish artifacts.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, etc.).
* [ ] ✅ **Repository layout** — `src/`, `tests/`, `Dockerfile`, `Makefile`, `package.json`, `tsconfig.json`, and docs present and consistent.
* [ ] ✅ **Node versions** — document supported Node.js versions and pin in CI (e.g., 18/20 LTS).
* [ ] ✅ **Semantic versioning** — initial version and release notes process.

## 2. Build & reproducibility

* [ ] ✅ **package.json** — include scripts: `build`, `start`, `dev`, `lint`, `test`, `format`, `type-check`, `docker-build`.
* [ ] ✅ **Typescript config** — `tsconfig.json` with strict settings and `noEmit` for type checks in CI.
* [ ] ✅ **Lockfile** — commit `package-lock.json` or `pnpm-lock.yaml` for deterministic installs.
* [ ] ✅ **Reproducible builds** — prefer bundling (esbuild/webpack) for smaller runtime artifacts and reproducible output.
* [ ] ✅ **Makefile** — common targets to simplify developer and CI tasks.

## 3. Code quality & formatting

* [ ] ✅ **ESLint & Prettier** — include config and fail CI on lint/formatting issues.
* [ ] ✅ **Type checks** — run `tsc --noEmit` in CI and enforce strict mode where feasible.
* [ ] ✅ **Static analysis** — run `npm audit` / SCA tools and address critical vulnerabilities.
* [ ] ✅ **Pre-commit hooks** — add `husky`/`lint-staged` for formatting and basic checks.

## 4. Configuration & environment

* [ ] ✅ **Config loader** — central module that validates environment variables and config files (use `zod`, `joi`, or similar).
* [ ] ✅ **Config precedence** — implement and document: env vars → config file (`--config`) → defaults.
* [ ] ✅ **Config examples** — add `configs/development.env`, `configs/production.env`.
* [ ] ✅ **Secrets** — document secret provisioning (Vault, k8s secrets, cloud secret managers). Ensure no secrets are committed.

## 5. Security & hardening

* [ ] ✅ **HTTP hardening** — use `helmet`, set safe headers, limit body sizes and timeouts.
* [ ] ✅ **Rate limiting** — include an example rate limiter and guidance for production deployment.
* [ ] ✅ **Dependency scanning** — integrate SCA and fail or block for critical CVEs.
* [ ] ✅ **Runtime user** — ensure Docker image runs as non-root and files have minimal permissions.

## 6. Logging, metrics & tracing

* [ ] ✅ **Structured logging** — configure `pino` with environment-aware presets; include `service`, `env`, `version`, and `request_id`.
* [ ] ✅ **Correlation IDs** — generate or accept `X-Request-Id` and echo in logs and responses.
* [ ] ✅ **Metrics** — register Prometheus metrics and ensure `/metrics` endpoint is accessible (or run on separate port).
* [ ] ✅ **Tracing** — add optional OpenTelemetry bootstrap and document how to enable OTLP exporter.

## 7. API & UX

* [ ] ✅ **Health endpoints** — `/healthz` and `/readyz` implemented and documented; readiness checks downstream dependencies.
* [ ] ✅ **Error model** — consistent machine-readable error responses and mapping to HTTP status codes.
* [ ] ✅ **Rate limiting & CORS** — example CORS configuration and rate-limiter middleware.
* [ ] ✅ **OpenAPI** — provide OpenAPI generation or example spec for main endpoints.

## 8. Testing

* [ ] ✅ **Unit tests** — cover business logic and handler behavior (Jest or Vitest).
* [ ] ✅ **Integration tests** — use ephemeral services (Docker Compose or Testcontainers) for DB/Redis/queue tests.
* [ ] ✅ **E2E / smoke tests** — CI job that runs built artifact/container and validates health endpoints and a few flows.
* [ ] ✅ **Test coverage** — report basic coverage; ensure critical paths are covered.

## 9. Packaging & distribution

* [ ] ✅ **Artifacts** — create a production bundle (compiled JS + node_modules or a single bundle) with checksums.
* [ ] ✅ **Docker image** — multi-stage Dockerfile producing a minimal runtime image (node:slim or distroless); verify image size and security.
* [ ] ✅ **SBOM & scanning** — produce SBOM and scan images with Trivy in CI.

## 10. CI/CD & release automation

* [ ] ✅ **CI pipeline** — lint, type-check, unit tests, integration tests, build and security scans.
* [ ] ✅ **Matrix builds** — include Node version matrix for supported versions in CI.
* [ ] ✅ **Release job** — build artifact, tag version, push Docker image, upload release artifacts and checksums.
* [ ] ✅ **Secrets in CI** — use secret store/providers for registry credentials and signing keys.

## 11. Observability & runbook

* [ ] ✅ **Dashboard & alerts** — define basic alerts (error rate, latency p95/p99, memory pressure) and dashboard queries.
* [ ] ✅ **Runbook** — include steps to collect logs, traces, core dumps and to roll back a release.
* [ ] ✅ **Post-release monitoring** — monitor metrics and logs closely for 48–72 hours after release.

## 12. Documentation & developer experience

* [ ] ✅ **USAGE.md** — quick reference for running locally, in Docker and in production.
* [ ] ✅ **TUTORIAL.md** — step-by-step developer guide for building, testing and releasing.
* [ ] ✅ **CHANGELOG** — maintain changelog and release notes.

## 13. Release readiness checklist

* [ ] ✅ **CI green** for all required checks (lint, tests, security scans).
* [ ] ✅ **Artifacts built** (bundle, Docker image) and checksums generated.
* [ ] ✅ **Documentation updated** (README, TUTORIAL, ARCHITECTURE, USAGE).
* [ ] ✅ **Release notes drafted** and CHANGELOG updated.

## 14. Post-release & maintenance

* [ ] ✅ **Dependency refresh** — schedule regular dependency upgrade PRs and SCA scans.
* [ ] ✅ **Incident triage** — define ownership and escalation path for issues.
* [ ] ✅ **Telemetry review** — review dashboards and logs weekly for the first few releases.

## 15. Optional enhancements (future)

* [ ] ✅ **Auto-scaling guidance** — provide Kubernetes/HPA recommendations and resource requests/limits.
* [ ] ✅ **Feature flags** — integrate a feature-flagging system for controlled rollouts.
* [ ] ✅ **Serverless profile** — add a serverless-compatible handler wrapper and guide for AWS/GCP/Lambda.
* [ ] ✅ **Native compilation** — explore packaging with `pkg`/ncc or esbuild to reduce runtime dependencies.

---

## How to proceed

1. Create issues/PRs aligned to checklist items above and assign owners.
2. Use CI to enforce formatting, static checks, type checks and unit tests.
3. When mandatory items are complete and CI is green, tag and publish a release.
