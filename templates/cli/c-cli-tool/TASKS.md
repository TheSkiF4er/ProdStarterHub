# PRODSTARTER.CLI.C — TASKS (Release Checklist)

A comprehensive, opinionated checklist and actionable task list to prepare the `c-cli-tool` template for production release. Use this file to track required work, assign owners, open PRs, and mark items done.

> Mark items as ✅ when complete. Break large items into smaller PRs and reference checklist items in PR descriptions.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, usage examples, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, and `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, or chosen license).
* [ ] ✅ **Project layout** — `src/`, `include/`, `test/`, `Makefile`, `Dockerfile`, `docs/` present and consistent.
* [ ] ✅ **Supported compilers/targets** — document supported compilers (gcc/clang) and platforms (Linux, macOS, BSD) in README and CI matrix.
* [ ] ✅ **Versioning** — initial semantic version set and `VERSION` file (optional).

## 2. Code quality & formatting

* [ ] ✅ **Coding style** — include `clang-format` config or style guide; run format check in CI.
* [ ] ✅ **Static analysis** — configure `clang-tidy` / `cppcheck` and address high-severity findings.
* [ ] ✅ **Compiler warnings** — build with `-Wall -Wextra -Werror` for CI builds (optionally relaxed for local dev) and fix warnings.
* [ ] ✅ **Pre-commit hooks** — add hooks for formatting and basic linting.

## 3. Build & reproducibility

* [ ] ✅ **Makefile** — robust targets: `make all`, `make build`, `make test`, `make clean`, `make package`, `make install`.
* [ ] ✅ **Dockerfile** — reproducible multi-stage build for packaging (optional static binary target).
* [ ] ✅ **Deterministic builds** — pin toolchain versions in CI and record build flags.
* [ ] ✅ **Cross-compile support** — document cross-compilation options or provide helper scripts if required.

## 4. Configuration & environment

* [ ] ✅ **Config sources** — document precedence: CLI flags → config file → environment → defaults.
* [ ] ✅ **.env.example** — provide example environment variables for local dev.
* [ ] ✅ **Config validation** — validate required config early and provide helpful error messages.

## 5. Security & safe defaults

* [ ] ✅ **Avoid unsafe APIs** — audit code for `system()`/`popen()` and replace with safer `execve`-style approaches or documented safe wrappers.
* [ ] ✅ **Buffer safety** — use bounded APIs (`snprintf`, `fgets`) and run ASAN/UBSAN in CI.
* [ ] ✅ **File handling** — use safe atomic writes and validate input paths; document recommended permissions.
* [ ] ✅ **Least privilege guidance** — document privilege requirements and avoid running tools as root when possible.

## 6. Observability & diagnostics

* [ ] ✅ **Logging** — structured logs to stderr, log levels controlled by `-v` flags, optional JSON mode.
* [ ] ✅ **Debugging flags** — add `--verbose`, `--dry-run`, `--trace` for diagnostics.
* [ ] ✅ **Metrics & exit codes** — document exit codes and add optional metrics/file output for automation scenarios.
* [ ] ✅ **Core dump guidance** — document how to enable core dumps and capture logs for crashes.

## 7. Testing

* [ ] ✅ **Unit test scaffold** — add tests for core parsing and business logic using a lightweight framework (cmocka/Unity) or custom harness.
* [ ] ✅ **Integration tests** — filesystem and end-to-end tests (temporary directories, fixtures).
* [ ] ✅ **Sanitizers** — enable ASAN, UBSAN, and LSan in CI jobs; resolve issues.
* [ ] ✅ **Fuzz & boundary tests** — fuzz parsers if complexity increases and add boundary condition tests.

## 8. Packaging & distribution

* [ ] ✅ **Release artifacts** — create reproducible `.tar.gz` with binary + LICENSE + USAGE + checksums.
* [ ] ✅ **Optional native packages** — provide example `deb`/`rpm` packaging scripts or guidance.
* [ ] ✅ **Container packaging** — optional minimal container (Alpine or distroless) with non-root user for CI/containers.
* [ ] ✅ **Signing & checksums** — generate signed release artifacts and publish checksums (SHA256).

## 9. Documentation & UX

* [ ] ✅ **USAGE.md / manpage** — detailed usage, examples, exit codes, and config precedence.
* [ ] ✅ **TUTORIAL.md** — quickstart and advanced examples (CI integration, container usage).
* [ ] ✅ **CHANGELOG** — maintain a changelog or use GitHub releases with notes.

## 10. CI/CD

* [ ] ✅ **CI pipeline** — lint/format check, build (gcc/clang matrix), static analysis, unit tests, sanitizers, package artifacts.
* [ ] ✅ **Cross-platform CI** — run builds and tests on Linux and macOS runners where possible.
* [ ] ✅ **Artifact publishing** — publish release artifacts to GitHub Releases or artifact registry with signed checksums.
* [ ] ✅ **Nightly/PR checks** — run extended checks (ASAN/UBSAN/fuzz) on schedule or PRs as resources permit.

## 11. Release readiness checklist

* [ ] ✅ **All mandatory tests passing** (unit, integration, sanitizers).
* [ ] ✅ **No critical static analysis issues** outstanding.
* [ ] ✅ **Documentation updated** (README, USAGE, TUTORIAL, ARCHITECTURE).
* [ ] ✅ **Artifacts built & signed**; checksums posted in release notes.
* [ ] ✅ **Release notes / CHANGELOG prepared** and release branch created.

## 12. Post-release & maintenance

* [ ] ✅ **Issue triage process** — documented bug triage and patch release workflow.
* [ ] ✅ **Security advisories** — process to notify users about security fixes and patch priority.
* [ ] ✅ **Dependency updates** — if third-party libs added, schedule SCA scans and updates.

## 13. Optional enhancements (future)

* [ ] ✅ **Optional plugin system** — dynamic plugin loading for extensibility.
* [ ] ✅ **Telemetry integration** — optional OTLP exporter for long-running modes.
* [ ] ✅ **Advanced packaging** — Homebrew formula, Chocolatey package, or Snap.
* [ ] ✅ **Localization** — support localized help messages and manpages.

---

## How to use this file

1. Create a release branch (e.g., `release/v1.0.0`).
2. Break items into issues and PRs. Tag PRs with checklist item identifiers.
3. Use project boards or issues to assign owners and track progress.
4. When all mandatory items are ✅ and CI is green, create the release and publish artifacts.
