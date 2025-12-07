# PRODSTARTER.CLI.C — ARCHITECTURE

> Production-ready architecture document for the `c-cli-tool` template. This file documents design decisions, component responsibilities, configuration, packaging, observability, security considerations, testing strategy, CI/CD, and an operational runbook for a hardened, portable C command-line tool.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout
5. Core components & responsibilities
6. Configuration & environment
7. Logging, metrics & observability
8. Error handling & exit codes
9. Signal handling & graceful shutdown
10. Security considerations
11. Packaging, distribution & release strategy
12. Testing strategy
13. CI/CD and quality gates
14. Documentation & UX
15. Runbook & production checklist
16. Extending the template
17. References

---

## 1. Purpose & goals

The `c-cli-tool` template is a minimal, portable, and production-ready starting point for building command-line utilities in C. It emphasizes:

* Portability across UNIX-like systems (Linux, macOS, *BSD)
* Small dependency surface (no third-party libs required by default)
* Robust CLI UX with subcommands, flags, and clear error semantics
* Testability, observability, and operational readiness

This template is ideal for tools that perform automation, infra tasks, data-processing pipelines, or small system-level utilities.

## 2. Non-functional requirements

* **Portability:** build with `gcc`/`clang` using standard C11 and POSIX APIs where needed.
* **Reliability:** graceful shutdown, deterministic exit codes, consistent error handling.
* **Performance:** efficient streaming IO and low memory footprint by default.
* **Security:** safe defaults, avoid command injection, safe file handling, and minimal privileges.
* **Maintainability:** clear project layout, modular design, documented public APIs, and unit/integration tests.

## 3. High-level architecture

The CLI is a single-process, single-binary application built from modular C sources. Logical layers:

```
User -> CLI front-end (arg parsing, subcommand dispatch) ->
  core commands (run/config/help/version) -> platform adapters (fs, network, db) -> logging/metrics
```

* Subcommands implement business logic; they should be small, focused, and testable.
* Platform adapters isolate OS-dependent code for easier testing and porting.

## 4. Project layout

Opinionated layout to scale from single-file tools to larger utilities:

```
project-root/
├── src/
│   ├── main.c            # entrypoint (created by template)
│   ├── cli.c             # argument parsing & dispatch helpers
│   ├── log.c             # lightweight logger
│   ├── config.c          # env + file config loader
│   ├── commands/         # subcommand implementations (run.c, config.c,...)
│   └── platform/         # platform adapters (fs, signals, time)
├── include/              # public headers for linking
├── test/                 # unit and integration tests
├── scripts/              # helper scripts (lint, release)
├── Dockerfile            # optional container packaging
├── Makefile              # build, test, lint, pack targets
├── docs/                 # README, USAGE, manpage templates
├── CI/                   # CI workflow templates
└── LICENSE
```

## 5. Core components & responsibilities

