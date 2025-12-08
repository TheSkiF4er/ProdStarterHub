# PRODSTARTER.RAILS-MARKETPLACE-RUBY — ARCHITECTURE

> Production-ready architecture document for the `rails-marketplace-ruby` template. This file documents design intent, components, deployment patterns, observability, security, testing, and operational runbook for building a scalable, secure marketplace application on Ruby on Rails.

---

## Table of contents

1. Purpose & goals
2. Non-functional requirements
3. High-level architecture
4. Project layout & conventions
5. Core components & responsibilities
6. Data model & database strategy
7. Payments, billing & webhooks
8. Background processing & workers
9. Caching, CDN & performance
10. API design & versioning
11. Authentication, authorization & marketplace actors
12. Security best practices
13. Observability: logging, metrics & tracing
14. Testing strategy
15. CI/CD, packaging & releases
16. Deployment patterns & scaling
17. Backups, disaster recovery & migrations
18. Operational runbook & run-time tasks
19. Extensibility & best practices
20. References

---

## 1. Purpose & goals

This architecture provides an opinionated, production-ready foundation for a marketplace built with Ruby on Rails. The goals are:

* Fast developer experience (convention-over-configuration) with clear separation of concerns.
* Secure defaults for payments and user data.
* Observability by design (structured logs, metrics, tracing, and health checks).
* Scalable deployment patterns for web, API, and background workloads.
* Practical guidance for CI/CD, migrations, backups and incident response.

Intended users: backend engineers, full-stack Rails developers, DevOps and SREs building marketplace products.

---

## 2. Non-functional requirements

* **Availability:** 99.9% target for core transaction flows; plan for graceful degradation of non-critical features.
* **Consistency:** strong consistency for financial operations; eventual consistency acceptable for denormalized read models (search, feeds).
* **Security & Compliance:** PCI-DSS guidance for payments, GDPR/CCPA readiness for user data.
* **Performance:** p95 response targets acceptable for marketplace UX; design caching and read models to reduce DB pressure.
* **Observability:** request-level traces, structured logs, metrics for business and platform telemetry.

---

## 3. High-level architecture

```
Clients (web/mobile) -> CDN / WAF -> Rails web/API (puma) -> DB (Primary) + Read Replicas
                                    |         \-> Redis (cache, sessions, Sidekiq)
                                    |         \-> Object storage (S3)
                                    \-> Background workers (Sidekiq) -> external services (Stripe, Email, Search)

Monitoring: Prometheus / Datadog / NewRelic
Logs: JSON stdout -> Log aggregator (ELK / Loki / Datadog)
```

Key notes:

* Serve public assets via CDN.
* Use API endpoints for mobile/third-party clients; server-rendered pages for web UI where appropriate.
* Use background workers (Sidekiq) for long-running tasks (email, payments reconciliation, image processing).

---

## 4. Project layout & conventions

Follow Rails conventions with opinionated folders for a marketplace:

