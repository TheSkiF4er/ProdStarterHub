# ProdStarter — Next.js SaaS (TypeScript)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Production-grade Next.js + TypeScript SaaS starter template. Opinionated defaults for hosting (Vercel / containers), multi-tenancy patterns, auth, billing/webhooks, background workers, Prisma ORM, Playwright E2E, observability (RUM + server metrics), and CI/CD.

---

## Contents

* Quickstart
* Key features
* Project layout
* Prerequisites
* Installation & first run
* Development workflow
* Configuration & environment
* Database & Prisma
* Authentication & multi-tenancy
* Background workers & queues
* Testing & Playwright E2E
* Build & deployment
* Docker & containerization
* Observability & monitoring
* CI/CD recommendations
* Contributing
* License

---

## Quickstart

```bash
# copy template
cp -R ProdStarterHub/templates/web/nextjs-saas-typescript ~/projects/my-saas
cd ~/projects/my-saas

# install dependencies (pnpm recommended)
pnpm install

# copy example env and configure local DB/Redis
cp .env.example .env.local

# generate prisma client (if scaffolded)
npx prisma generate

# run dev server
pnpm dev

# open http://localhost:3000
```

See `TUTORIAL.md` for a detailed developer & ops workflow.

---

## Key features

* Next.js App Router (or Pages) + TypeScript starter with production conventions.
* Optional Prisma ORM with migrations and a recommended DB schema.
* Background worker & queue scaffold (BullMQ) for async jobs.
* Playwright E2E scaffold and recommended CI integration.
* Opinionated security defaults (CSP, secure cookies), rate-limiting guidance.
* Observability hooks: server structured logs, metrics endpoint, RUM guidance.
* Template metadata (`template.json`) with customizable parameters (Prisma, Playwright, tRPC, workers).

---

## Project layout

```
app/ or pages/          # Next.js application routes (App Router recommended)
src/
  components/          # UI components
  ui/                  # design primitives and Tailwind shadcn style
  lib/                 # shared utilities and typed clients
  server/              # server-only helpers and services
  prisma/              # prisma schema and db client
  hooks/               # client hooks
  middleware/          # edge middleware
  styles/
public/                 # static assets
prisma/                 # schema and migrations
scripts/                # helpers (seed, migrations)
tests/                  # unit & integration tests
.e2e/                   # Playwright tests
next.config.js
package.json
pnpm-lock.yaml
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
template.json
```

Keep server-side logic out of client bundles: mark server-only files and use server components where possible.

---

## Prerequisites

* Node.js LTS (18 or 20). Pin exact Node version in CI and `engines` in `package.json`.
* pnpm / npm / yarn (lockfile committed for deterministic installs).
* PostgreSQL (recommended) or MySQL for production; SQLite for lightweight dev/test.
* Redis for queues and caching (optional but recommended).
* Docker (for local infra and CI).

Optional:

* Vercel account for edge-first deployments.
* APM / RUM provider (Sentry, Datadog) for observability.

---

## Installation & first run

1. Copy `.env.example` → `.env.local` and configure DB/Redis credentials.
2. Install dependencies: `pnpm install`.
3. Generate Prisma client (if included): `npx prisma generate` and run migrations `npx prisma migrate dev`.
4. Start dev server: `pnpm dev`.
5. (Optional) Start local Redis & Postgres via Docker Compose for full parity: `docker compose up -d`.

---

## Development workflow

* `pnpm dev` — start Next.js with fast refresh.
* `pnpm build` — production build (`next build`).
* `pnpm start` — start production server (`next start`).
* `pnpm lint` — ESLint checks.
* `pnpm type-check` — `tsc --noEmit`.
* `pnpm test` — run unit & integration tests.
* `pnpm e2e` — run Playwright E2E tests (requires staging or local server).

Use `pnpm` scripts and Makefile in CI to standardize commands.

---

## Configuration & environment

Configuration precedence: platform env vars → `.env` (local development) → defaults.

* Use `.env.local` for developer overrides and commit `.env.example` only.
* Validate config at startup with Zod schemas to fail-fast on missing values.
* Store secrets in a secrets manager for production (Vercel env, AWS Secrets Manager, Vault).

Important envs:

* `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_URL`, `NEXT_PUBLIC_*` for client-safe vars.

---

## Database & Prisma

If Prisma is scaffolded:

* `prisma/schema.prisma` holds DB schema.
* Run `npx prisma migrate dev --name init` during development and `npx prisma migrate deploy` in production.
* Use `npx prisma generate` prior to build to ensure generated client is available.

Production concerns:

* Use connection pooling (PgBouncer) when deploying serverless or high-concurrency environments.
* Backup strategy, migration rollback planning, and zero-downtime migration patterns are documented in `TUTORIAL.md`.

---

## Authentication & multi-tenancy

* Integrations: NextAuth, Clerk, or external OIDC providers are supported. Template includes example auth flows.
* Sessions: prefer secure, httpOnly cookies for browser sessions. For APIs consider scoped access tokens with revocation mechanisms.
* Multi-tenancy: sample middleware patterns for tenant resolution by subdomain or API key and tenant-scoped DB queries.

---

## Background workers & queues

* Optional BullMQ scaffold for queues. Workers run as separate processes and can be containerized.
* Provide idempotent job handlers and DLQ strategies for failed jobs.
* Scale workers independently from web processes.

---

## Testing & Playwright E2E

* Unit & integration: Jest / Vitest configured for type-safe tests.
* E2E: Playwright scaffold with example tests under `.e2e/`. CI runs Playwright against staging preview deploys.
* Capture traces and screenshots on failures, upload artifacts in CI for debugging.

---

## Build & deployment

### Vercel (recommended)

* Edge-first by default. Supports preview deployments per PR and ISR/SSG automatically.
* Use Vercel Environment Variables for secrets and set `NODE_VERSION` to match CI.

### Containerized deployments

* Multi-stage Dockerfile provided for building and running Next.js in Node runtime.
* Use CI to build container image, run `next build` in builder stage, and push to registry.

---

## Docker & containerization

Template includes an opinionated multi-stage Dockerfile:

* Builder stage: install deps, generate prisma client, run build.
* Runner stage: minimal Node image with only production deps and built assets.

Recommendations:

* Run as non-root user and set minimal file permissions.
* Pin base image digests in CI and scan images (Trivy) before publishing.

---

## Observability & monitoring

* Server logs: structured JSON with `service`, `env`, `trace_id`, `request_id`, and `tenant_id` where available.
* Metrics: expose a metrics endpoint (Prometheus-style) or push metrics to your monitoring provider.
* Traces: OpenTelemetry bootstrap included as optional. Propagate `traceparent` from client to server.
* RUM: capture client-side performance & errors (LCP, CLS, FID) and correlate with server traces.

---

## CI/CD recommendations

* PR validation: lint, type-check, unit tests, and bundle size checks.
* Merge pipeline: build, run integration tests, run Playwright E2E against staging preview, generate SBOM, run security scans.
* Release: tag version, build production image (if applicable), and deploy. Use preview deployments for PRs (Vercel) or ephemeral stacks.

---

## Contributing

Contributions welcome. Workflow:

1. Fork repository, create branch.
2. Run linters and tests locally.
3. Open PR with clear description and tests for new features/fixes.
4. Ensure CI passes and respond to review feedback.

Please follow code style and include unit tests for new functionality.

---

## License

This template is provided under the MIT License. See `LICENSE` for full text.
