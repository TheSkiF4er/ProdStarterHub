# PRODSTARTER.CPP.GRPC.SERVICE — TUTORIAL

This tutorial walks you through scaffolding, building, testing, running, packaging, and releasing the `cpp-grpc-service` template from **ProdStarterHub**. It focuses on production-grade practices: reproducible builds, TLS, health and metrics, graceful shutdown, testing (unit/integration/sanitizers), containerization and CI/CD.

> Audience: C++ engineers, SREs, and DevOps building high-quality gRPC services in C++.

---

## Table of contents

1. Prerequisites
2. Scaffold the template
3. Project layout overview
4. Dependency managers (vcpkg / conan) and toolchain
5. Build with CMake (configure, generate, build)
6. Generating gRPC / protobuf sources
7. Run the service locally (insecure & TLS)
8. Health, metrics and reflection usage
9. Testing: unit, integration, sanitizers and fuzzing
10. Debugging and profiling (gdb, pprof, heap)
11. Containerization & reproducible images
12. CI/CD pipeline recommendations (GitHub Actions example)
13. Packaging & release artifacts
14. Troubleshooting & common issues
15. Release checklist
16. Next steps & extensions

---

## 1. Prerequisites

* C++ toolchain: GCC or Clang supporting C++17 or later. Pin compiler versions in CI.
* CMake (>= 3.18 recommended).
* A dependency manager: `vcpkg` or `conan` (examples provided below).
* gRPC & Protobuf toolchain (protoc, grpc_cpp_plugin) installed via vcpkg/conan or system packages.
* Optional: `prometheus-cpp`, `spdlog` and `gtest` available through your package manager.
* Docker for container builds and testing.

---

## 2. Scaffold the template

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/service/cpp-grpc-service
cp -R . ~/projects/my-grpc-svc
cd ~/projects/my-grpc-svc
```

Adjust `template.json` replacements if you have templating tooling. Create a branch for your work:

```bash
git init
git checkout -b feature/initial
```

---

## 3. Project layout overview

```
proto/                       # your .proto definitions
src/
  main.cpp                   # server bootstrap and lifecycle
  service/                   # service implementations
  infra/                     # adapters: db, http, queue
  config/                    # typed config loading/parsing
  logging/                   # spdlog wrappers/enrichers
  metrics/                   # prometheus metric registration
include/                     # public headers
tests/
  unit/                      # gtest units
  integration/               # integration tests
CMakeLists.txt               # top-level build instructions
vcpkg.json | conanfile.txt   # pinned deps
Dockerfile
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Keep generated protobuf outputs under a build directory (e.g. `build/proto`) to avoid committing generated code.

---

## 4. Dependency managers and toolchain

### vcpkg (recommended)

