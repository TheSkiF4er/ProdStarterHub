# PRODSTARTER.NEXTJS-SAAS-TYPESCRIPT — ARCHITECTURE

> Production-ready architecture guide for the `nextjs-saas-typescript` template. This document defines design goals, recommended project structure, runtime/hosting options, data and auth patterns, multi-tenant considerations, observability, security, testing, performance, and operational guidance for building a modern SaaS product with Next.js and TypeScript.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Hosting and runtime options
5. Project layout and conventions
6. Data layer, persistence & migrations
7. API surface: App Router, API routes & Edge functions
8. Authentication, authorization & identity
9. Multi-tenancy patterns
10. Billing, subscriptions & webhooks
11. Caching, CDN & performance (SSR/ISR/SSG)
12. Background jobs & asynchronous processing
13. Observability: logging, metrics, tracing & RUM
14. Security hardening
15. Testing strategy
16. CI/CD & release process
17. Monitoring, SLOs & incident runbook
18. Scaling & operational concerns
19. Local developer experience & DX
20. Extending the template
21. References

---

## 1. Purpose & goals

This template targets teams building SaaS products with Next.js and TypeScript. It is opinionated toward:

* Reliability and predictable deployments across edge and node runtimes.
* Clear separation between frontend (pages/app), server logic (edge/node API), and backend services (DB, queues).
* Strong security defaults and privacy-compliant data handling.
* Observability for frontend and backend (RUM + server metrics + traces).
* Developer productivity with type-safe contracts and test scaffolding.

## 2. Non-functional requirements

* **Availability:** 99.9%+ target; use CDNs and replicated backends.
* **Latency:** sub-200ms TTFB for cached pages; p95 targets for API endpoints.
* **Scalability:** autoscale for bursty traffic using serverless/containers.
* **Security & Compliance:** HTTPS everywhere, secure cookie practices, GDPR/CCPA readiness.
* **Observability:** distributed traces, server metrics and real-user monitoring (RUM).

## 3. High-level architecture

```
Users (browser/mobile)
  ├─ CDN / Edge Cache (static assets & cached HTML)
  ├─ Edge Functions (auth, redirects, A/B, personalization)
  └─ Next.js server (Edge or Node) -> App Router / API Routes
        ├─ Business services (metering, feature flags)
        ├─ Data stores (Postgres / CockroachDB)
        ├─ Cache (Redis / Managed cache)
        └─ Background workers (serverless functions / container workers)

Third-party: Auth provider (Auth0/Okta), Payments (Stripe), Email (SES/SendGrid), Analytics
```

Design notes:

* Use the CDN for static assets and HTML caching (ISR/SSG).
* Keep personalization and auth checks at the edge when safe to reduce latency.
* Centralize heavy compute and third-party integrations in backend services.

## 4. Hosting and runtime options

**Vercel (recommended for Next.js):** edge-first experience, automatic optimizations, Image CDN, Edge Functions, seamless ISR support.

**Cloud Providers (AWS/GCP/Azure):** run Next.js on Cloud Run, App Engine, ECS/Fargate or Kubernetes. Use a managed CDN (CloudFront, Cloud CDN).

**Self-hosted / Kubernetes:** containerized Next.js server behind an ingress + CDN. Requires manual configuration for ISR and caching.

When to choose which:

* Small teams or early-stage SaaS: Vercel for speed of iteration.
* Large-scale, compliance or custom infra needs: Cloud provider or Kubernetes for control.

## 5. Project layout and conventions

Opinionated layout (App Router preferred; fallback to Pages Router if needed):

```
/ (root)
  app/                   # Next.js App Router pages & server components
  pages/                 # optional - classic pages API (for API routes if used)
  src/
    components/          # shared React components
    ui/                  # design-system primitives (Tailwind/shadcn)
    lib/                 # client/server utilities & typed clients
    services/            # server-side business logic (moved to backend services when needed)
    hooks/               # React hooks
    styles/              # global styles & theme
    middleware/          # Next.js middleware (edge)
    pages/api/           # API Routes (if using Pages Router)
  prisma/                # prisma schema & migrations (or db folder for other ORMs)
  scripts/               # build, migrations, deploy helpers
  public/                # static assets
  tests/                 # unit, integration, e2e (Playwright)
  .env.example
  next.config.js
  tsconfig.json
  package.json
```

Conventions:

* Keep server-only code under `src/server` or `lib/server` and mark it out of client bundles.
* Use `prisma` or `drizzle` with generated TypeScript types for DB contracts.
* Prefer React Server Components for data fetching on server-side where supported.

## 6. Data layer, persistence & migrations

Recommended primary stores:

* **Relational DB:** PostgreSQL (managed: RDS, Cloud SQL, Neon, Supabase) or CockroachDB for global workloads.
* **Cache / Session:** Redis (managed like Elasticache / MemoryDB / Upstash for edge-friendly usage).
* **Blob Storage:** S3-compatible storage for uploads and public assets.

