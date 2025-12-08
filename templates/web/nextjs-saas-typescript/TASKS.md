# PRODSTARTER.NEXTJS-SAAS-TYPESCRIPT — TASKS (Release Checklist)

An opinionated, practical checklist to prepare the `nextjs-saas-typescript` template for production. Use this file to create issues/PRs, assign owners, and verify readiness before tagging and publishing.

> Mark items ✅ when complete. Break large items into smaller PRs. Prefer automation and CI enforcement for repeatable checks.

---

## 0. How to use this file

1. Create a release branch (e.g. `release/v1.0.0`).
2. Convert checklist items into issues and PRs; reference checklist IDs in PR descriptions.
3. Run CI on every PR and ensure quality gates pass before merging.
4. When mandatory items are complete and CI is green, tag and publish a release.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — concise overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT/Apache-2.0/etc.).
* [ ] ✅ **.env.example** — document required environment variables and feature flags.
* [ ] ✅ **Repository layout** — `app/` or `pages/`, `src/`, `prisma/` (or DB folder), `public/`, `tests/`, docs and `template.json` present.
* [ ] ✅ **Supported runtimes** — document supported Node / Next.js versions and runtime choices (Edge / Node) in README.

## 2. Code quality & formatting

* [ ] ✅ **TypeScript strictness** — enable `strict` in `tsconfig.json` and address type errors.
* [ ] ✅ **ESLint & Prettier** — configure and enforce in CI. Add pre-commit hooks (lint-staged + husky).
* [ ] ✅ **Bundle size checks** — add CI check for client bundles and page size budgets (fail or warn on regressions).
* [ ] ✅ **Dependency pinning & SCA** — commit lockfile (`package-lock.json` / `pnpm-lock.yaml`) and add dependency scanning in CI.

## 3. Build & reproducibility

* [ ] ✅ **Deterministic builds** — pin Node version in CI and lock dependencies.
* [ ] ✅ **Next build verification** — add CI step to run `next build` and `next export` where appropriate.
* [ ] ✅ **Static asset processing** — ensure hashed asset output and CDN-ready build artifacts.
* [ ] ✅ ✅ **Build metadata** — embed build metadata (version, commit, buildTime) into the app for diagnostics.

## 4. Configuration & secrets

* [ ] ✅ **Centralized config loader** — use env-based config with schema validation (zod/joi) and fail-fast on invalid configs.
* [ ] ✅ **Secret management guidance** — document and integrate secrets in CI/CD (Vercel env vars, AWS Secrets Manager, Vault).
* [ ] ✅ **Feature flags** — add a feature-flagging integration or toggle system (local & remote modes).

## 5. Security & hardening

* [ ] ✅ **HTTPS & secure cookies** — enforce HTTPS, set `Secure`, `HttpOnly`, and `SameSite` on cookies.
* [ ] ✅ **CSP & headers** — ship Content-Security-Policy, HSTS, X-Frame-Options, and related headers via middleware or platform.
* [ ] ✅ **Rate limiting & WAF** — document and provide optional server-side / edge rate limiting; recommend WAF rules.
* [ ] ✅ **Input validation & sanitization** — validate API inputs (Zod) and sanitize outputs to avoid XSS.
* [ ] ✅ **Dependency checks** — run `npm audit` or SCA in CI and fix critical vulnerabilities.

## 6. Observability & diagnostics

* [ ] ✅ **Structured server logs** — emit JSON logs with `service`, `env`, `request_id`, `tenant_id`, `user_id` when available.
* [ ] ✅ **Client-side logging/rules** — capture RUM and client errors with tagging for release and user context (PII-safe).
* [ ] ✅ **Metrics** — collect server metrics: request rate, latency histograms, error counts, background job metrics.
* [ ] ✅ **Tracing** — add optional OpenTelemetry instrumentation for server routes and outgoing calls; propagate `traceparent`.
* [ ] ✅ **Correlation IDs** — generate and propagate `X-Request-Id` across front-end requests and backend services.

## 7. Data layer & migrations

* [ ] ✅ **ORM & migrations** — use Prisma/Drizzle and ensure migrations run in CI and are reversible where possible.
* [ ] ✅ **Connection pooling** — document pooling strategy for serverless vs container runtimes (PgBouncer, Data API patterns).
* [ ] ✅ **DB backups & restore** — document backup cadence and restore playbook.

## 8. API design & validation

* [ ] ✅ **Consistent error model** — return structured error responses and HTTP status mapping across route handlers.
* [ ] ✅ **Input validation** — validate all incoming data with Zod/validators and return helpful messages.
* [ ] ✅ **API contracts** — generate or maintain OpenAPI / TypeScript types for public APIs; consider contract tests.

## 9. Authentication & authorization

* [ ] ✅ **Auth provider integration** — configure NextAuth/Clerk/Auth0 or recommended identity provider with server-side session handling.
* [ ] ✅ **Secure session strategy** — prefer httpOnly cookies with server-session storage or signed short-lived tokens.
* [ ] ✅ **Role & permission model** — document RBAC/ABAC patterns and enforce checks in server services.

## 10. Multi-tenancy & tenancy isolation

