# PRODSTARTER.RAILS-MARKETPLACE-RUBY — TUTORIAL

This tutorial guides engineers and operators through bootstrapping, developing, testing, building, and operating the `rails-marketplace-ruby` template from **ProdStarterHub**. It focuses on production-ready practices: local development parity, secure defaults, background workers (Sidekiq), payments/webhooks, database migrations, observability, containerization, CI/CD and safe release procedures.

> Audience: Rails backend engineers, full-stack developers, DevOps and SREs responsible for a marketplace product.

---

## Table of contents

1. Prerequisites
2. Scaffold & initial repository setup
3. Local development (native and Docker)
4. Project layout and conventions
5. Configuration, secrets & environment
6. Database setup, migrations & safe schema evolution
7. Payments, webhooks and idempotency
8. Background jobs, Sidekiq, and worker management
9. Asset pipeline, frontend builds and CDN
10. Testing strategy (unit, feature, integration, E2E)
11. Observability (logs, metrics, tracing)
12. Build, packaging & Dockerfile
13. CI/CD pipelines and release flow
14. Deployment strategies & zero-downtime migrations
15. Backups, restores & disaster recovery drills
16. Runbook: incidents, common tasks and troubleshooting
17. Security checklist
18. Performance tuning & scaling guidance
19. Maintenance & post-release practices
20. Useful commands & scripts
21. Next steps & extension ideas

---

## 1. Prerequisites

* Ruby (supported version documented in `README.md`, e.g. 3.1+). Use `rbenv`/`rvm` or a container with pinned runtime.
* Bundler (2.x) and a lockfile (`Gemfile.lock`).
* PostgreSQL 12+ (recommended) or MySQL if configured.
* Redis for Sidekiq and caching.
* Node.js (LTS) and yarn/npm for the asset pipeline.
* Docker & Docker Compose for local environment parity and CI.
* Access to a secrets manager for production (Vault, AWS Secrets Manager, etc.).

Optional but recommended:

* Stripe test account and webhook endpoint tooling (stripe-cli).
* An APM (Datadog, New Relic, Sentry) and metrics backend (Prometheus/Grafana).

---

## 2. Scaffold & initial repository setup

1. Copy the template:

```bash
cp -R ProdStarterHub/templates/web/rails-marketplace-ruby ~/projects/my-marketplace
cd ~/projects/my-marketplace
```

2. Create a branch for initial work:

```bash
git checkout -b feat/init
```

3. Setup `.env` from example and update required values (database, redis, stripe keys):

```bash
cp .env.example .env
# edit .env with your local dev values
```

4. Install dependencies:

```bash
bundle install --path vendor/bundle
yarn install --frozen-lockfile
```

5. Setup DB & run migrations:

```bash
bundle exec rails db:create db:migrate db:seed
```

6. Start rails server and Sidekiq in separate terminals:

```bash
bundle exec rails server -b 0.0.0.0 -p 3000
bundle exec sidekiq -C config/sidekiq.yml
```

