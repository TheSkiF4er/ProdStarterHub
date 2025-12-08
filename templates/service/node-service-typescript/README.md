# ProdStarter — Node TypeScript REST Service

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Production-ready Node.js + TypeScript REST service template. Opinionated defaults for configuration, structured logging, Prometheus metrics, graceful shutdown, testing and reproducible builds.

---

## Contents

* Quickstart
* Highlights & features
* Project layout
* Prerequisites
* Build & run
* Configuration & precedence
* HTTP endpoints & examples
* Logging, metrics & health
* Testing & quality gates
* Packaging & Docker
* CI/CD recommendations
* Contributing
* License

---

## Quickstart

```bash
# copy template
cp -R ProdStarterHub/templates/service/node-service-typescript ~/projects/my-node-service
cd ~/projects/my-node-service

# install deps (npm/pnpm/yarn)
npm ci

# development
npm run dev

# build for production
npm run build
npm start

# check endpoints
curl http://localhost:3000/healthz
curl http://localhost:3000/api/v1/ping
```

See `TUTORIAL.md` for an in-depth developer workflow and production recommendations.

---

## Highlights & features

* Express + TypeScript starter with clear separation of concerns.
* Structured logging (Pino) with request-aware logging.
* Optional Prometheus metrics (`prom-client`) served separately.
* Security middlewares: `helmet`, `compression`, `cors`, and rate limiting.
* Graceful startup/shutdown, readiness gating, and health probes.
* Exported `start()` / `stop()` and `app` for easy unit testing.
* Template metadata (`template.json`) and docs: `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.

---

## Project layout

```
src/
  index.ts            # app exports, start/stop helpers
  api/                # route handlers and controllers
  services/           # business logic
  infra/              # adapters (db, cache, clients)
  middleware/         # auth, validation, logging, rate limit
  config/             # config loader and schema
  logging/            # pino init and helpers
  metrics/            # prom-client registrations
tests/                # unit & integration tests
package.json
tsconfig.json
Dockerfile
Makefile
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Keep application logic inside `services/` and use `api/` only for transport concerns.

---

## Prerequisites

* Node.js LTS (18 or 20 recommended). Pin exact version in CI.
* npm, pnpm, or yarn.
* Docker (optional) for reproducible builds and image scanning.
* Optional dev tools: `esbuild`, `typescript`, `jest`/`vitest`, `eslint`, `prettier`.

---

## Build & run

### Development

```bash
npm run dev
# runs ts-node-dev or nodemon for fast reloads
```

### Production

```bash
npm run build   # tsc or bundler (esbuild)
npm start       # runs compiled JS in dist/
```

Build-time metadata (version, commit, build time) should be injected via environment variables or CI using `-D` or build scripts and exposed via `/api/v1/ping` or a `version` endpoint.

---

## Configuration & precedence

Configuration precedence (highest → lowest):

1. Environment variables (12-factor).
2. Config file passed via `--config` or `.env` for local dev.
3. Defaults in code.

Important env vars: `PORT`, `HOST`, `NODE_ENV`, `LOG_LEVEL`, `ENABLE_METRICS`, `METRICS_PORT`, `RATE_LIMIT_MAX`, `SHUTDOWN_TIMEOUT_MS`.

Use a schema validator (e.g. `zod` or `joi`) for robust startup validation.

---

## HTTP endpoints & examples

* `GET /healthz` — liveness.
* `GET /readyz` — readiness (returns 503 if not ready).
* `GET /api/v1/ping` — example ping endpoint: `{ "message": "pong" }`.

Add routes under `src/api` and keep handlers thin — delegate to `services/`.

---

## Logging, metrics & health

* **Logging:** Pino for structured JSON logs. Development mode uses pretty-print. Include `service`, `version`, `env`, `request_id` fields.
* **Metrics:** `prom-client` collects default process metrics and application metrics. Serve `/metrics` on `METRICS_PORT` or behind an internal endpoint.
* **Tracing:** optional OpenTelemetry bootstrap; correlate logs and traces by including `trace_id` in logs.

---

## Testing & quality gates

* Unit tests: Jest or Vitest recommended. Export `app` for `supertest` based tests.
* Integration tests: run against ephemeral infra using Docker Compose or Testcontainers.
* Linters & formatters: ESLint + Prettier.
* Type checks: `tsc --noEmit` in CI.

Run `npm run lint`, `npm run type-check`, and `npm test` in CI.

---

## Packaging & Docker

Use a multi-stage Dockerfile to produce minimal runtime images:

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

Recommendations: run as non-root, pin base image digests in CI, scan images with Trivy and produce SBOM (Syft).

---

## CI/CD recommendations

Suggested pipeline (GitHub Actions / GitLab):

1. Format & lint: `gofmt` equivalent -> `eslint`, `prettier`.
2. Type-check (`tsc --noEmit`).
3. Unit tests and coverage.
4. Integration tests (on merge).
5. Build artifacts and Docker images.
6. Image scanning (Trivy), SBOM generation, and release.

Fail builds on linter/type failures or critical vulnerabilities.

---

## Contributing

Contributions welcome. Workflow:

1. Fork and create a branch.
2. Run formatters and tests locally.
3. Open a PR with a clear description and tests for new behavior.
4. Ensure CI passes and address review comments.

Please follow the architecture and testing guidelines.

---

## License

This template is provided under the MIT License. See `LICENSE` for details.
