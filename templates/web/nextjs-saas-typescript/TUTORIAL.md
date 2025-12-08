# PRODSTARTER.NEXTJS-SAAS-TYPESCRIPT — TUTORIAL

This tutorial walks you through scaffolding, developing, building, testing, deploying and operating the `nextjs-saas-typescript` template from **ProdStarterHub**. It focuses on production-ready practices: runtime choices (Edge vs Node), data and tenancy patterns, observability (server + RUM), security, CI/CD, and release ops for a SaaS product.

> Audience: frontend/back-end engineers, SREs and Platform teams building SaaS with Next.js + TypeScript.

---

## Table of contents

1. Prerequisites
2. Scaffold & initial setup
3. Project layout recap
4. Local development & developer DX
5. Configuration, secrets & environments
6. Type-safe contracts and DTOs
7. Data, ORMs and migrations
8. Authentication, sessions & authorization
9. Multi-tenancy onboarding patterns
10. Background jobs & workers
11. Build & production bundling
12. Hosting options & deployment
13. CI/CD pipeline recommendations
14. Observability: logs, metrics, tracing & RUM
15. Security checklist
16. Testing strategy and E2E with Playwright
17. Performance, caching & CDN strategies
18. Billing, webhooks & idempotency
19. Release checklist and runbook
20. Troubleshooting & common issues
21. Next steps & extensions

---

## 1. Prerequisites

* Node.js (LTS: 18 / 20). Pin exact version in CI and `engines` in `package.json`.
* pnpm / npm / yarn (use lockfile for reproducible installs).
* TypeScript and Next.js knowledge.
* PostgreSQL (or chosen RDBMS) and Redis for local dev (Docker recommended).
* An account on your hosting platform (Vercel, AWS, GCP, or self-hosted k8s) and credentials for CI.

Optional but recommended:

* Prisma (or preferred ORM) installed and `prisma` CLI available.
* Playwright for E2E.
* An APM (Sentry, Datadog) and Prometheus-compatible metrics backend.

## 2. Scaffold & initial setup

1. Copy the template into your workspace and rename:

```bash
cp -R ProdStarterHub/templates/web/nextjs-saas-typescript ~/projects/my-saas
cd ~/projects/my-saas
```

2. Install dependencies and create a working `.env`:

```bash
# preferred package manager
pnpm install
cp .env.example .env.local
```

3. Set DB and Redis connection strings in `.env.local` for local dev. If you use Docker, run `docker compose up -d`.

4. Initialize Prisma (if using Prisma) and generate types:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Start dev server with fast refresh:

```bash
pnpm dev
# or
npm run dev
```

Open `http://localhost:3000` and confirm the app boots and `/api/health` responds.

## 3. Project layout recap

Reference `ARCHITECTURE.md` but quick reminder:

```
app/ or pages/        # Next.js routes (App Router recommended)
src/
  components/         # UI components
  ui/                 # design primitives
  lib/                 # shared utilities (client + server separation)
  server/              # server-only helpers, services
  prisma/              # prisma schema & db client
  hooks/               # client hooks
  middleware/          # edge middleware
  styles/
public/
prisma/
tests/                # unit & integration tests
scripts/              # db, seed, data helpers
```

Keep server-only code under `src/server` or mark with `"use server"` to avoid bundling into client.

## 4. Local development & developer DX

* Use Docker Compose to run Postgres and Redis for parity:

```bash
docker compose up -d db redis
```

* Use seed scripts to populate demo tenant data:

```bash
pnpm prisma db seed
```

* Fast iteration workflow:

  * `pnpm dev` — Next.js fast refresh.
  * `pnpm lint` — ESLint checks.
  * `pnpm type-check` — `tsc --noEmit`.
  * `pnpm test:unit` — run unit tests.

* Provide VS Code launch config for debugging server-side code and Playwright tests.

## 5. Configuration, secrets & environments

Use the following precedence: Environment vars (platform) → `.env` for local dev → defaults in code.

Recommendations:

* Keep `.env.local` for developer overrides and `.env.example` in repo.
* Use a secrets manager in production (Vercel Env, AWS Secrets Manager, Vault). Inject via CI.
* Store feature flags and runtime toggles in a provider (LaunchDarkly, Unleash) or a lightweight DB table for early stages.

Validate config at boot with a schema (Zod) to fail-fast on missing values.

## 6. Type-safe contracts and DTOs

* Use Zod to validate inputs and infer TypeScript types:

```ts
const createUserSchema = z.object({ email: z.string().email(), name: z.string().min(1) });
```

* Generate client types from the server (or use TRPC) so frontend and backend share DTOs. If using REST, generate OpenAPI or tRPC-like typed clients.

* Keep API surface small and versioned (e.g., `/api/v1/...`).

## 7. Data, ORMs and migrations

* Use Prisma (or Drizzle) for type-safe DB access. Ensure `prisma generate` is part of build.
* Keep migrations under `prisma/migrations` and run them in CI/CD as a controlled step.
* For serverless or ephemeral connections, use connection pooling (PgBouncer) or a serverless-friendly DB like Neon.

Migrations in CI:

* Run migrations in a pre-deploy step with backups for production.
* Use feature-flagged rollout for schema changes that require code + migration coordination.

## 8. Authentication, sessions & authorization

* For SaaS use cases prefer hosted auth (Auth0/Clerk) or NextAuth for quick start.
* Use secure, httpOnly cookies for sessions with short TTL and rotate secrets.
* For APIs, prefer cookie-based sessions for browser clients and JWTs for third-party API clients (with revocation strategy).

Authorization:

* Implement service-level guards and policy checks (ownership, tenant scoping).
* Avoid relying on client-provided tenant identifiers; derive tenant from authenticated session or API key.