Open [http://localhost:3000](http://localhost:3000) and verify the app boots.

---

## 3. Local development (native and Docker)

### Native (fast iteration)

* Use local Postgres and Redis instances or Docker-provided instances.
* Run `bin/setup` (if provided) to automate common bootstrapping tasks.
* Use `spring` or `zeus` carefully if you need faster rails boot times; watch for stale state in development.

### Docker (recommended for parity)

* Use `docker-compose.yml` in the template to spin up `app`, `db`, `redis`, and `maildev`:

```bash
docker compose up -d
# run setup inside container
docker compose exec app bin/setup
```

* The Docker setup mirrors production ENV variables and reduces "works on my machine" issues.

Developer tips:

* Use `rails console --sandbox` for safe exploration.
* Use `rails logs` or `docker compose logs -f` to tail logs.

---

## 4. Project layout and conventions

See `ARCHITECTURE.md` for full details. Quick highlights:

```
app/
  controllers/        # thin controllers, delegate to services
  models/             # ActiveRecord models
  services/           # business logic & orchestration
  policies/           # Pundit policies for authorization
  jobs/               # ActiveJob classes (Sidekiq workers)
  mailers/
  serializers/        # API serializers
config/
db/
lib/
spec/ or test/
public/
config/initializers/

Dockerfile
docker-compose.yml
README.md
ARCHITECTURE.md
TUTORIAL.md
TASKS.md
```

Conventions:

* Controllers should validate params, call service objects, and return serializers.
* Business logic belongs in `app/services` and is covered by unit tests.
* Use `app/policies` for authorization and cover critical rules with tests.

---

## 5. Configuration, secrets & environment

Follow 12-factor principles: configuration in environment variables.

* Keep `.env` out of source control. Provide `.env.example` as a template.
* For production, inject secrets via a secret manager and environment-specific config.
* Validate critical config at startup; fail-fast if required secrets are missing (e.g., `APP_SECRET`, `DATABASE_URL`).

Example validation (initializer or `bin/check_env` script) should verify presence of required env vars and log helpful instructions.

---

## 6. Database setup, migrations & safe schema evolution

Principles for migrations:

* Prefer additive migrations (new columns nullable, new tables).
* For data backfills, create idempotent Rake tasks or ActiveJob jobs and run them asynchronously.
* Avoid long-running migrations in deploy path — perform schema changes in small steps.

Typical workflow:

```bash
bundle exec rails generate migration AddFieldToUsers field_name:string
bundle exec rails db:migrate
# for backfill
bundle exec rails runner "User.find_each { |u| u.update!(field_name: compute(u)) }"
```

Migrations in CI/Deploy:

* Run `bundle exec rails db:migrate` in a dedicated migration job before switching traffic.
* Keep a rollback/restore strategy and take DB backups before destructive changes.

---

## 7. Payments, webhooks and idempotency

Stripe integration tips:

* Use Stripe Checkout or Elements to tokenize card details and minimize PCI scope.
* Implement webhook handlers that verify Stripe signatures (`Stripe::Webhook`), persist raw events, and use an idempotency key or dedup table to avoid double-processing.

Webhook processing pattern:

1. Receive webhook, verify signature.
2. Persist raw payload and processing metadata.
3. Enqueue a background job to process the event (idempotent).
4. Respond 200 on successful enqueue.

Testing webhooks locally:

* Use `stripe listen` or `stripe-cli` to forward test webhook events to your local server.

---

## 8. Background jobs, Sidekiq, and worker management

* Sidekiq is the recommended job processor. Configure `config/sidekiq.yml` queues and concurrency defaults.
* Recommended queues: `critical`, `default`, `low`, `mailers`.
* Use Redis with persistence disabled for ephemeral queues; configure eviction and memory limits.

Running workers:

* Development: `bundle exec sidekiq -C config/sidekiq.yml`
* Production: run Sidekiq as separate service/process managed by systemd, supervisord, or scaler on k8s.

Job best practices:

* Make jobs idempotent and safe to retry.
* Use `perform_async` with a unique key when deduplication is required (Sidekiq Enterprise or custom table).
* Monitor queue depth and job latency; alert on backlog growth.

DLQ and retries:

* After N retries, move to DLQ or persist to `failed_jobs` table for manual triage.

---

## 9. Asset pipeline, frontend builds and CDN

* Use the asset pipeline configured in the template (Webpacker or importmap/Vite). Run `yarn build` in CI to produce optimized assets.
* Serve static assets via CDN (S3 + CloudFront recommended) and set long `Cache-Control` headers with hashed filenames.
* Precompile assets in CI/Build stage:

```bash
RAILS_ENV=production bundle exec rails assets:precompile
```

* Keep images and user uploads in S3 and serve via CDN; process images in background jobs.

---

## 10. Testing strategy (unit, feature, integration, E2E)

Testing pyramid:

* Unit tests (fast): models, services, policies (RSpec).
* Integration/feature: controllers, mailers, and API endpoints.
* System/E2E: Capybara or Playwright tests against a running stack.

Test environment:

* Use transactional tests for unit/feature where possible (Database Cleaner / Rails 5+ transactional fixtures).
* For integration/E2E, spin up Docker services for DB/Redis and run tests in CI.

CI suggestions:

* Run fast unit tests on PRs.
* Run full integration + E2E in merge pipeline or nightly to save CI minutes.

Coverage & quality gates:

* Measure test coverage and set minimum thresholds for critical components (payments, auth, jobs).

---

## 11. Observability (logs, metrics, tracing)

Logging:

* Use `lograge` + JSON formatter to emit structured logs to stdout. Include `request_id`, `user_id`, and `tenant_id`.

Metrics:

* Collect Prometheus-compatible metrics: request rate/latency, DB connections, Sidekiq queue depth, payment success rates. Expose `/metrics` or push to a gateway.

Tracing:

* Integrate OpenTelemetry or vendor APM to trace requests across web, workers, and external services. Correlate traces with logs via `trace_id`.

Health checks:

* Implement `/healthz` for liveness and `/readyz` to check DB/Redis connectivity for readiness.

---

## 12. Build, packaging & Dockerfile

Multi-stage Dockerfile recommended:

```Dockerfile
# Builder
FROM ruby:3.1 AS builder
WORKDIR /app
COPY Gemfile Gemfile.lock ./
RUN bundle install --deployment --without development test
COPY . .
RUN yarn install --frozen-lockfile && yarn build
RUN bundle exec rails assets:precompile

# Runtime
FROM ruby:3.1-slim
WORKDIR /app
ENV RAILS_ENV=production
COPY --from=builder /app .
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser
EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

Best practices:

* Use `bundle install --deployment --without development test` in build stage.
* Run asset precompilation in builder stage.
* Run app as non-root user and minimize installed OS packages.
* Pin base image digests in CI and scan images with Trivy.

---

## 13. CI/CD pipelines and release flow

Typical CI stages:

1. **Install**: install gems and node modules.
2. **Static checks**: RuboCop, brakeman (security scanner).
3. **Unit tests**: RSpec.
4. **Build**: assets precompile, docker build.
5. **Integration/E2E**: run on merge or staging deploy.
6. **Security scans**: dependency & container scans.
7. **Publish**: push container image and create release artifacts.

Release flow:

* Use semantic versioning and create release tags.
* Run migration job (pre-deploy) with backups in place.
* Deploy to staging and run smoke tests.
* Promote to production with monitored rollout.

Use feature flags and canary/blue-green strategies to reduce blast radius.

---

## 14. Deployment strategies & zero-downtime migrations

Deployment options:

* **Kubernetes**: Deploy web and worker as separate deployments. Use readiness/liveness probes and rolling updates. Run migrations as a Kubernetes Job.
* **Platform (Heroku)**: use release phase for migrations and run workers as separate dynos.

Zero-downtime migrations pattern:

1. Add nullable column or new table.
2. Deploy code that writes to new column and reads old if absent.
3. Backfill existing records in background job.
4. Switch reads to new column.
5. Remove old column in later release.

Always take a DB backup and have a rollback plan.

---

## 15. Backups, restores & disaster recovery drills

Backups:

* Automate nightly DB backups and retain snapshots for a configurable period.
* Backup S3 bucket metadata and verify object replication if used.

Restores:

* Test restores monthly to ensure backups are valid.
* Document RTO and RPO for critical services.

DR drills:

* Run war games and recovery drills at least twice a year.

---

## 16. Runbook: incidents, common tasks and troubleshooting

Incident triage steps:

1. Check alerting dashboard and scope (which services impacted).
2. Collect recent logs by `request_id` and traces.
3. Inspect Sidekiq queue metrics and worker health.
4. Check DB connectivity and replication lag.
5. Apply mitigation (scale, rollback, restart workers) and notify stakeholders.

Common troubleshooting commands:

```bash
# Tail logs
docker compose logs -f
# Run a console in production container
docker compose exec app bundle exec rails console
# Requeue failed job
bundle exec sidekiq-retryset clear
# Run migrations
bundle exec rails db:migrate
```

---

## 17. Security checklist

* Enforce HTTPS at edge and HSTS.
* Use secure cookies and session storage in Redis.
* Scan dependencies (`bundle audit`, `yarn audit`) and fix critical issues.
* Harden runtime: run as non-root, remove build tools in runtime image.
* Protect webhooks with signature verification and idempotency.
* Redact PII from logs and enable monitoring for suspicious activity.

---

## 18. Performance tuning & scaling guidance

* Tune Puma workers/threads to match container CPU and memory.
* Tune DB connection pool size to avoid exhaustion (`pool` in `database.yml`).
* Use read replicas for heavy read traffic and a caching layer (Redis) for hot data.
* Auto-scale workers based on queue depth and web replicas on CPU/latency.

Profiling:

* Use tools like `pg_stat_statements`, NewRelic, or Datadog to find slow queries.
* Profile Ruby code with `rack-mini-profiler` in staging to find hotspots.

---

## 19. Maintenance & post-release practices

* Monitor dashboards for at least 48–72 hours after release.
* Rotate secrets regularly and schedule dependency update cycles.
* Run periodic load tests and DR drills.

---

## 20. Useful commands & scripts

```bash
# Setup (native)
bin/setup
# Run tests
bundle exec rspec
# Start server
bundle exec rails s
# Start sidekiq
bundle exec sidekiq -C config/sidekiq.yml
# Precompile assets
RAILS_ENV=production bundle exec rails assets:precompile
# Run migrations
bundle exec rails db:migrate
# Backup DB (example for pg)
pg_dump -Fc $DATABASE_URL > backup.dump
```

---

## 21. Next steps & extension ideas

* Integrate search (Elasticsearch/Algolia) for marketplace discovery.
* Add fraud detection and payout reconciliation pipelines.
* Implement multi-region deployments and cross-region read replicas.
* Add GraphQL gateway for mobile clients if API needs evolve.