* [ ] ✅ **Tenant resolution** — implement and test tenant resolution from subdomain, hostname or API key.
* [ ] ✅ **Data isolation pattern** — document and implement chosen tenancy model (shared schema with tenant_id, schema-per-tenant, DB-per-tenant).
* [ ] ✅ **Per-tenant limits & quotas** — implement throttles, rate limits and plan quotas at the tenant level.

## 11. Billing & webhooks

* [ ] ✅ **Stripe integration** — add webhook handlers with signature verification and idempotency safeguards.
* [ ] ✅ **Webhook DLQ & monitoring** — add retry/backoff and DLQ patterns for failed webhook processing.
* [ ] ✅ **Billing test flows** — include tests for subscription lifecycle and edge cases.

## 12. Background jobs & async processing

* [ ] ✅ **Queue & worker** — provide a queue implementation (BullMQ, Bee-Queue, or serverless alternatives) and worker scaffolding.
* [ ] ✅ **Idempotency & retries** — ensure jobs are idempotent and have retry/backoff strategies.
* [ ] ✅ **Monitoring** — expose queue depth and worker health metrics and alerts.

## 13. Caching & CDN

* [ ] ✅ **CDN configuration** — configure caching policy for static assets and HTML (ISR/SSG) and invalidation strategy.
* [ ] ✅ **Server-side cache** — implement Redis cache helpers and document cache key patterns and invalidation.
* [ ] ✅ **Stale-while-revalidate** — implement SWR/ISR patterns to keep UX fast while updating cached content.

## 14. Testing strategy

* [ ] ✅ **Unit tests** — Jest/Vitest for utilities, components and server functions.
* [ ] ✅ **Integration tests** — run route handler tests with a test DB (dockerized) and test API responses.
* [ ] ✅ **E2E tests** — Playwright for critical user flows; run in CI against staging.
* [ ] ✅ **Performance tests** — Lighthouse / synthetic tests for high-value pages.

## 15. CI/CD & release automation

* [ ] ✅ **CI pipeline** — lint, type-check, unit tests, bundle/build, integration tests and security scans.
* [ ] ✅ **Preview environments** — support preview deploys per PR (Vercel/GitHub Preview or ephemeral deployments).
* [ ] ✅ **Canary / gradual rollouts** — use feature flags and staged deploys; support instant rollback.
* [ ] ✅ **Migration strategy** — run DB migrations in a controlled release step; backup before applying destructive changes.

## 16. Hosting & runtime configuration

* [ ] ✅ **Edge vs Node decision** — document which routes run on Edge vs Node and enforce in routing strategy.
* [ ] ✅ **Serverless cold-starts** — instrument and document cold-start considerations; add warmers if needed.
* [ ] ✅ **Resource sizing** — define recommended instance sizes and autoscaling metrics.

## 17. Performance & cost control

* [ ] ✅ **Budget alerts** — add monitoring for cloud costs, bandwidth, and serverless invocation counts.
* [ ] ✅ **Cache aggressively** — reduce origin hits and DB load via CDN & caching strategies.
* [ ] ✅ **Optimize images & assets** — use modern formats, responsive images and an image CDN.

## 18. Observability & runbook

* [ ] ✅ **Dashboards & alerts** — define dashboards for error rates, latency p95/p99, queue depth, and billing spikes.
* [ ] ✅ **Incident runbook** — steps to collect traces, logs, and metrics and to rollback a deployment.
* [ ] ✅ **Post-release monitoring** — monitor SLOs for 48–72 hours after release.

## 19. Documentation & developer experience

* [ ] ✅ **USAGE / CONTRIBUTING docs** — quickstart for devs, how to run locally, and contributing guidelines.
* [ ] ✅ **API reference** — auto-generate or document public API endpoints and client usage.
* [ ] ✅ **Seed & demo data** — provide realistic seed data and scripts for dev onboarding.

## 20. Release checklist

* [ ] ✅ All CI checks pass (lint, type-check, tests, security scans).
* [ ] ✅ Artifacts built (Next build) and checked for bundle regressions.
* [ ] ✅ DB backups and migration plan ready.
* [ ] ✅ Preview/staging smoke tests passed.
* [ ] ✅ Release notes and changelog prepared.

## 21. Post-release & maintenance

* [ ] ✅ **Dependency refresh cadence** — schedule regular dependency upgrades and security reviews.
* [ ] ✅ **Runbook maintenance** — update runbooks after incident RCA.
* [ ] ✅ **Telemetry review** — review dashboards and tweak alerts after each release.

## 22. Optional enhancements (future)

* [ ] ✅ **TRPC integration** — type-safe RPC between client and server.
* [ ] ✅ **Multi-region deployments** — traffic steering and global DB strategies.
* [ ] ✅ **Offline PWA features** — selective offline-first UX for critical workflows.
* [ ] ✅ **Chaos testing** — introduce controlled chaos experiments to validate resilience.

---

## How to proceed

1. Create issues/PRs for each item and assign owners.
2. Use CI to enforce formatting, type-checks and tests.
3. When all mandatory items are complete and CI is green, tag the release and publish artifacts.
