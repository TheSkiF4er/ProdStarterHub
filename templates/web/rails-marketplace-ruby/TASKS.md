# PRODSTARTER.RAILS-MARKETPLACE-RUBY — TASKS (Release Checklist)

An actionable, opinionated checklist to prepare the `rails-marketplace-ruby` template for a production-ready release. Use this file to create issues/PRs, assign owners, and verify readiness before tagging and publishing.

> Mark items ✅ as they are completed. Split large tasks into smaller PRs and run CI on every change. Prioritize security, testing, observability, and safe migration strategies.

---

## 0. How to use this file

1. Create a release branch (e.g. `release/v1.0.0`).
2. Create issues for checklist items and link PRs to issues.
3. Ensure CI runs on every PR and that required gates pass before merging.
4. When mandatory items are ✅ and CI is green, tag and publish the release.

---

## 1. Project baseline (mandatory)

* [ ] ✅ **README.md** — clear overview, quickstart, and links to `ARCHITECTURE.md`, `TUTORIAL.md`, `TASKS.md`.
* [ ] ✅ **LICENSE** — include and verify license (MIT, Apache-2.0, etc.).
* [ ] ✅ **Repository layout** — ensure `app/`, `config/`, `db/`, `public/`, `spec/` or `test/`, `Dockerfile` (optional) and docs are present.
* [ ] ✅ **.env.example** — document required environment variables and secrets.
* [ ] ✅ **Supported runtime** — document supported Ruby versions and required system packages in README.

## 2. Dependency & build reproducibility

* [ ] ✅ **Gemfile / Gemfile.lock** — keep lockfile committed and review for unnecessary gems.
* [ ] ✅ **Build scripts** — include `Makefile` or `bin/` scripts to standardize tasks (setup, test, build, docker-build).
* [ ] ✅ **Asset pipeline** — ensure webpacker / js bundling or importmap build steps are verified in CI.
* [ ] ✅ ✅ **SBOM** — add SBOM generation and container scanning in CI (Trivy / Snyk).

## 3. Security & hardening

* [ ] ✅ **HTTPS guidance** — document TLS termination at edge and enforce `Strict-Transport-Security`.
* [ ] ✅ **Secrets management** — provide guidance for using KMS / Vault / cloud secret stores for production secrets; ensure `.env` is not committed.
* [ ] ✅ **Dependencies scanning** — integrate `bundle audit` or SCA in CI and fix critical vulnerabilities.
* [ ] ✅ **HTTP headers** — enable CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy via secure middleware.
* [ ] ✅ **Database least privilege** — ensure DB users have least privilege; use separate users for migrations if applicable.

## 4. Authentication & authorization

* [ ] ✅ **Auth flows** — include secure authentication (Devise) configuration and document recommended settings for production (confirmable, lockable, MFA guidance).
* [ ] ✅ **API tokens** — implement token-based auth for API clients with revocation mechanism (opaque tokens preferable).
* [ ] ✅ **Authorization** — implement Pundit policies or equivalent and cover critical endpoints with policy tests.

## 5. Database & migrations

* [ ] ✅ **Postgres recommended** — document DB setup and recommended extensions (pgcrypto, citext).
* [ ] ✅ **Migrations** — ensure all schema changes are migration-backed and follow additive-first patterns. Provide backfill job templates for data transformations.
* [ ] ✅ **Migrations workflow** — add a migration job in CI/CD and document pre- and post-migration checks.
* [ ] ✅ **Backups & restores** — automated backup jobs and documented restore procedures; test restores periodically.

## 6. Payments & webhooks

* [ ] ✅ **Stripe integration** — include webhook handler examples, signature verification, and idempotency guarantees.
* [ ] ✅ **Webhook persistence** — store raw webhook events and status to enable replay and auditing.
* [ ] ✅ **Payment reconciliation** — background jobs for reconciliation and alerts for failed payouts.

## 7. Background processing & jobs

* [ ] ✅ **Sidekiq / ActiveJob** — configure Sidekiq with multiple queues and sensible concurrency defaults.
* [ ] ✅ **Job idempotency** — implement idempotency and safe retry logic; add DLQ strategy.
* [ ] ✅ **Worker health** — expose worker metrics and ensure supervisor configs (systemd / k8s) are included.

## 8. Caching & CDN

* [ ] ✅ **CDN & assets** — ensure public assets are deployable to CDN and supported by cache-control headers.
* [ ] ✅ **Fragment & HTTP caching** — add examples of fragment caching and surrogate-key patterns for invalidation.
* [ ] ✅ **Redis config** — session store and cache should be production-ready and documented (timeouts, eviction policy).

## 9. Observability & monitoring