```
app/
  controllers/
  models/
  services/          # application services, orchestrators
  policies/          # authorization (Pundit)
  serializers/       # API serializers (FastJsonapi / Jbuilder)
  jobs/              # ActiveJob adapters for Sidekiq jobs
  mailers/
  workers/           # Sidekiq worker classes (if separate)
config/
db/
lib/
spec/ or test/
bin/
config/initializers/

Dockerfile
docker-compose.yml (dev)
Procfile (optional)
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Guidelines:

* Keep controllers thin: parameter parsing, authorization, and delegating to services.
* Put business transactions into `app/services` with explicit database transactions and retry semantics.
* Use serializers for API responses and keep view logic out of models.

---

## 5. Core components & responsibilities

* **Web/API layer (Puma):** request handling, authentication, throttling, basic input validation, and responses.
* **Models (ActiveRecord):** canonical data structures; keep DB schema normalized for transactional integrity.
* **Services / Use-case classes:** orchestrate operations across repositories, external services, and emit domain events.
* **Workers (Sidekiq):** background processing for async tasks, retries, and DLQ handling.
* **Search & Read Models:** optional denormalized indexes (Elasticsearch) for marketplace search & filtering.

---

## 6. Data model & database strategy

* Use PostgreSQL as primary DB. Configure `DATABASE_URL` for primary and read replicas.
* Data partitioning techniques (sharding) can be introduced later for high scale.
* Financial tables (transactions, payouts, refunds) should be ACID and audited.
* Use UUIDs for public-facing IDs (but internal integer PKs optional). Consider `pgcrypto` for UUID generation.
* Implement a small event log table for domain events or use an event store if needed.

Schema evolution:

* Use additive migrations: add nullable columns or new tables first, backfill asynchronously, then make non-nullable.
* Avoid long-running migrations in online mode; use batching and backfills via Sidekiq.

---

## 7. Payments, billing & webhooks

* Use PCI-compliant processors (Stripe recommended) and rely on hosted payment pages / tokenization (Stripe Elements / Checkout) to minimize PCI scope.
* Webhook handling:

  * Verify signatures for incoming webhooks and respond with 2xx only on successful processing.
  * Persist raw webhook events for audit and replay.
  * Implement idempotency using webhook `id` and a deduplication table.
* Billing flows:

  * Keep a single source of truth for billing state and reconcile via background jobs.
  * Payouts to sellers should be handled asynchronously with retry and manual intervention path.

---

## 8. Background processing & workers

* Use Sidekiq with Redis as the queue backend. Configure multiple queues (critical, default, low) and concurrency tuned to container/VM resources.
* Job design:

  * Use idempotent jobs where possible.
  * Implement retries with exponential backoff and move poison messages to Dead Letter Queue (DLQ) after threshold.
  * Track job metrics (latency, failures) and surface alerts on spikes.
* Sidekiq Enterprise features (batches, reliable fetch) are optional but helpful at scale.

---

## 9. Caching, CDN & performance

* **CDN:** serve static assets (images, JS/CSS) and pre-rendered public pages if applicable.
* **HTTP caching:** set `Cache-Control` and use surrogate keys for selective invalidation.
* **Fragment caching & Russian Doll caching:** cache view fragments for heavy templates.
* **Application cache:** use Redis for ephemeral caches, session store, and rate-limiting counters.
* **Query optimization:** use `EXPLAIN ANALYZE`, add indexes, and use read replicas for heavy read traffic.

Image handling:

* Store uploaded images in S3 and serve through CDN. Use background jobs for processing (thumbs, optimization).

---

## 10. API design & versioning

* Expose a RESTful JSON API for mobile and third-party integrations. Use versioning in the URL (`/api/v1/`).
* Use consistent error format with machine-readable `code` and `message`, and include helpful `details` for validation errors.
* Rate-limit API clients and expose `Retry-After` headers for 429 responses.
* Consider GraphQL for complex client-driven data needs, but keep initial scope RESTful for simplicity.

---

## 11. Authentication, authorization & marketplace actors

Actors: buyers, sellers, admins, service bots.

Authentication:

* Use Devise for authentication and configure secure session cookies. Support OAuth social logins optionally.
* For API clients, support token-based auth (JWT or opaque tokens) with revocation mechanism.

Authorization:

* Use Pundit for policies. Policies enforce per-resource permissions and per-actor roles.
* Enforce tenant scoping (seller access) at policy/service layer to avoid accidental data leakage.

---

## 12. Security best practices

* **HTTPS everywhere:** terminate TLS at edge (load balancer / CDN).
* **Content Security Policy (CSP):** enforce strong CSP for browser clients.
* **Secrets management:** do not store secrets in repo. Use KMS or secret stores.
* **Dependencies:** run `bundle audit` / SCA in CI and address critical vulnerabilities.
* **Input validation & serialization:** sanitize user inputs and escape outputs to prevent XSS.
* **CSRF protection:** enabled for browser forms; use CSRF-less tokens for safe APIs with proper auth.
* **Database credentials:** principle of least privilege for DB users; separate user for migrations if necessary.
* **Logging PII:** redact sensitive fields in logs.

PCI considerations:

* Use tokenization and hosted checkout to minimize PCI scope. Maintain logs and audit trails for payments.

---

## 13. Observability: logging, metrics & tracing

Logging:

* Structured JSON logs (use `lograge` + JSON formatter) emitted to stdout for aggregator ingestion. Include `request_id`, `user_id`, `tenant_id`, and `trace_id`.

Metrics:

* Collect application & business metrics: request rates, latencies, error counts, payments processed, active listings.
* Export to Prometheus or push to Datadog; set up dashboards and alerts (error rate, job failures, queue backlog).

Tracing:

* Use OpenTelemetry instrumentation (or vendor APM) to trace requests across web → workers → external services.
* Correlate logs and traces using `trace_id` and `request_id`.

Health & readiness:

* Implement `/healthz` (liveness) and `/readyz` (readiness) endpoints for orchestrators.

---

## 14. Testing strategy

Layers:

* **Unit tests:** models, services, policies (RSpec).
* **Feature tests:** controller/integration tests for user flows (signup, listing creation, checkout).
* **System tests / E2E:** Capybara / Playwright for critical UI flows against a real stack.
* **Integration tests:** webhook processing, payment flows with sandbox providers.

CI practices:

* Fast unit tests on PRs; full suite (integration + system) on merge. Use test parallelization for speed.
* Use test factories (FactoryBot) and database cleaner strategies for deterministic tests.

---

## 15. CI/CD, packaging & releases

CI pipeline recommended stages:

1. Lint & static analysis (`rubocop`, `sorbet` optional).
2. Unit tests (RSpec).
3. Integration tests (with test DB), web UI system tests in merge pipeline.
4. Build artifacts (Docker image), run `bundle install --deployment` and asset precompilation.
5. Security scans (SCA, container scanning) and SBOM generation.
6. Release: tag and push Docker image to registry, deploy to staging, run smoke tests, then deploy to production.

Release management:

* Use semantic versioning and changelog for releases. Automate release notes from merged PRs.

---

## 16. Deployment patterns & scaling

Deployment options:

* **Kubernetes:** recommended for scaling web and worker deployments. Use HPA (CPU/memory/queue depth) and readiness probes.
* **Platform (Heroku/GCP Cloud Run):** simpler to start; consider connection pooling and worker dynos.
* **VMs / Autoscaling Groups:** suitable for self-managed infra.

Scaling strategy:

* Keep web tier stateless; scale horizontally.
* Scale Sidekiq workers independently based on queue backlog.
* Offload heavy reads to read replicas or search indexes.

Database scaling:

* Use read replicas for read-heavy endpoints. Consider partitioning or sharding once single-node becomes bottleneck.

---

## 17. Backups, disaster recovery & migrations

Backups:

* Automate nightly DB backups and test restores regularly. Store encrypted backups offsite.
* Backup object storage metadata and ensure assets are replicated.

Disaster recovery:

* Define RTO/RPO SLAs for critical data. Document recovery steps and perform DR drills periodically.

Migrations:

* Run migrations in a controlled job with maintenance window for destructive changes. Use backfill jobs for data migration.

---

## 18. Operational runbook & run-time tasks

Include runbook sections for:

* **Incident detection:** dashboards and alerts to watch.
* **Initial triage:** collect logs (by request_id), run traces, inspect metrics, and identify impacted subsystems.
* **Mitigation:** scale workers/web, roll back to previous image, or disable non-critical features.
* **Post-incident:** RCA, remediate, and add tests to prevent recurrence.

Common operational commands:

* `rails db:migrate` (run in migration job)
* `rails console` (with read-only mode for debugging)
* `bundle exec sidekiq` (worker start)

---

## 19. Extensibility & best practices

* Keep services small and composable; avoid god-objects in models.
* Favor explicit transactions in service objects for complex multi-table operations.
* Adopt a bounded-context approach: separate listing, payments, messaging domains as they grow.
* Introduce async eventing (Kafka or Kinesis) when you need robust cross-service integration.

Operational hygiene:

* Automate dependency updates (Dependabot / Renovate) and run tests on upgrade PRs.
* Maintain a runbook and on-call rotation for production support.

---

## 20. References

* Ruby on Rails Guides — [https://guides.rubyonrails.org/](https://guides.rubyonrails.org/)
* Sidekiq — [https://sidekiq.org/](https://sidekiq.org/)
* Stripe Integration Best Practices — [https://stripe.com/docs](https://stripe.com/docs)
* OpenTelemetry — [https://opentelemetry.io/](https://opentelemetry.io/)
* PCI-DSS Overview — [https://www.pcisecuritystandards.org/](https://www.pcisecuritystandards.org/)
* Twelve-Factor App — [https://12factor.net/](https://12factor.net/)

---

This `ARCHITECTURE.md` is intentionally opinionated to provide a secure, scalable, and observable baseline for a Ruby on Rails marketplace. Adapt the recommendations to your team's compliance, operational, and business constraints.
