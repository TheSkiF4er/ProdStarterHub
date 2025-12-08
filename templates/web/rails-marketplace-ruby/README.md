# ProdStarter — Rails Marketplace (Ruby)

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

> Production-ready Ruby on Rails marketplace starter template. Opinionated defaults for payments (Stripe), background processing (Sidekiq), secure defaults, observability hooks, reproducible container builds, and CI/CD examples.

---

## Contents

* Quickstart
* Key features
* Project layout
* Prerequisites
* Installation & first run
* Configuration & secrets
* Development workflow
* Background workers (Sidekiq)
* Payments & webhooks
* Assets & CDN
* Testing
* Observability & monitoring
* Packaging & Docker
* CI/CD recommendations
* Deployment strategies
* Contributing
* License

---

## Quickstart

```bash
# copy template
cp -R ProdStarterHub/templates/web/rails-marketplace-ruby ~/projects/my-marketplace
cd ~/projects/my-marketplace

# install ruby deps
bundle install

# install javascript deps
yarn install

# prepare database
bundle exec rails db:create db:migrate db:seed

# start web + sidekiq (in separate terminals)
bundle exec rails server -b 0.0.0.0 -p 3000
bundle exec sidekiq -C config/sidekiq.yml

# open http://localhost:3000
```

See `TUTORIAL.md` for detailed developer and ops guidance.

---

## Key features

* Rails (3.x/4.x+) application skeleton tailored for marketplace use cases.
* Payments scaffolding with Stripe integration and secure webhook handling.
* Sidekiq background jobs with queueing patterns and DLQ recommendations.
* Secure defaults: CSP, secure cookies, CSRF protection, secrets management guidance.
* Observability hooks: structured JSON logs, Prometheus metrics endpoints, OpenTelemetry guidance.
* Reproducible multi-stage Dockerfile and optional Kubernetes manifests.
* Testing scaffold (RSpec) and example specs for models, services, and jobs.

---

## Project layout

```
app/
  controllers/
  models/
  services/
  jobs/
  mailers/
  policies/
  serializers/
config/
db/
  migrations/
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
template.json
```

The template follows Rails conventions and organizes business logic into `app/services` and background tasks into `app/jobs`.

---

## Prerequisites

* Ruby (see `template.json` for recommended versions; use rbenv/rvm as preferred)
* Bundler
* PostgreSQL (recommended) or MySQL
* Redis (Sidekiq)
* Node.js / Yarn for asset builds
* Docker (recommended for local parity)

---

## Installation & first run

1. Copy `.env.example` to `.env` and set credentials for DB, Redis, and Stripe.
2. Install Ruby gems and JS deps:

```bash
bundle install
yarn install
```

3. Prepare the database:

```bash
bundle exec rails db:create db:migrate db:seed
```

4. Start services:

```bash
bundle exec rails s
bundle exec sidekiq -C config/sidekiq.yml
```

---

## Configuration & secrets

* Follow 12‑factor app practices: use environment variables for runtime configuration.
* Provide `.env.example` for local development; **do not** commit `.env`.
* For production use a secret manager (AWS Secrets Manager, Vault, Kubernetes Secrets, etc.).
* Validate critical config at boot (APP_SECRET, DATABASE_URL, STRIPE keys) and exit with clear errors if missing.

Important environment variables: `DATABASE_URL`, `REDIS_URL`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_SECRET_KEY`, `RAILS_ENV`, `SECRET_KEY_BASE`.

---

## Development workflow

* Use Docker Compose for full-stack parity: `docker compose up -d`.
* Common scripts:

  * `bin/setup` — prepare local dev environment (gems, yarn, db, seeds).
  * `bin/console` — open Rails console in dev env.
  * `bin/test` — run test suite.
* Keep controllers thin and put domain logic in `app/services` to make testing easier.

---

## Background workers (Sidekiq)

* Configure Sidekiq queues in `config/sidekiq.yml` (e.g., `critical`, `default`, `low`).
* Run Sidekiq separately from the web process and scale independently.
* Make jobs idempotent and implement retries with exponential backoff. Move permanently failing jobs to a DLQ for manual inspection.
* Monitor queue depth and processing latency; alert on backlog growth.

---

## Payments & webhooks

* Use Stripe Checkout/Elements for PCI-scope minimization.
* Implement secure webhook endpoints that verify signatures and persist raw webhook payloads for audit & replay.
* Process webhooks asynchronously via Sidekiq jobs and implement idempotency to avoid double-processing.
* Provide reconciliation jobs and dashboards for payment status and failed payouts.

---

## Assets & CDN

* Precompile assets during the build stage (`rails assets:precompile`) and upload to a CDN (S3 + CloudFront recommended).
* Serve user uploads from object storage and process images asynchronously.
* Use hashed filenames and long `Cache-Control` headers for static assets.

---

## Testing

* RSpec for unit and feature tests. Use FactoryBot for fixtures and DatabaseCleaner or transactional tests where appropriate.
* Integration tests for payment and webhook flows using sandbox/test keys.
* System/E2E tests (Capybara or Playwright) against a staging environment for critical flows.
* Run fast unit tests in PRs and full integration suites in merge CI.

---

## Observability & monitoring

* Emit structured JSON logs (configure with `lograge`) to stdout for collectors.
* Instrument business and platform metrics (request rate, latency, Sidekiq queue depth, payments processed). Export to Prometheus or vendor APM.
* Optional OpenTelemetry tracing guidance included; correlate traces with logs using `trace_id`.
* Implement `/healthz` and `/readyz` endpoints for orchestrators.

---

## Packaging & Docker

Use a multi-stage Dockerfile to produce minimal production images. Key points:

* Install gems and build assets in a builder stage.
* Copy only required artifacts into runtime image.
* Run as non-root user and minimize installed packages.
* Pin base image digests and run image scanning (Trivy) in CI.

---

## CI/CD recommendations

Suggested pipeline (GitHub Actions / GitLab):

1. Lint (`rubocop`) and static analysis.
2. Unit tests (RSpec).
3. Build assets and run integration tests.
4. Security scans (Brakeman, bundle-audit) and container scans.
5. Build Docker image, generate SBOM, push to registry.
6. Deploy to staging, run smoke tests, then promote to production with canary/blue-green.

Automate migrations as a controlled job and require DB backups before destructive migrations.

---

## Deployment strategies

* Kubernetes: deploy web and Sidekiq workers as separate Deployments; run migrations as Kubernetes Job.
* Platform (Heroku/GCP): use release phase for migrations and separate dynos for workers.
* Use health checks, readiness probes, and rolling updates or canary rollouts to minimize downtime.

---

## Contributing

Contributions welcome. Please:

1. Fork the repo and create a branch.
2. Run linters and tests locally.
3. Open a PR with a clear description and tests for new behavior.
4. Ensure CI passes and respond to review feedback.

---

## License

This template is provided under the MIT License. See `LICENSE` for details.
