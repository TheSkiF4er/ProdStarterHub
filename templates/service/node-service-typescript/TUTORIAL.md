# PRODSTARTER.NODE-SERVICE-TYPESCRIPT — TUTORIAL

This tutorial guides you through scaffolding, building, testing, running, packaging, and releasing the `node-service-typescript` template from **ProdStarterHub**. It focuses on production-ready practices: reproducible builds, configuration, structured logging, metrics, graceful shutdown, testing, containerization, and CI/CD.

> Audience: Node.js/TypeScript backend engineers, DevOps and SREs deploying production HTTP services.

---

## Table of contents

1. Prerequisites
2. Scaffold the template and initial setup
3. Project layout overview
4. Install dependencies and developer workflow
5. Local development & debugging
6. Configuration and environment variables
7. Build and production bundle (esbuild / tsc)
8. Run the service (dev and production)
9. Observability: logs, metrics, tracing
10. Testing strategy (unit, integration, e2e)
11. Containerization & reproducible Docker images
12. CI/CD pipeline recommendations (GitHub Actions example)
13. Packaging & release artifacts
14. Troubleshooting & common issues
15. Release checklist
16. Next steps & extensions

---

## 1. Prerequisites

* Node.js (LTS recommended, e.g. 18.x or 20.x). Pin exact version in CI and in `engines` in `package.json`.
* npm (or pnpm/yarn) and a package lock file (`package-lock.json` or `pnpm-lock.yaml`).
* TypeScript (local dev dependency).
* Docker (for reproducible builds and image scanning).
* Optional: `esbuild` for fast production bundling, `pnpm` for deterministic installs.

## 2. Scaffold the template and initial setup

```bash
git clone https://github.com/TheSkiF4er/ProdStarterHub.git
cd ProdStarterHub/templates/service/node-service-typescript
cp -R . ~/projects/my-node-service
cd ~/projects/my-node-service
```

Initialize module if template doesn't include `package.json` replacements:

```bash
npm init -y
# or: pnpm init
```

Edit `package.json` fields (`name`, `version`, `repository`, `author`) and set `engines.node` to the pinned Node version.

## 3. Project layout overview