1. Install vcpkg: [https://github.com/microsoft/vcpkg](https://github.com/microsoft/vcpkg)
2. Pin dependencies in `vcpkg.json`:

```json
{
  "name": "my-grpc-svc",
  "version": "1.0.0",
  "dependencies": [
    "grpc",
    "protobuf",
    "spdlog",
    "prometheus-cpp",
    "gtest"
  ]
}
```

3. Bootstrap and install: `./vcpkg/bootstrap-vcpkg.sh && ./vcpkg/vcpkg install --triplet x64-linux grpc protobuf spdlog prometheus-cpp gtest`

Use CMake toolchain file: `-DCMAKE_TOOLCHAIN_FILE=path/to/vcpkg.cmake`.

### Conan (alternative)

1. Create `conanfile.txt` or `conanfile.py` with pinned versions.
2. `conan install . -if build --build=missing` and pass `-DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake` to CMake.

---

## 5. Build with CMake

Create a build directory and configure with vcpkg or conan toolchain

```bash
mkdir -p build && cd build
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_TOOLCHAIN_FILE=../vcpkg/scripts/buildsystems/vcpkg.cmake ..
cmake --build . --config Release -j $(nproc)
```

Recommended flags for reproducibility:

* `-DCMAKE_CXX_FLAGS="-O2 -g -fno-ident -fdebug-prefix-map=$PWD=."`
* Embed build metadata with defines, e.g. `-DAPP_VERSION=\"1.0.0\" -DGIT_COMMIT=\"$(git rev-parse --short HEAD)\"`

---

## 6. Generating gRPC / protobuf sources

Keep `.proto` files in `proto/`. Example CMake snippet to generate sources (use `find_package(Protobuf)`, `find_package(gRPC)`):

```cmake
protobuf_generate_cpp(PROTO_SRCS PROTO_HDRS ${PROTO_FILES})
grpc_generate_cpp(GRPC_SRCS GRPC_HDRS ${PROTO_FILES})
add_library(proto_objs ${PROTO_SRCS} ${PROTO_HDRS} ${GRPC_SRCS} ${GRPC_HDRS})
```

Build will run `protoc` and `grpc_cpp_plugin` to produce `*_pb.cc` and `*_grpc.pb.cc` which you then link into your server.

---

## 7. Run the service locally

### Insecure (dev)

```bash
# after build
./bin/my-grpc-svc --bind 0.0.0.0:50051
```

### TLS (production dev test)

Generate a self-signed cert or use your CA, then run:

```bash
./bin/my-grpc-svc --bind 0.0.0.0:50051 --tls --cert cert.pem --key key.pem
```

Service logs will show bind address and enabled features. Use `grpcurl` or a generated client to exercise RPCs.

---

## 8. Health, metrics and reflection

* Health: gRPC health service is registered by default in the template. Check with `grpcurl`:

```bash
grpcurl -plaintext localhost:50051 grpc.health.v1.Health/Check
```

* Reflection: enabled for debugging. Use `grpc_cli` / `grpcurl` to introspect services when reflection is on.

* Prometheus metrics: if enabled, the template exposes metrics via a separate HTTP endpoint (default `:9090`). Scrape this from Prometheus.

---

## 9. Testing

### Unit tests (GoogleTest)

Create fast, pure-unit tests for service business logic. Example:

```bash
# from repo root
mkdir -p build && cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=... && cmake --build . --target runUnitTests
```

Keep unit tests hermetic and deterministic.

### Integration tests

Use Docker Compose or CI to start dependent services (DB, message broker) and run integration suites located under `tests/integration/`.

### Sanitizers

Run builds with AddressSanitizer (ASAN) and UndefinedBehaviorSanitizer (UBSAN) to detect memory and UB issues.

```bash
cmake -DCMAKE_BUILD_TYPE=RelWithDebInfo -DCMAKE_CXX_FLAGS="-fsanitize=address,undefined -fno-omit-frame-pointer" ..
cmake --build .
ctest -V
```

### Fuzzing

For parsers or untrusted inputs, add libFuzzer targets and integrate fuzzing in CI or dedicated fuzzing infra.

---

## 10. Debugging and profiling

* **gdb/lldb**: run `gdb --args ./bin/my-grpc-svc --bind ...` to capture crashes and backtraces.
* **perf / pprof**: use `perf` and stack samples for performance; instrument code with Prometheus Histograms for latency.
* **heap / memory**: use `valgrind` locally or ASAN in CI.

Enable `GOTRACEBACK`-like options for C++ by capturing full core dumps on crashes for post-mortem analysis.

---

## 11. Containerization & reproducible images

Use a multi-stage Dockerfile. Example pattern:

```Dockerfile
# builder
FROM ubuntu:22.04 AS builder
# install deps, vcpkg or conan, build
WORKDIR /workspace
COPY . .
# run build steps

# runtime
FROM gcr.io/distroless/cc
COPY --from=builder /workspace/bin/my-grpc-svc /usr/local/bin/my-grpc-svc
USER 65532:65532
ENTRYPOINT ["/usr/local/bin/my-grpc-svc"]
```

Security notes:

* Run as non-root user.
* Copy only the binary and minimal config into the final image.
* Scan images with `trivy` and produce an SBOM (e.g. using `syft`).

---

## 12. CI/CD pipeline recommendations

Suggested stages (GitHub Actions):

1. **Lint & format**: `clang-format` check and `clang-tidy`.
2. **Unit tests**: build and run unit tests.
3. **Sanitizers**: run a sanitizer-enabled build (ASAN/UBSAN) and tests.
4. **Integration**: run integration test stage using Docker Compose.
5. **Build artifacts**: produce release binaries for target platforms and create checksums.
6. **Container build & scan**: build images, scan with Trivy and emit SBOM.
7. **Release**: sign artifacts and publish to GitHub Releases or artifact registry.

Example GitHub Actions job snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install deps
        run: ./ci/install-deps.sh
      - name: Configure & build
        run: mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=Release .. && cmake --build . -- -j$(nproc)
      - name: Run unit tests
        run: ctest --output-on-failure
```

---

## 13. Packaging & release artifacts

Produce the following artifacts for release:

* Static or dynamic binary tarballs for supported OS/arch: `svc-<version>-linux-x86_64.tar.gz`.
* Docker images with immutable tags (e.g., `registry/org/svc:v1.2.3`).
* Checksums (SHA256) and optional GPG signatures.
* SBOM document (Syft) and vulnerability scan report (Trivy).

Attach these artifacts to a GitHub Release and update the `CHANGELOG.md`.

---

## 14. Troubleshooting & common issues

* **Port bind failures**: verify permissions and that the port is free. For low ports (<1024) run as non-root with capabilities or map to non-privileged host port.
* **TLS load errors**: confirm file permissions and formats (PEM). Use `openssl` to inspect cert/key.
* **Protobuf mismatch**: Ensure client and server share the same proto contract and code is regenerated after changes.
* **Heap corruption / crashes**: reproduce under ASAN/UBSAN; collect core dump and backtrace.

---

## 15. Release checklist

* [ ] CI green on all required checks (format, lint, unit, sanitizers, integration)
* [ ] Release binaries built for target platforms
* [ ] Docker images built and scanned; SBOM generated
* [ ] Checksums and (optional) GPG signatures created
* [ ] Documentation updated (README, ARCHITECTURE, USAGE, RUNBOOK)
* [ ] Post-release monitoring & alerting configured

---

## 16. Next steps & extension ideas

* Integrate OpenTelemetry native SDK and export traces to an OTLP collector.
* Publish Helm chart / Kubernetes manifests and a readiness/liveness probe tuning guide.
* Provide a lightweight management API (secure) for runtime diagnostics and graceful restart.
* Add E2E tests that run against a deployed test environment (k8s namespace) for full-stack validation.
