# PRODSTARTER.CLI.C — TUTORIAL

This tutorial walks you through creating, building, testing, running, packaging, and releasing a CLI scaffolded from the `c-cli-tool` template in **ProdStarterHub**. It emphasizes portability, safety, reproducibility, and operational practices suitable for production CLI tools.

> Audience: C developers, DevOps engineers, SREs, and maintainers who will build, ship, and operate native command-line tools.

---

## Table of contents

1. Prerequisites
2. Get the template & scaffold a project
3. Project layout overview
4. Build (local / Docker / CI)
5. Running the CLI (examples)
6. Configuration & precedence
7. Subcommands & extension points
8. Logging, diagnostics & verbosity
9. Testing strategy (unit, integration, sanitizers)
10. Packaging & distribution
11. CI/CD recommendations (GitHub Actions example)
12. Debugging & troubleshooting
13. Release checklist
14. Next steps and extension ideas

---

## 1. Prerequisites

* A POSIX-compatible build environment: `gcc` or `clang` (support for both recommended).
* Make (GNU make) or your preferred build tool.
* `autoconf`/`cmake` optional if you plan to add them.
* `tar` / `gzip` for packaging.
* Docker (optional) for reproducible builds and packaging.
* Tools for testing: `cmocka` / `Unity` (optional) and sanitizers available in clang (`ASAN`, `UBSAN`) or GCC.

## 2. Get the template & scaffold a project

```
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/cli/c-cli-tool
cp -R . ~/projects/my-cli-tool
cd ~/projects/my-cli-tool
```

Adjust project metadata and replace tokens (if present). You may rename `prodstarter-cli` in the source and `Makefile` to match your project name.

## 3. Project layout overview

```
project-root/
├── src/
│   ├── main.c            # entrypoint
│   ├── cli.c             # argument parsing and dispatch helpers
│   ├── config.c          # env + file config loader
│   ├── log.c             # logger helper
│   ├── commands/         # subcommand implementations
│   └── platform/         # platform adapters
├── include/              # public headers
├── test/                 # unit and integration tests
├── Makefile
├── Dockerfile
├── docs/
│   ├── USAGE.md
│   └── manpage.1
├── .github/workflows/    # CI templates
└── README.md
```

## 4. Build (local / Docker / CI)

### Local build (Makefile)

The template includes a `Makefile` with common targets. Example:

```bash
# Build release binary
make build

# Build with debug symbols
make debug

# Clean build artifacts
make clean
```

Recommended compiler flags for CI: `-std=c11 -O2 -Wall -Wextra -Werror` for quality; enable ASAN/UBSAN for sanitizer builds.

### Docker reproducible build

Use a multi-stage Dockerfile to ensure reproducible toolchains. Example usage:

```bash
docker build -t my-cli:build -f Dockerfile .
# extract built binary
docker create --name tmp my-cli:build && docker cp tmp:/usr/local/bin/my-cli ./dist/my-cli && docker rm tmp
```

### CI builds

CI should run matrix builds for `gcc` and `clang`, run unit tests, run sanitizer builds, and produce packaged artifacts (`.tar.gz`) with checksums.

## 5. Running the CLI (examples)

### Help and version

```bash
./prodstarter-cli help
./prodstarter-cli version
```

### Run with input file and verbose

```bash
./prodstarter-cli run --input ./data.txt --metrics
./prodstarter-cli -v run
```

### Print effective configuration

```bash
# from env
INPUT_PATH=/tmp/data ./prodstarter-cli config
# use config file
./prodstarter-cli config config.env
```

## 6. Configuration & precedence

Configuration precedence (highest → lowest):

1. Command-line flags (per subcommand)
2. Config file provided on the command line
3. Environment variables
4. Built-in defaults

Example environment variables used by the template: `INPUT_PATH`, `VERBOSE`, `METRICS_ENABLED`.

## 7. Subcommands & extension points