```
src/
  index.ts            # Express app & exported start/stop helpers
  server.ts           # optional server bootstrap
  api/                # route handlers and controllers
  services/           # business logic
  infra/              # adapters (db, cache, clients)
  middleware/         # auth, validation, logging
  config/             # config loader & schema (zod/joi)
  logging/            # pino setup and helpers
  metrics/            # prom-client registrations
tests/
Dockerfile
Makefile
package.json
tsconfig.json
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Design principle: export the Express `app` and `start`/`stop` functions from `src/index.ts` so tests can spin the server without forking a new process.

## 4. Install dependencies and developer workflow

Install production and dev dependencies (example):

```bash
npm install express helmet compression cors pino pino-http prom-client dotenv express-rate-limit
npm install -D typescript ts-node @types/express @types/node eslint prettier jest ts-jest @types/jest esbuild
```

Scripts suggested in `package.json`:

```json
{
  "scripts": {
    "build": "tsc && node -r dotenv/config dist/index.js",
    "bundle": "esbuild src/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:express",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start": "node dist/index.js",
    "lint": "eslint 'src/**/*.ts'",
    "format": "prettier --write .",
    "test": "jest --runInBand",
    "type-check": "tsc --noEmit"
  }
}
```

Use `npm run dev` for local fast feedback and `npm run build` / `npm run start` for production.

## 5. Local development & debugging

* Use `ts-node-dev` or `nodemon` for fast reloads in development.
* Attach debugger via your IDE (VS Code launch configuration pointing at `ts-node` or the compiled `dist/index.js`).
* Export `app` for unit tests so test runner can call routes directly with `supertest` without network overhead.

Example debug script for VS Code uses `"program": "${workspaceFolder}/node_modules/.bin/ts-node"`.

## 6. Configuration and environment variables

Follow 12-factor app principles. Preference order:

1. Environment variables (production secrets)
2. Config file passed via `--config` or `.env` (for development only)
3. Defaults in code

Common environment variables the template uses:

* `PORT`, `HOST` — server binding
* `METRICS_PORT`, `ENABLE_METRICS` — metrics configuration
* `LOG_LEVEL`, `NODE_ENV` — environment & log level
* `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX` — rate limiter
* `SHUTDOWN_TIMEOUT_MS` — graceful shutdown timeout

Use a schema validator (e.g., `zod` or `joi`) in `src/config` to coerce types and fail fast on invalid config.

## 7. Build and production bundle (esbuild / tsc)

Two common production build approaches:

### A. TypeScript compile (tsc)

* Run `tsc` to emit `dist/` and run `node dist/index.js`.
* Pros: simple, deterministic.
* Cons: larger runtime dependency tree if not bundled.

### B. Bundle with esbuild

* Use esbuild to produce a single bundle `dist/index.js`. Example:

```bash
esbuild src/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --external:some-native-module
```

* Pros: faster startup, easier artifact distribution.
* Cons: need to handle native modules and external files carefully.

Ensure you include `--external` or `--inject` for native modules (e.g., database drivers) if required.

## 8. Run the service (dev and production)

### Development

```bash
npm run dev
# or
node --inspect-brk -r ts-node/register src/index.ts
```

### Production

Build and run:

```bash
npm run build
npm run start
```

Or run the bundled file:

```bash
npm run bundle
node dist/index.js
```

Check `/healthz`, `/readyz`, and `/api/v1/ping` to verify the service.

## 9. Observability: logs, metrics, tracing

### Logging (pino)

* Use `pino` for structured JSON logs. Set `LOG_LEVEL` and pretty-print in development only.
* Include consistent fields: `service`, `version`, `env`, `request_id`, and optionally `trace_id`.

### Metrics (prom-client)

* Collect default process metrics and application metrics (counters and histograms for HTTP requests).
* Expose metrics on `/metrics` or a separate port for security.

### Tracing (OpenTelemetry)

* Offer optional OTLP exporter initialization. Keep disabled by default and configurable via env vars.
* Correlate logs and traces by including `trace_id` in log lines.

## 10. Testing strategy (unit, integration, e2e)

### Unit tests

* Use Jest or Vitest. Mock infra adapters and test business logic in `services/`.
* Keep tests fast (`--runInBand` in CI if needed).

### Integration tests

* Use `supertest` against the exported `app` (no network), or spin up Dockerized dependencies (Postgres, Redis) for full flow tests.

### End-to-end / Smoke tests

* After building image/artifact, run the container and execute smoke tests that call health and critical endpoints.

Example test command:

```bash
npm run test
npm run type-check
```

## 11. Containerization & reproducible Docker images

Use a multi-stage Dockerfile pattern:

```Dockerfile
# builder
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# runtime
FROM node:18-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --omit=dev
USER node
CMD ["node", "dist/index.js"]
```

Recommendations:

* Use a non-root user in the final image.
* Use `npm ci --omit=dev` to avoid dev deps in production image.
* Pin base image digests in CI and scan final images with Trivy.
* Generate SBOM using `syft` and attach to CI artifacts.

## 12. CI/CD pipeline recommendations (GitHub Actions example)

Suggested jobs:

1. **PR checks** — install dependencies, lint, type-check, unit tests.
2. **Build** — produce production bundle (`esbuild` or `tsc`) and artifacts.
3. **Integration** — run integration tests with Docker Compose.
4. **Image build & scan** — build Docker image, run Trivy, generate SBOM.
5. **Release** — on tag, push image to registry, upload artifacts to GitHub Releases.

Example workflow snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run bundle
```

## 13. Packaging & release artifacts

Release artifacts to produce:

* Bundled JS file or `dist/` tarball with `package.json` and `LICENSE`.
* Docker image with immutable tag, and manifest for multi-arch if needed.
* SHA256 checksums and optional GPG signatures.
* SBOM for the image and JS packages.

Attach artifacts to a GitHub Release and include a detailed changelog.

## 14. Troubleshooting & common issues

* **Service won’t start**: check environment variables and required secrets; run `node dist/index.js` with `DEBUG` or `LOG_LEVEL=debug`.
* **Port already in use**: ensure correct `PORT` and that previous process terminated.
* **Type errors in CI**: run `npm run type-check` locally and fix TypeScript types; ensure `tsconfig.json` is strict.
* **Native module errors**: if using native DB drivers, ensure the runtime image has needed native libraries or bundle with `--platform=node` carefully.

## 15. Release checklist

* [ ] CI green for lint, tests, type-check and security scans.
* [ ] Bundle built and tested (`npm run bundle`).
* [ ] Docker image built, scanned and SBOM generated.
* [ ] Artifacts (bundle, checksums) uploaded to release.
* [ ] Documentation updated (README, ARCHITECTURE, TUTORIAL, TASKS).
* [ ] Post-release monitoring & alerting active for 48–72 hours.

## 16. Next steps & extensions

* Add OpenTelemetry instrumentation and an OTLP collector in staging environments.
* Generate OpenAPI spec and publish developer documentation; consider generating client SDKs.
* Add feature flags for controlled rollouts and A/B testing.
* Provide Helm chart or k8s manifests for deployment with sensible resource requests and probes.