ORM / Schema & Migrations:

* Use **Prisma** or **Drizzle** for type-safe DB access and migrations. Check production readiness and connection pooling (PgBouncer, Data API) when using serverless.
* Keep migrations versioned and run them in CI/CD as a controlled step. Use branching-safe migration practices.

Secrets & connection strings:

* Store secrets in environment variables or a secret manager (e.g., AWS Secrets Manager, Vault, Vercel Environment Variables). Do not commit secrets.

## 7. API surface: App Router, API routes & Edge functions

* **App Router (Server Components / Route Handlers):** prefer server route handlers and server components for performance and type safety.
* **API Routes:** use for simple endpoints; move heavy integrations to backend services for observability and reliability.
* **Edge Functions / Middleware:** use for fast auth checks, A/B logic, redirects, and header manipulation; avoid heavy CPU or long-running tasks at the edge.

Design rules:

* Keep API route handlers thin; delegate to typed service functions.
* Enforce input validation with Zod or similar and return consistent error shapes.
* Return caching headers appropriate for the route and user context.

## 8. Authentication, authorization & identity

Common approaches:

* **Hosted identity (recommended):** Auth0, Clerk, or NextAuth with OAuth/OIDC for SSO. Offloads complexity for SSO, MFA, and identity providers.
* **Custom auth:** JWT-backed sessions with httpOnly cookies; ensure token rotation and revocation strategies.

Session strategies:

* **Cookie-based sessions:** secure, httpOnly cookies. Use encrypted session stores or signed JWTs with short TTLs.
* **Stateless JWTs:** use only if you have a clear revocation strategy and short TTLs.

Authorization:

* Implement RBAC or ABAC at the service layer. Do not rely solely on client-side checks. Use feature flags and scope-based tokens for fine-grained access.

## 9. Multi-tenancy patterns

Choose based on tenant isolation needs:

* **Single database, shared schema (tenant_id column):** simplest; use row-level security policies if needed. Good for many small tenants.
* **Single database, split schema per tenant:** isolates DB-level concerns; more operational overhead.
* **Database-per-tenant:** maximum isolation; required for strict compliance.

Implement tenancy concerns in the request lifecycle:

* Resolve tenant from hostname, subdomain, or API key.
* Enforce tenant context in queries (use middleware to set tenant id on request context).
* Plan migrations and backup strategies per chosen pattern.

## 10. Billing, subscriptions & webhooks

Stripe is the de-facto standard for subscriptions:

* Use Stripe webhooks for async events (invoice.payment_failed, customer.updated).
* Implement idempotent webhook handlers and signature verification.
* Store minimal billing metadata (customer id, subscription id) in DB and reference for entitlement checks.

Design billing flow:

* Authorize flows in frontend, confirm server-side, and provision features in background jobs.
* Provide webhook retry/backoff, DLQ, and monitoring alerts for failed webhook processing.

## 11. Caching, CDN & performance (SSR/ISR/SSG)

Caching tiers:

* **CDN (edge)**: cache static assets and HTML for public pages (SSG/ISR). Vercel and Cloud CDN provide automatic cache invalidation on deploy.
* **Server-side cache:** Redis for application data caching and session caching.
* **Browser cache:** set `Cache-Control` for static assets and API responses where safe.

Next.js features:

* **SSG** for stable pages.
* **ISR** (revalidate) for frequently updated pages with CDN-friendly TTLs.
* **SSR** for user-specific pages or protected routes (use cache hints and partial caching to reduce cost).

Edge caching strategies:

* Use surrogate-keys or path-based invalidation for fine-grained cache control.
* When personalization required, consider Edge Middleware to strip or set cookies and route to server-side rendering only when needed.

Image optimization:

* Use Next.js Image component with a performant image CDN (Vercel Image, Cloudinary, Imgix) and optimize formats (AVIF, WebP) and responsive sizes.

## 12. Background jobs & asynchronous processing

Use background workers for long-running tasks (emails, invoices, thumbnailing):

* **Serverless jobs:** use cloud functions (e.g., AWS Lambda via SNS/SQS) for low-throughput jobs.
* **Container workers:** use a worker service pool (Kubernetes/Heroku) for heavy throughput.
* **Managed services:** use platforms like Workers Queue or background job SaaS if suitable.

Design job system:

* Publish tasks to a reliable queue (Redis, RabbitMQ, SQS).
* Workers should be idempotent and handle retries with exponential backoff.
* Monitor queue depth and worker health with metrics and alerting.

## 13. Observability: logging, metrics, tracing & RUM

Server-side:

* **Structured logs:** JSON logs with `service`, `env`, `request_id`, `tenant_id`, and `user_id` when available; send to Logstash/Loki/Datadog.
* **Metrics:** expose Prometheus-compatible metrics for request rates, error rates, latencies, queue depth, and background job success/failure.
* **Tracing:** use OpenTelemetry for distributed tracing across edge/server/backend.

