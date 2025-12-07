# PRODSTARTER.CLI.CSHARP — TASKS (Release Checklist)

Comprehensive, opinionated checklist and actionable tasks to prepare the `csharp-cli-tool` template for production release. Use this file to break work into issues/PRs, assign owners, and verify readiness.

> Mark items ✅ when complete. Break large tasks into incremental PRs and reference checklist item IDs in PR descriptions.

---

## 0. How to use this file

1. Create a release branch (e.g. `release/v1.0.0`).
2. Break checklist items into issues and PRs; reference checklist IDs in PR descriptions.
3. Ensure CI runs on every PR and that tests and static checks pass before merging.
4. When mandatory items are ✅ and CI is green, tag and publish artifacts.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, features, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (Apache-2.0, MIT, or chosen license).
* [ ] ✅ **Repository layout** — `src/`, `tests/`, `docs/`, `ci/`, `Dockerfile`, and `template.json` present and consistent.
* [ ] ✅ **Target runtimes** — document supported .NET runtimes (e.g., net8.0) and OS targets in README and CI matrix.
* [ ] ✅ **Versioning** — initial semantic version and `VERSION` file or automated versioning pipeline.

## 2. Build, packaging & reproducibility

* [ ] ✅ **csproj** — include proper metadata (authors, company, license, repository URL), set `Deterministic=true` where applicable.
* [ ] ✅ **global.json** — pin SDK version for reproducible builds in CI.
* [ ] ✅ **Publish modes** — provide `dotnet publish` presets: framework-dependent and self-contained for target RIDs.
* [ ] ✅ **Single-file / trimming** — document and test single-file publish and trimming options for small artifacts (when applicable).
* [ ] ✅ **Docker multi-stage** — multi-stage Dockerfile for reproducible build artifacts and minimal runtime image.

## 3. Code quality & formatting

* [ ] ✅ **Static analysis** — enable Roslyn analyzers and treat critical issues as build failures in CI.
* [ ] ✅ **Style & formatting** — include `.editorconfig` and run `dotnet-format` in CI.
* [ ] ✅ **Nullable & analyzers** — enable nullable reference types (`<Nullable>enable</Nullable>`) and include recommended analyzers.
* [ ] ✅ **Security analyzers** — include SCA/SAST checks (e.g., Security Code Scan) in CI.

## 4. Configuration & environment

* [ ] ✅ **Typed configuration** — provide `IOptions<T>` classes with validation and defaults.
* [ ] ✅ **Config precedence** — document and implement config precedence: CLI args → config file → env vars → appsettings.
* [ ] ✅ **appsettings templates** — provide `appsettings.Development.json` and `appsettings.Production.json` with safe defaults.
* [ ] ✅ **Secrets guidance** — document secret provision patterns (env vars, secret managers, user secrets for dev).

## 5. Logging, telemetry & observability

* [ ] ✅ **Serilog bootstrap** — configure Serilog to read from configuration, set sensible structured JSON production defaults.
* [ ] ✅ **Correlation IDs** — ensure correlation/request IDs are logged and can be passed to external calls.
* [ ] ✅ **Metrics** — document metrics approach for worker mode (Prometheus scrape or pushgateway) and include basic counters.
* [ ] ✅ **Tracing** — provide optional OpenTelemetry bootstrap and sample exporter configuration.
* [ ] ✅ **Log level control** — allow runtime override via `--verbose` and config.

## 6. Commands & UX

* [ ] ✅ **System.CommandLine usage** — ensure help text, examples, and global options are clear and consistent.
* [ ] ✅ **Exit codes** — document and implement stable exit codes: success, argument error, config error, runtime error, interrupted.
* [ ] ✅ **Machine-readable mode** — provide `--json` or `--machine` output for automation-friendly invocation.
* [ ] ✅ **Dry-run & safety flags** — add `--dry-run` for side-effecting commands where appropriate.

## 7. Security & secrets

* [ ] ✅ **No secrets in repo** — scan repository and ensure secrets are not committed.
* [ ] ✅ **Sensitive logging** — scrub or avoid logging secrets and show guidance for custom destructuring rules.
* [ ] ✅ **Secure defaults** — TLS defaults for HTTP clients, certificate validation enabled, and secure file modes.
* [ ] ✅ **Dependency management** — enable Dependabot or GitHub security alerts and respond to critical vulnerabilities.

