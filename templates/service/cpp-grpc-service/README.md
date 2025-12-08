# ProdStarter — C++ gRPC Service

[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

> Production-ready C++ gRPC service template. Opinionated defaults for TLS, health, reflection, structured logging, optional Prometheus metrics, reproducible CMake/Bazel builds, testing and CI/CD.

---

## Contents

* Quickstart
* Highlights & features
* Project layout
* Prerequisites
* Build & run (CMake example)
* Configuration & precedence
* TLS & security
* Health, metrics & reflection
* Testing & quality gates
* Packaging & releases
* Docker & reproducible images
* CI/CD guidance
* Contributing
* License

---

## Quickstart

```bash
# copy template into your workspace
cp -R ProdStarterHub/templates/service/cpp-grpc-service ~/projects/my-grpc-svc
cd ~/projects/my-grpc-svc

# (vcpkg example)
./vcpkg/bootstrap-vcpkg.sh
./vcpkg/vcpkg install grpc protobuf spdlog prometheus-cpp gtest

# configure and build with CMake
mkdir -p build && cd build
cmake -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake ..
cmake --build . --config Release

# run (insecure, dev)
./bin/my-grpc-svc --bind 0.0.0.0:50051
```

See `TUTORIAL.md` for detailed developer workflows and production recommendations.

---

## Highlights & features

* gRPC server bootstrap with health check and optional reflection.
* Optional TLS support (server certificates and mTLS guidance).
* Structured logging via `spdlog` with environment-aware presets.
* Optional Prometheus metrics exposition scaffolding (`prometheus-cpp`).
* Graceful shutdown on `SIGINT`/`SIGTERM`, including health transitions to `NOT_SERVING`.
* CMake and Bazel friendly layout; examples for `vcpkg` and `conan` dependency management.
* Production-oriented docs: `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md` and `template.json`.

---

## Project layout

```
proto/                       # .proto service definitions
src/
  main.cpp                   # server bootstrap and lifecycle
  service/                   # handwritten service impls
  infra/                     # adapters (db, http, queue)
  config/                    # typed config loaders
  logging/                   # spdlog wrappers
  metrics/                   # prometheus registration
include/                     # public headers
tests/                       # unit & integration tests
CMakeLists.txt | BUILD       # build entrypoints
vcpkg.json | conanfile.txt   # pinned deps
Dockerfile
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json
```

---

## Prerequisites

* C++ toolchain: GCC or Clang with C++17 (or later) support. Pin versions in CI.
* CMake >= 3.18 (for modern generator expressions and toolchain support).
* vcpkg or conan for C/C++ dependency management (examples included).
* `protoc` and `grpc_cpp_plugin` provided by package manager or vcpkg/conan.
* Docker (optional) for image-based reproducible builds.

---

## Build & run (CMake + vcpkg example)

```bash
# install vcpkg deps (one-time)
./vcpkg/bootstrap-vcpkg.sh
./vcpkg/vcpkg install grpc protobuf spdlog prometheus-cpp gtest

# configure & build
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake ..
cmake --build . --config Release -j$(nproc)

# run server
./bin/my-grpc-svc --bind 0.0.0.0:50051
```

### Build-time metadata

Embed version, commit and build timestamp into the binary using `-D` defines during CMake configure (see `TUTORIAL.md`).

---

## Configuration & precedence

Configuration follows a clear precedence (highest → lowest):

1. CLI flags (e.g. `--bind`, `--config`, `--tls`, `--prometheus`)
2. Environment variables (e.g. `MYAPP_` prefix)
3. Config file provided via `--config` (YAML/JSON/TOML)
4. Built-in defaults

Sensitive values (private keys, DB passwords) should be injected via secrets (mounted files or secret manager), not committed to VCS.

---

## TLS & security

* TLS is supported via `--tls --cert <cert.pem> --key <key.pem>`. Validate file permissions and ownership.
* For mutual TLS (mTLS) see `ARCHITECTURE.md` for guidance on client cert validation and trust stores.
* Run final runtime images as non-root and scan images (Trivy) in CI.

---

## Health, metrics & reflection

* gRPC Health Check service is registered by default. Use it for readiness/liveness checks.
* Reflection is optional and enabled by default in the template for debugging (`grpc_cli`, `grpcurl`).
* Prometheus metrics (optional) can be exposed on a separate HTTP port; see `metrics/` for registration patterns.

---

## Testing & quality gates

* Unit tests with GoogleTest (gtest) are supported. Integration tests can be run in CI via Docker Compose or ephemeral containers.
* Run `clang-format`, `clang-tidy`, and sanitizers (ASAN/UBSAN) in CI.
* Include SBOM generation (Syft) and image scanning (Trivy) before releases.

---

## Packaging & releases

Produce the following artifacts for release:

* Versioned tarballs with binaries and docs (SHA256 checksums + optional GPG signatures).
* Docker images built with a multi-stage Dockerfile (builder → minimal runtime). Prefer distroless/scratch.
* SBOM and vulnerability reports attached to the release.

---

## CI/CD guidance

Suggested pipeline stages (GitHub Actions / GitLab):

1. Format & static checks (`clang-format`, `clang-tidy`).
2. Unit tests and sanitizers (ASAN/UBSAN).
3. Build artifacts for supported platforms.
4. Integration tests using containers.
5. Build and scan Docker images; publish artifacts to Releases & registry.

See `TUTORIAL.md` and `TASKS.md` for example workflows and checklists.

---

## Contributing

Contributions are welcome. Suggested flow:

1. Fork and create a feature branch.
2. Run formatters and tests locally: `clang-format`, `cmake --build`, `ctest`.
3. Open a PR with clear description and tests for changes.

Please follow the architecture docs and add tests for non-trivial logic.

---

## License

This template is provided under the Apache-2.0 License. See the `LICENSE` file for details.