* **main.c** — app bootstrap: global options, signal handler install, config initialization, subcommand dispatch, and exit.
* **cli.c / cli.h** — centralized parsing and helper functions supporting `getopt_long`, validation, help text generation, and subcommand scaffolding.
* **commands/** — one source per subcommand; each exposes a `int cmd_X(int argc, char **argv, struct cfg *)` signature for testability.
* **config.c / config.h** — load configuration from env and optional key=value file; expose typed config struct.
* **log.c / log.h** — minimal structured logger with levels and timestamps; pluggable to redirect to file or syslog.
* **platform/** — OS-specific functions (atomic ops, file locking, high-resolution timers), isolated for portability.

## 6. Configuration & environment

* Configuration priority: CLI flags → config file (if provided) → environment variables → sensible defaults.
* Use a simple key=value file for optional persistent config; avoid complex parsers to keep dependency-free.
* Provide `.env.example` and clear documentation for required env vars.
* Validate configuration at startup and fail fast with user-friendly messages.

Recommended keys / envs:

* `INPUT_PATH` — default input path
* `VERBOSE` — verbosity toggle
* `METRICS_ENABLED` — feature flag for metrics

## 7. Logging, metrics & observability

### Logging

* Provide a small structured logger that writes to `stderr` by default.
* Support levels: ERROR, WARN, INFO, DEBUG and map CLI `-v` flags to levels.
* Include timestamps and application name in log lines; avoid logging sensitive values.
* Support optional JSON output via compile-time or runtime flag if required.

### Metrics

* For simple CLIs, expose basic counters (runs, errors) optionally to a file (`--metrics-file`) or stdout in a machine-readable mode.
* For long-running daemons, support Prometheus-style exposition when running inside a container or systemd service (optional integration).

### Tracing

* Native OpenTelemetry is beyond default scope, but provide clear extension points to hook tracing libraries or to emit lightweight traces/trace IDs in logs.

## 8. Error handling & exit codes

* Define a small set of stable, documented exit codes (see template):

  * `0` success
  * `1` generic error
  * `2` invalid args
  * `3` config error
  * `4` runtime error
  * `130` interrupted (SIGINT)
* Return meaningful messages to `stderr` and machine-readable error payloads when `--json` or `--machine` flags are used.
* Avoid printing sensitive data in error messages.

## 9. Signal handling & graceful shutdown

* Install handlers for `SIGINT` and `SIGTERM`. On signal:

  * set an atomic flag to request cancellation
  * stop accepting new work
  * drain short-lived tasks and close open file descriptors
  * exit with the interrupted exit code after a configurable timeout
* Ensure any blocking I/O checks the cancellation flag periodically.

## 10. Security considerations

* **Principle of least privilege:** do not run with elevated privileges. Avoid `setuid` bits unless necessary.
* **Safe file handling:** validate user-supplied paths, avoid following symlinks blindly, and perform atomic writes (write temp then rename).
* **Shell safety:** when invoking shell commands, avoid `system()` with concatenated strings. Prefer `execve` with argument vectors.
* **Input sanitization:** validate inputs and avoid buffer overflows (use `snprintf`, bounds checks).
* **Dependency supply chain:** if third-party libs are added later, enable dependency provenance checks and sign artifacts.

## 11. Packaging, distribution & release strategy

### Build artifacts

* Produce a statically linkable or dynamically linked binary depending on target portability needs.
* Ship a small tarball: `mytool-${version}-${os}-${arch}.tar.gz` containing the binary, `LICENSE`, `USAGE`, and optionally a manpage.

### Packaging targets

* Native packages: provide example `deb` and `rpm` packaging scripts or a simple `cargo-deb`-like process (helper scripts).
* Container image: optional minimal container (Alpine or distroless) to run the CLI in CI or containerized workflows.

### Releases

* Git tags following semantic versioning. Build reproducible artifacts in CI and upload to a release registry (GitHub Releases, Artifactory).
* Sign release artifacts with GPG and publish checksums (SHA256).

## 12. Testing strategy

### Unit tests

* Keep pure logic testable in small C functions and test via a unit test framework (e.g., `cmocka`, `Unity`, or a simple custom harness).
* Mock platform adapters (file, network) to isolate unit tests.

### Integration tests

* Tests that exercise filesystem interactions, config file parsing, and end-to-end runs. Use temporary directories and clean up state.
* Test signal handling by sending `SIGINT`/`SIGTERM` and asserting termination semantics.

### Fuzz and memory testing

* Run `valgrind`/`AddressSanitizer` to detect leaks and UB.
* Add occasional fuzz targets for parsers (config, args) if complexity grows.

### Test data & fixtures

* Keep small fixtures under `test/fixtures/` and create them at runtime in temp dirs.

## 13. CI/CD and quality gates

* **CI pipeline** should include:

  * Static analysis (`clang-tidy`, `cppcheck`) and format check (e.g., `clang-format`) if used
  * Build on multiple OS/architectures (Linux, macOS) via matrix
  * Unit tests and integration tests
  * Sanitizers (`ASAN`, `UBSAN`) and memory checks on PRs or nightly
  * Artifact packaging and signing on release branch
* Optionally run container image build & scan with `trivy`.

## 14. Documentation & UX

* Ship `USAGE.md`, `README.md`, and `man` page template under `docs/`.
* Help text on `--help` must be concise; include examples and common workflows.
* Provide machine-readable output mode (`--json` / `--machine`) for automation.

## 15. Runbook & production checklist

Before shipping a release:

* [ ] Build reproducible artifacts in CI and publish them.
* [ ] Run full unit, integration, sanitizer, and memory tests.
* [ ] Publish checksums and GPG signatures for binary artifacts.
* [ ] Prepare `CHANGELOG.md` and release notes.
* [ ] Verify packaging on target OS versions (glibc vs musl considerations).

Operational troubleshooting steps:

1. Re-run the command with `-v` or `-vv` for debug output.
2. Reproduce failing scenario under valgrind/ASAN to find memory issues.
3. Check input file permissions, paths, and environment variables.
4. If crash occurs, capture core dump (if enabled) and analyze with `gdb`.

## 16. Extending the template

* Add optional support for TOML/JSON/YAML config parsing via small libraries when necessary.
* Provide language bindings or wrap as a library for reuse from other languages.
* Offer an opt-in telemetry integration (OTLP) and metrics exposition for long-running modes.
* Add plugins support (dynamic loading) for extensibility in large systems.

## 17. References

* POSIX specification — [https://pubs.opengroup.org/onlinepubs/9699919799/](https://pubs.opengroup.org/onlinepubs/9699919799/)
* GNU getopt_long documentation — man page
* C11 standard — ISO/IEC 9899:2011
* ASAN/UBSAN docs — [https://clang.llvm.org/docs/AddressSanitizer.html](https://clang.llvm.org/docs/AddressSanitizer.html)
* Recommended security practices for native tools (OWASP guidance)

---

> This ARCHITECTURE.md is opinionated and intended to provide a pragmatic, secure, and maintainable baseline for production CLI tools written in C. Adapt it to your organization’s constraints while preserving the core goals: portability, safety, observability, and testability.