Client-side (RUM):

* Collect page load metrics, first input delay, CLS, LCP and custom business metrics. Send to an APM/RUM provider (Sentry Performance, Datadog RUM, New Relic).
* Tag RUM with `release`, `env`, and `user_anonymized` data to correlate with server traces.

Correlation:

* Propagate `traceparent` and `X-Request-Id` from browser → edge → server → backend. Include these in logs and traces.

## 14. Security hardening

HTTP & headers:

* Enforce HTTPS; set `Strict-Transport-Security`, `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`.
* Apply a restrictive Content Security Policy (CSP) tailored to your assets and third-parties.

Cookies & tokens:

* Use `Secure` and `HttpOnly` cookies for session tokens; set `SameSite` appropriately.
* Encrypt opaque session data and rotate secrets periodically.

Input validation & XSS:

* Validate and sanitize all input server-side using Zod or schema validators. Use server components to avoid leaking sensitive data to the client.

Rate limiting & abuse prevention:

* Implement global and per-tenant rate limits at the edge or API gateway using Redis counters or managed WAF features.
* Add bot protection (reCAPTCHA) for sensitive endpoints (signup, password reset).

Secrets & supply chain:

* Use secret managers, rotate keys, and scan dependencies regularly (SCA).
* Use lockfiles and pin transitive dependencies where possible.

GDPR & privacy:

* Provide data export and deletion flows. Minimize PII storage and use encryption at rest. Document data retention policies.

## 15. Testing strategy

Types of tests:

* **Unit tests:** Jest/ Vitest for component and utility logic.
* **Integration tests:** test server route handlers and DB integration using test DB instances (Docker).
* **E2E tests:** Playwright for core user flows (signup, billing, onboarding).
* **Performance tests:** Lighthouse and synthetic RUM testing for critical pages.

CI test matrix:

* Run unit and lint on PRs; run integration and E2E in merge pipeline or nightly depending on runtime cost.

Contracts & contracts testing:

* Use TypeScript types and DTOs to maintain API contracts. Consider contract tests for public APIs.

## 16. CI/CD & release process

Pipeline stages:

1. **Lint & Type-check:** ESLint + TypeScript `tsc --noEmit`.
2. **Unit tests & coverage:** Jest/Vitest.
3. **Build:** Next.js build and output tracing (collect build sizes).
4. **E2E (staging):** Deploy to staging and run Playwright tests.
5. **Publish:** Deploy to production (Vercel or CI/CD provider). In containerized setups, push image to registry.
6. **Post-deploy smoke tests & monitor:** run synthetic checks and monitor SLOs.

Feature flags & rollout:

* Use feature flags (Flagship, LaunchDarkly, or open-source Unleash) for gradual rollouts and safe rollbacks.

## 17. Monitoring, SLOs & incident runbook

SLO examples:

* **Availability:** 99.9% successful responses for core API endpoints.
* **Latency:** p95 API < 300ms for authenticated endpoints; p95 page TTFB < 500ms.

Runbook essentials:

* How to identify incidents (alerts triggers), collect logs/traces, and perform a rollback.
* Steps to run smoke tests, scale workers, and restore backups.
* Post-incident actions: RCA, corrective tasks, and communication.

## 18. Scaling & operational concerns

* **Connection pooling in serverless:** use a connection pooler (PgBouncer) or serverless-friendly DB (Neon, Upstash for Redis).
* **Autoscaling:** use metrics-driven autoscaling for server pools and workers (CPU, request latency, queue depth).
* **Cost controls:** cap concurrent serverless instances, use caching to reduce DB load.

## 19. Local developer experience & DX

* Provide a `dev` script to run local stack (`next dev`, hot-reloaded UI, mocked backend or proxied backend).
* Include `seed` scripts to provision realistic demo data.
* Offer type-safe API clients (generated via OpenAPI or TRPC) to reduce integration friction.

## 20. Extending the template

Possible additions:

* TRPC for end-to-end type-safety between client and server.
* Webhooks frameworks and replay tools for testing webhook flows.
* Multi-region replication and data residency features (GDPR).
* Offline-first PWA support for selected workflows.

## 21. References

* Next.js Documentation — [https://nextjs.org/docs](https://nextjs.org/docs)
* Vercel Platform Docs — [https://vercel.com/docs](https://vercel.com/docs)
* Prisma ORM — [https://www.prisma.io/docs](https://www.prisma.io/docs)
* OpenTelemetry — [https://opentelemetry.io/docs](https://opentelemetry.io/docs)
* Stripe Webhooks — [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
* GDPR Guidelines — [https://gdpr.eu/](https://gdpr.eu/)

---

This `ARCHITECTURE.md` is intentionally practical and opinionated — designed to help teams ship a resilient, secure and observable SaaS product using Next.js + TypeScript. Adopt or adapt the recommendations to match your organization's compliance, performance and cost requirements.
