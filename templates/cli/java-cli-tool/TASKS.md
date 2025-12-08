# PRODSTARTER.CLI.JAVA — TASKS (Release Checklist)

An opinionated, comprehensive checklist and actionable task list to prepare the `java-cli-tool` template for production release. Use this file to break work into issues/PRs, assign owners, and track release readiness.

> Mark items ✅ when complete. Break large items into smaller PRs and reference checklist IDs in PR descriptions.

---

## 0. How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break checklist items into issues and PRs; reference checklist item IDs in PR descriptions.
3. Run CI on every PR and ensure tests and static checks pass before merging.
4. When mandatory items are ✅ and CI is green, tag and publish artifacts.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (Apache-2.0, MIT, or chosen license).
* [ ] ✅ **Repository layout** — `src/`, `docs/`, `test/`, build files (`pom.xml` or `build.gradle`), `Dockerfile`, and `template.json` present and consistent.
* [ ] ✅ **Supported JDKs** — document supported Java versions (e.g., 17, 21) and pin in CI matrix.
* [ ] ✅ **Versioning** — initial semantic version and changelog file or release notes process.

## 2. Build & reproducibility

* [ ] ✅ **Build file** — provide `pom.xml` or `build.gradle` with metadata (group, artifactId, version, license, developers).
* [ ] ✅ **Fat jar / native options** — provide profile/gradle task to build a fat JAR (shadow plugin / maven-shade) and document native-image option (GraalVM) if supported.
* [ ] ✅ **Deterministic builds** — pin JDK/tooling versions in CI and record build metadata (commit, timestamp) into artifact manifest.
* [ ] ✅ **Docker multi-stage** — multi-stage Dockerfile to produce minimal runtime image (JRE or distroless).

## 3. Code quality & formatting

* [ ] ✅ **Style & formatting** — include checkstyle/spotless rules and run `mvn/gradle` format checks in CI.
* [ ] ✅ **Static analysis** — run SpotBugs, PMD, and/or Sonar or equivalent in CI and address findings.
* [ ] ✅ **Compiler warnings** — build with `-Xlint` where appropriate and address warnings.
* [ ] ✅ **Pre-commit hooks** — add hooks for formatting and basic static checks.

## 4. Configuration & environment

* [ ] ✅ **Config loader** — support config via file (`--config`), environment variables, and sensible defaults.
* [ ] ✅ **Config examples** — provide `configs/development.properties` and `configs/production.properties` examples.
* [ ] ✅ **Secrets handling** — document how to stash secrets (env vars, secret manager) and avoid committing secrets to repo.
* [ ] ✅ **Validation** — validate required configuration on startup and fail fast with actionable messages.

## 5. Logging, telemetry & observability

* [ ] ✅ **Logging** — configure SLF4J with a recommended implementation (Logback or Log4j2) and sensible defaults for dev vs prod.
* [ ] ✅ **Structured logs** — support JSON output in production (config flag) for log ingestion.
* [ ] ✅ **Metrics** — provide optional metrics endpoint and Prometheus exposition if worker mode is used.
* [ ] ✅ **Tracing hooks** — provide an OpenTelemetry bootstrap option and document how to enable it.

## 6. Commands & UX

* [ ] ✅ **Picocli help & examples** — ensure help text is clear, examples included, and global flags consistent across commands.
* [ ] ✅ **Exit codes** — document and implement stable exit codes: success, invalid args, config errors, runtime errors, interrupted.
* [ ] ✅ **Machine-friendly output** — provide `--json` output mode for commands where automation is expected.
* [ ] ✅ **Dry-run & safety flags** — add `--dry-run` for state-changing operations.

## 7. Security & dependencies

* [ ] ✅ **No secrets in repo** — scan and verify no secrets are committed.
* [ ] ✅ **Dependency scanning** — run SCA in CI and fix critical vulnerabilities before release.
* [ ] ✅ **Input validation** — sanitize file paths and untrusted inputs; avoid unsafe shell constructs.
* [ ] ✅ **TLS & HTTP clients** — enable strict TLS verification for outbound requests by default.

## 8. Testing

* [ ] ✅ **Unit tests** — include JUnit 5 tests for services and command handlers with high coverage of business logic.
* [ ] ✅ **Integration tests** — use Testcontainers for external dependencies (DB, Kafka) where applicable.
* [ ] ✅ **E2E / smoke tests** — CI job that runs packaged artifact and verifies core commands and probes.
* [ ] ✅ **Static & security tests** — run SpotBugs, license checks, and SCA in CI.

## 9. Packaging & distribution

* [ ] ✅ **Release artifacts** — produce versioned artifacts (fat jar / tarball) with checksums and optional GPG signatures.
* [ ] ✅ **Container images** — produce small images and scan with Trivy before publishing.
* [ ] ✅ **Platform installers** — document packaging options if required (deb, rpm, MSI) for downstream consumers.

## 10. CI/CD

* [ ] ✅ **PR validation** — run build, format, static checks and unit tests on PRs.
* [ ] ✅ **Integration & smoke** — run integration tests in merge pipeline or nightly.
* [ ] ✅ **Release pipeline** — build artifacts, sign, run smoke tests, publish to GitHub Releases or artifact repo.
* [ ] ✅ **Pinned JDKs** — pin JDK versions in CI images for reproducibility and test matrix.

## 11. Documentation & UX

* [ ] ✅ **USAGE.md** — provide examples for typical tasks and automation snippets.
* [ ] ✅ **TUTORIAL.md** — step-by-step guide for building, running, testing and releasing.
* [ ] ✅ **CHANGELOG** — maintain a changelog for releases following a consistent format.

## 12. Operational readiness

* [ ] ✅ **Runbook** — document incident steps, how to collect logs, thread dumps, and run smoke tests.
* [ ] ✅ **Monitoring & alerts** — define basic alerts (high error rate, memory pressure, crash loops).
* [ ] ✅ **Health & readiness** — verify `/ready` and `/live` endpoints and document probe timings.

## 13. Release readiness checklist

* [ ] ✅ **All CI checks passing** (build, tests, static analysis)
* [ ] ✅ **Artifacts built & checksums generated**
* [ ] ✅ **Security scans reviewed**
* [ ] ✅ **Documentation updated** (README, USAGE, TUTORIAL, ARCHITECTURE)
* [ ] ✅ **Release notes / CHANGELOG prepared**

## 14. Post-release & maintenance

* [ ] ✅ **Dependency updates** — schedule regular dependency maintenance and SCA reviews.
* [ ] ✅ **Issue triage** — establish a triage and patch-release process for critical fixes.
* [ ] ✅ **Telemetry review** — monitor metrics and logs closely for 48–72 hours after release.

## 15. Optional enhancements (future)

* [ ] ✅ **Native images** — evaluate GraalVM native-image for ultra-fast startup in constrained environments.
* [ ] ✅ **Plugin model** — design a plugin/extension system for third-party extensions (careful with classloading complexity).
* [ ] ✅ **Feature flags** — add feature-flagging integration for controlled rollouts.
* [ ] ✅ **Advanced packaging** — provide platform-specific installers for enterprise distribution.

---

## How to proceed

1. Create issues and PRs that map to the checklist items above.
2. Use CI to enforce formatting, static checks, unit tests and integration tests.
3. When all mandatory items are complete and CI is green, tag and publish a release.