## 8. External integrations & infra resilience

* [ ] ✅ **HttpClientFactory** — use typed `HttpClient` from `IHttpClientFactory` with appropriate timeouts and retries.
* [ ] ✅ **Polly policies** — include retry/backoff and circuit-breaker examples for transient errors.
* [ ] ✅ **Backoff & idempotency** — document and implement idempotency for commands that call external systems.

## 9. Testing strategy

* [ ] ✅ **Unit tests** — include xUnit tests for command handlers and core services with high coverage for business logic.
* [ ] ✅ **Integration tests** — use Testcontainers or ephemeral mocks for integration tests of external dependencies.
* [ ] ✅ **Smoke tests** — CI job that publishes a build and runs smoke tests against the produced artifact.
* [ ] ✅ **Contract tests** — when integrating with external APIs, include contract tests where appropriate.
* [ ] ✅ **Static & security tests** — include Roslyn analyzers, SCA, and optional OWASP dependency checks in CI.

## 10. CI/CD

* [ ] ✅ **PR validation** — run restore, build, format check, analyzers, and unit tests on PRs.
* [ ] ✅ **Matrix builds** — build/test on supported OSs and target runtimes (linux, macos, windows as required).
* [ ] ✅ **Publish artifacts** — create release artifacts (tar.gz, zip) with checksums and optional signatures in release pipeline.
* [ ] ✅ **Signed releases** — sign artifacts (GPG) and publish to GitHub Releases or internal registry.
* [ ] ✅ **Rollback plan** — document and implement rollback steps for worker deployments and artifact promotion.

## 11. Packaging & distribution

* [ ] ✅ **Artifact naming** — follow `name-version-runtime` conventions (e.g., `mycli-1.0.0-linux-x64.tar.gz`).
* [ ] ✅ **Self-contained publish** — validate self-contained publish for target RIDs when needed.
* [ ] ✅ **Installer guidance** — provide guidance for packaging into platform installers if required (MSI, dmg, deb, rpm).

## 12. Documentation & UX

* [ ] ✅ **USAGE.md** — include examples and advanced usage (env, config, automation examples).
* [ ] ✅ **Manpage / shell completions** — provide optional manpage and shell completions (bash, zsh) generation.
* [ ] ✅ **CHANGELOG** — maintain changelog and release notes; link in README.

## 13. Runtime & operational checklist

* [ ] ✅ **Health & readiness (worker)** — if running as worker, provide simple health endpoints or probeable indicators (pidfile, metrics).
* [ ] ✅ **Logging pipeline** — ensure logs are shipped to central aggregator and include necessary context fields.
* [ ] ✅ **Monitoring & alerts** — define basic alerts: high error rate, worker crash loop, prolonged task durations.
* [ ] ✅ **Runbook** — include incident steps: capture logs, reproduce with `--verbose`, collect traces, fallback steps.

## 14. Release readiness

* [ ] ✅ **All CI checks passing** (build, tests, analyzers)
* [ ] ✅ **Artifacts produced & checksums**
* [ ] ✅ **Docs updated** (README, USAGE, ARCHITECTURE)
* [ ] ✅ **Security scan results reviewed**
* [ ] ✅ **Release notes / CHANGELOG prepared**

## 15. Post-release & maintenance

* [ ] ✅ **Dependency updates** — schedule Dependabot/SCA reviews and maintenance windows.
* [ ] ✅ **Support & issue triage** — define process and RACI for incoming issues and hotfixes.
* [ ] ✅ **Telemetry review window** — monitor metrics and logs closely for 48–72 hours after release.

## 16. Optional enhancements (future)

* [ ] ✅ **OpenTelemetry full pipeline** — OTLP exporter and instrumentation for HTTP, DB, and background operations.
* [ ] ✅ **Feature flags** — integrate a feature flagging system for controlled rollouts.
* [ ] ✅ **Plugin model** — support loading external assemblies as plugins for extensibility.
* [ ] ✅ **Native installers** — support MSI/Homebrew formulae for easier user installation.