The template follows a subcommand dispatch pattern. To add a new subcommand:

1. Create `src/commands/yourcmd.c` implementing `int cmd_yourcmd(int argc, char **argv, struct config *cfg)`.
2. Add declaration in `include/commands.h`.
3. Register the subcommand in `main.c` dispatch section.

Subcommands should:

* Parse their own flags using `getopt_long`.
* Validate configuration and fail fast with helpful errors.
* Respect global cancellation (`g_terminate`) and exit gracefully.

## 8. Logging, diagnostics & verbosity

* Use `-v` / `--verbose` to increase log verbosity; repeat `-v` for more verbose output (e.g., `-vv`).
* The logger writes to `stderr` and includes timestamps and levels. For automation, use `--json` mode (if added) to get machine-readable logs.
* Add `--dry-run` for operations that change state to allow safe testing.

## 9. Testing strategy (unit, integration, sanitizers)

### Unit tests

* Keep logic in small functions and test via a unit test framework (e.g., cmocka). Place tests under `test/unit`.

Example test run:

```bash
make test
```

### Integration tests

* Write integration tests that use temporary directories, fixtures under `test/fixtures`, and verify end-to-end behavior.

### Sanitizers & memory checks

* Run ASAN/UBSAN in CI and fix reported issues. Example local run:

```bash
# build with clang and ASAN
CC=clang CFLAGS="-fsanitize=address,undefined -g" make debug
./prodstarter-cli run
```

### Fuzzing

* Consider adding fuzz targets for parsers with AFL or libFuzzer for high-value parsing code (config, input formats).

## 10. Packaging & distribution

### Produce release tarball

```
make package    # creates dist/my-cli-${VERSION}-${OS}-${ARCH}.tar.gz
```

Tarball should include:

* The executable
* LICENSE
* USAGE.md
* checksums (SHA256) and optional GPG signature

### Native packages (optional)

Provide example `deb` and `rpm` packaging scripts or links to helper tools. For macOS consider a Homebrew formula.

### Container packaging (optional)

Create a minimal container image (Alpine or distroless) to run the CLI in CI or containerized environments. Run as a non-root user.

## 11. CI/CD recommendations (GitHub Actions example)

Recommended jobs:

* **lint** — `clang-format` / style checks
* **build** — build with `gcc` and `clang` across matrix
* **test** — run unit and integration tests
* **sanitizers** — build and run ASAN/UBSAN jobs
* **package** — build release artifacts and create GitHub Release with assets
* **sign & publish** — sign binaries and upload to releases or artifact registry

Example GitHub Actions snippet (high level):

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        compiler: [gcc, clang]
    steps:
      - uses: actions/checkout@v3
      - name: Install deps
        run: sudo apt-get update && sudo apt-get install -y build-essential
      - name: Build
        run: make build CC=${{ matrix.compiler }}
      - name: Test
        run: make test
```

## 12. Debugging & troubleshooting

* Reproduce crashes locally with sanitizer builds and run under `gdb` if needed.
* Use `-v` / `-vv` to increase verbosity and inspect behavior.
* For intermittent failures, collect core dumps (enable with `ulimit -c unlimited`) and analyze with `gdb`.
* For filesystem-related issues use `strace` or `dtruss` (macOS) to inspect syscalls.

## 13. Release checklist

Before tagging a production release:

* All CI checks green (build, tests, sanitizers)
* Packaging artifacts produced and checksums generated
* GPG-signed artifacts and uploaded to the release
* CHANGELOG updated and release notes written
* Security audit or dependency checks passed (if dependencies are used)

## 14. Next steps and extension ideas

* Add optional TOML/JSON/YAML config support (small parser libs) with clear opt-in.
* Provide a minimal C library layer so some logic is callable from other programs.
* Add telemetry hooks (OTLP/metrics) for long-running modes.
* Offer a TypeScript/Python wrapper for scripting complex automation flows that reuse the CLI core.