## 9. Multi-tenancy onboarding patterns

Choose pattern based on isolation needs:

* Shared DB + tenant_id (simple, cost-efficient). Add `tenant_id` to queries and use middleware to set tenant context.
* Schema-per-tenant or DB-per-tenant for stricter isolation.

Onboarding flow:

1. Sign up (collect billing details).
2. Create tenant record and seed tenant-specific data.
3. Provision default roles and invite administrators.

Store tenant metadata and quotas for rate limiting and billing integration.

## 10. Background jobs & workers

* Use a queue (BullMQ, Bee-Queue, or serverless queue) and separate worker processes.
* Implement idempotent workers and monitor queue depth.
* Recommended pattern: enqueue side-effecting work (emails, billing reconciliation, thumbnails) and process in worker pool.

Local worker run:

```bash
pnpm run worker
```

CI and deploy:

* Build worker as a separate image or process and scale independently.

## 11. Build & production bundling

* Use `next build` and verify serverless vs node build output. Ensure `prisma generate` runs before `next build`.
* Embed build metadata in the app (version, commit, build time) using env vars during build.
* For containerized deployments, use multi-stage Docker builds. For Vercel/edge, rely on their build pipeline.

Example production build steps:

```bash
pnpm build
pnpm export # if doing static export for certain pages
```

## 12. Hosting options & deployment

Common patterns:

* **Vercel:** best for Next.js App Router and Edge functions. Use Vercel Preview for PRs. Handles ISR, Edge caching and Image CDN.
* **Cloud Run / ECS / Kubernetes:** run server Node.js instances with CDN in front. Requires manual handling of ISR and caching.
* **Serverless containers / Lambda:** feasible for small teams but requires DB pooling strategies.

Deploy considerations:

* Use immutable tags and promotion across environments (dev → staging → prod).
* Keep infra as code (Terraform / Pulumi) and manage environment variables centrally.

## 13. CI/CD pipeline recommendations

Suggested pipeline:

1. Install & cache node modules.
2. Lint & type-check (`eslint`, `tsc --noEmit`).
3. Unit tests.
4. Build (`next build`) and run `next export` if static pages required.
5. Run Playwright E2E on a staging deploy.
6. Publish images or trigger platform deploy.

Secrets in CI:

* Store production secrets in CI provider or secret manager; never echo in logs.
* Use signed deploy keys and limited-permission tokens for registry pushes.

## 14. Observability: logs, metrics, tracing & RUM

Server-side:

* Structured logs (JSON) with fields: `service`, `env`, `version`, `trace_id`, `request_id`, `tenant_id`.
* Expose Prometheus-like metrics via a metrics endpoint (or push to your monitoring).
* Integrate OpenTelemetry for traces across edge → server → worker.

Client-side (RUM):

* Capture performance (LCP, FID, CLS), errors and slow page traces. Send to Sentry/Datadog RUM.
* Correlate RUM events with server traces using `traceparent` and `request_id` passed in headers.

Alerts:

* Error rate increases, latency p95/p99, queue depth and billing spikes.

## 15. Security checklist

* Enforce HTTPS everywhere and use secure cookies.
* Set CSP, HSTS, X-Frame-Options and other security headers in middleware or at CDN.
* Validate and sanitize inputs (Zod).
* Protect webhooks with signatures and idempotency tokens.
* Run dependency SCA and fix critical CVEs in CI.
* Limit exposure of serverless functions and use least-privilege IAM roles.

## 16. Testing strategy and E2E with Playwright

* Unit tests for utilities and hooks with Jest/Vitest.
* Integration tests for API route handlers using a test DB.
* Playwright E2E for critical flows: signup, login, billing, webhook handling.

Playwright CI:

* Deploy to a staging environment and run Playwright against the live staging URL.
* Use headless browsers and capture traces/videos on failure.

## 17. Performance, caching & CDN strategies

* Cache static assets and pre-rendered HTML at the CDN. Use ISR for pages that can be cached with revalidate time.
* For user-specific pages, render server-side but use partial caching and edge personalization when possible.
* Use Redis for application caching and session store. Implement cache key conventions and TTLs.
* Optimize images (AVIF/WebP) and use responsive `next/image` with an image CDN.

## 18. Billing, webhooks & idempotency

* Integrate Stripe for billing; implement idempotent webhook handlers and persist events to avoid double-processing.
* Store minimal billing metadata for entitlement checks and handle subscription lifecycle events asynchronously.
* Provide admin tools for manual invoice reattempts and webhook replay for debugging.

## 19. Release checklist and runbook

Before releasing:

* [ ] All CI checks pass (lint, tests, type-check).
* [ ] Build artifacts created and verified.
* [ ] Staging deploy smoke tests (Playwright) pass.
* [ ] Backups in place for DB migrations.

Runbook for release:

1. Tag and create release.
2. Run migration job (pre-deploy).
3. Deploy and run smoke tests.
4. Monitor dashboards for 30–60 minutes.
5. Promote release to production if stable.

## 20. Troubleshooting & common issues

* **Cold starts or connection errors**: ensure DB pooling (PgBouncer) or serverful deployment for high throughput.
* **Migrations fail**: restore backup and run migration in a safe window; consider backfilling in separate jobs.
* **Webhook failures**: check signature verification and DLQ processing.
* **High latency**: inspect traces, CPU/memory, and CDN cache hit ratio.

## 21. Next steps & extensions

* Add TRPC for type-safe client/server RPC.
* Implement advanced multi-region support and data residency.
* Build a developer CLI to scaffold tenants and seed demo data.
* Add observability dashboards and synthetic monitors.
