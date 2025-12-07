# ProdStarter — C CLI Tool

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> A portable, production-ready starting template for native command-line tools written in C. Opinionated defaults for argument parsing, logging, graceful shutdown, configuration, testing, and packaging.

---

## Contents

* Quickstart
* Highlights & features
* Project layout
* Build & run (local / Docker / CI)
* Configuration & environment
* Subcommands & extension points
* Logging, diagnostics & error handling
* Testing & sanitizers
* Packaging & releases
* CI/CD recommendations
* Contributing
* License

---

## Quickstart

```bash
# copy the template into a working folder
cp -R ProdStarterHub/templates/cli/c-cli-tool ~/projects/my-cli
cd ~/projects/my-cli

# build (make)
make build

# run the tool
./bin/prodstarter-cli help
```

On macOS or Linux the default Makefile will detect `gcc` or `clang`. Use the `DEBUG=1` flag for debug builds (with symbols) or `SANITIZE=1` to enable ASAN/UBSAN during local development.

---

## Highlights & features

* Portable, dependency-free C starting point (POSIX-friendly)
* Subcommand pattern (help, version, run, config) with `getopt_long` parsing
* Environment and optional key=value config file support
* Lightweight structured logging with levels (ERROR/WARN/INFO/DEBUG)
* Graceful shutdown with signal handlers (SIGINT/SIGTERM)
* Well-defined exit codes and consistent error handling
* Robust Makefile and optional multi-stage Docker build for reproducible artifacts
* Test scaffolding and recommendations for sanitizers (ASAN/UBSAN) and CI
* Template `template.json` for automated scaffolding

---

## Project layout

```
├── src/                  # source files (main.c, cli helpers, commands)
├── include/              # public headers
├── test/                 # unit & integration tests
├── bin/                  # build output (created by Makefile)
├── dist/                 # packaged release artifacts
├── Dockerfile            # reproducible build image
├── Makefile              # build/test/package helpers
├── docs/                 # USAGE.md, manpage template
├── .github/workflows/    # CI workflow templates (optional)
├── README.md
├── ARCHITECTURE.md
├── TUTORIAL.md
├── TASKS.md
└── template.json
```

---

## Build & run

### Local (Makefile)

```bash
# Release build (optimized)
make build
# Debug build (symbols, no optimizations)
make debug
# Build with sanitizers (ASAN/UBSAN)
make sanitize
# Clean
make clean
```

Binaries are produced in `./bin/`. The main binary name is `prodstarter-cli` (replaceable via template tokens).

### Docker (reproducible-build)

A multi-stage `Dockerfile` is included to produce reproducible build artifacts. Typical flow:

```bash
docker build -t my-cli-build .
docker create --name tmp my-cli-build
docker cp tmp:/usr/local/bin/prodstarter-cli ./bin/prodstarter-cli
docker rm tmp
```

This is useful for ensuring consistent toolchains and for building on CI runners.

---

## Configuration & environment

Configuration precedence (highest → lowest):

1. CLI flags (per-subcommand)
2. Config file provided on the command line (`key=value` format)
3. Environment variables
4. Built-in defaults

Common environment variables used by the template:

* `INPUT_PATH` — default path used by the `run` subcommand
* `VERBOSE` — whether to enable verbose logging (`1` or `true`)
* `METRICS_ENABLED` — optional feature flag for metrics output

A sample `.env.example` and `docs/USAGE.md` describe all supported variables and flags.

---

## Subcommands & extension points

The code follows a subcommand dispatch model. Each subcommand lives in `src/commands/` and exposes a consistent signature so it can be tested in isolation.

To add a new subcommand:

1. Create `src/commands/mycmd.c` implementing `int cmd_mycmd(int argc, char **argv, struct config *cfg)`.
2. Add a header in `include/commands.h` and include it from `main.c`.
3. Register the subcommand in the dispatch section of `main.c`.

Subcommands must parse their flags with `getopt_long`, validate input, respect `g_terminate`, and return standard exit codes.

---

## Logging, diagnostics & error handling

* Logs are written to `stderr` with timestamps and level tags. Use `-v` / `--verbose` to increase verbosity; multiple `-v` increase verbosity further.
* A `--dry-run` flag pattern is recommended for state-changing operations.
* Exit codes are stable and predictable: `0` success, `1` generic error, `2` invalid args, `3` config error, `4` runtime error, `130` interrupted.

---

## Testing & sanitizers

The template encourages unit and integration tests under `test/`. Recommended workflow:

```bash
# run unit tests
make test

# run ASAN/UBSAN build
make sanitize
./bin/prodstarter-cli run ...
```

Run sanitizers and memory checks in CI for every PR. Use `valgrind` or `AddressSanitizer` for deeper memory investigations.

---

## Packaging & releases

Produce a deterministic tarball for releases:

```bash
make package
# creates dist/prodstarter-cli-${VERSION}-${OS}-${ARCH}.tar.gz
```

Artifacts should include the binary, `USAGE.md`, `LICENSE`, checksums (SHA256) and optional GPG signatures. Publish artifacts to GitHub Releases or an artifact registry.

---

## CI/CD recommendations

* **Build matrix**: run builds on GCC and Clang across Linux and macOS runners.
* **Quality gates**: run static analysis (clang-tidy/cppcheck), format checks (clang-format), and unit tests.
* **Sanitizers**: include an ASAN/UBSAN job to catch memory and undefined-behavior issues.
* **Package**: produce and sign artifacts in a release workflow and upload to GitHub Releases.

Example GitHub Actions jobs are provided in `.github/workflows/` when `IncludeCI` is enabled in the template.

---

## Contributing

Contributions are welcome. Suggested workflow:

1. Fork and create a topic branch.
2. Run `make test` and linters locally.
3. Open a pull request referencing relevant `TASKS.md` items.
4. Ensure CI passes and respond to review comments.

Please follow the coding style and add unit tests for new functionality.

---

## License

This project is shipped under the MIT License. See the `LICENSE` file for full text.