* [ ] ✅ **Structured logging** — configure `lograge` (or equivalent) to emit JSON logs to stdout; include `request_id`, `user_id`, `tenant_id`.
* [ ] ✅ **Metrics** — instrument request latency, error rate, Sidekiq queue depth, payments processed, and critical business metrics. Export to Prometheus or vendor.
* [ ] ✅ **Tracing** — optional OpenTelemetry or vendor APM integration and correlation with logs.
* [ ] ✅ **Health endpoints** — implement `/healthz` and `/readyz` and use readiness probe in orchestration.

## 10. Testing & quality gates

* [ ] ✅ **Unit tests** — RSpec / Minitest coverage for models, services, and policies.
* [ ] ✅ **Feature tests** — controller/feature tests for main user flows (listing, checkout, payouts).
* [ ] ✅ **Integration tests** — webhook processing and payment flows against sandbox providers.
* [ ] ✅ **System / E2E tests** — Capybara / Playwright for critical UI flows; run in CI against ephemeral environment.
* [ ] ✅ **Static analysis** — RuboCop, Sorbet (optional) and fail CI on critical lint issues.

## 11. CI/CD & release automation

* [ ] ✅ **CI pipeline** — lint, unit tests, integration tests, and security scans.
* [ ] ✅ **Build artifacts** — Docker image build with `bundle install --deployment`, asset precompilation and `RAILS_ENV=production` checks.
* [ ] ✅ **SBOM & image scanning** — generate SBOM and run Trivy in CI.
* [ ] ✅ **Release job** — tag, push image to registry, deploy to staging, run smoke tests, then promote to production.

## 12. Containerization & runtime

* [ ] ✅ **Multi-stage Dockerfile** — builder stage (bundle, yarn build, assets), runtime stage (minimal Ruby base or distroless), run as non-root.
* [ ] ✅ **Runtime tuning** — memory limits, puma workers/threads tuned for container sizes, and database connection pool size matching app concurrency.
* [ ] ✅ **Process separation** — run web and workers separately with their own resource constraints.

## 13. Deployment & scaling

* [ ] ✅ **Kubernetes manifests / Helm** — provide sample k8s manifests for web + worker + migrations job and HPA examples.
* [ ] ✅ **Deployment strategy** — recommend rolling updates, canary or blue/green strategies; document rollback steps.
* [ ] ✅ **Auto-scaling** — HPA on HTTP traffic and queue depth; autoscale workers independently.

## 14. Operational runbook

* [ ] ✅ **Incident detection** — standard dashboards and alert rules (error rate, queue backlog, payment failures, DB connections).
* [ ] ✅ **Incident triage** — steps to collect logs/traces, identify impacted services, and apply mitigation (scale, rollback).
* [ ] ✅ **Maintenance tasks** — DB vacuum/reindex recipes, clearing cache, queue maintenance, and replays.
* [ ] ✅ **On-call playbook** — escalation, runbook links, and contact matrix.

## 15. Documentation & developer experience

* [ ] ✅ **TUTORIAL.md** — developer onboarding (local dev with docker-compose, running tests, seeding data).
* [ ] ✅ **CONTRIBUTING.md** — contribution workflow and code style guidelines.
* [ ] ✅ **CHANGELOG** — maintain changelog for releases.
* [ ] ✅ **CLI / bin helpers** — `bin/setup`, `bin/console`, `bin/test` helpers to standardize tasks.

## 16. Release readiness checklist

* [ ] ✅ All CI checks passing (lint, tests, security scans).
* [ ] ✅ Docker image built, scanned and SBOM generated.
* [ ] ✅ Documentation updated (README, ARCHITECTURE, TUTORIAL, TASKS).
* [ ] ✅ Backups scheduled and migration plan validated.
* [ ] ✅ Release notes drafted and CHANGELOG updated.

## 17. Post-release & maintenance

* [ ] ✅ **Dependency refresh cadence** — schedule regular updates and SCA reviews.
* [ ] ✅ **Telemetry review** — proactive post-release monitoring for 48–72 hours.
* [ ] ✅ **Runbook updates** — update runbooks after incidents and release retrospectives.

## 18. Optional enhancements (future)

* [ ] ✅ **Event-driven architecture** — introduce event bus (Kafka) for cross-cutting async integrations.
* [ ] ✅ **Search & recommendations** — integrate Elasticsearch / Algolia for marketplace search and recommendations.
* [ ] ✅ **Advanced payments** — integrate payouts provider and fraud detection pipelines.
* [ ] ✅ **Geographic scaling** — multi-region read replicas and asset CDN edge configuration.

---

## How to proceed

1. Convert checklist items into issues and assign owners.
2. Use CI to enforce linting, type-checks and tests.
3. When all mandatory items are complete and CI is green, tag and publish a release.
