# Changelog

All notable changes to **ProdStarterHub** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and this project aims to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Legend**
> - **Added** – new features or templates  
> - **Changed** – changes in existing behavior  
> - **Fixed** – bug fixes  
> - **Removed** – removed features or templates  
> - **Deprecated** – features to be removed in a future release  
> - **Security** – security fixes or notices  

---

## [Unreleased]

> Planned / in progress work that may land in the next versions.

### Added

- AI-assisted command `prodstarter ai-customize` for natural-language-based starter generation.
- Template filtering in CLI (`prodstarter list --language=... --type=...`).
- Additional “gold” templates with stricter quality guarantees (tests, CI, docs).
- Multi-language documentation pages for key guides (Getting Started, CLI usage, Template Authoring).

### Changed

- Improve error messages in CLI, especially around missing registry entries or invalid template IDs.
- Unify environment variable naming conventions across templates.
- Refine folder naming and path conventions for templates to make them more consistent.

### Fixed

- Minor typos in documentation and template descriptions.
- Edge cases when running CLI from nested directories inside the repo.

---

## [0.1.0] – 2025-11-29

> **First public alpha release.**  
> The goal of this release is to provide a solid foundation: a working CLI, a curated set of templates, and clear contribution rules.

### Added

#### Core & Monorepo

- **Monorepo structure** powered by `pnpm`:
  - `pnpm-workspace.yaml` with workspace and catalog configuration.
  - Root `package.json` with scripts for building, linting, testing, and running dev mode across all packages.
  - Shared strict TypeScript base config: `tsconfig.base.json`.

- **Core metadata system**:
  - `core/templates-schema/template.schema.json` – JSON schema describing template metadata (ID, type, language, framework, features, etc.).
  - `core/templates-registry.json` – central registry listing all available templates and their paths.

- **Tooling & configs**:
  - `.editorconfig` with sensible defaults for indentation, line endings, and whitespace.
  - `.gitignore` covering Node, Python, Go, .NET, Java, and common editor artifacts.
  - GitHub workflows in `.github/workflows/` for CI (lint + tests + build).
  - Issue templates & pull request template under `.github/ISSUE_TEMPLATE/` and `.github/PULL_REQUEST_TEMPLATE.md`.

- **Documentation & community files**:
  - `README.md` – main documentation, feature overview, and quick start.
  - `CONTRIBUTING.md` – detailed contribution guidelines (CLI, templates, docs, translations).
  - `CODE_OF_CONDUCT.md` – community behavior rules.
  - `LICENSE` – MIT license.

#### CLI: `cli/` (Node.js / TypeScript)

- New CLI package: **`prodstarter`**.
- Commands:
  - `prodstarter init`
    - Interactive wizard to:
      - choose a template from `core/templates-registry.json`,
      - set the project name,
      - scaffold a new project by copying the template and replacing placeholders (e.g. `{{PROJECT_NAME}}`).
  - `prodstarter list`
    - Lists all available templates with ID, language, framework, type, and features.
  - `prodstarter doctor`
    - Basic environment-check stub for future expansion (Node/Docker checks, etc.).

- Implementation details:
  - `cli/src/index.ts` – CLI entry point using `commander`.
  - `cli/src/commands/` – separate modules for `init`, `list`, and `doctor`.
  - `cli/src/services/logger.ts` – simple logging abstraction (`info`, `warn`, `error`).
  - `cli/src/services/template-registry.ts` – loading and parsing `core/templates-registry.json`.
  - `cli/src/services/project-scaffolder.ts` – directory copy helper with placeholder replacement support.

#### Templates: Web (`templates/web/`)

- **Next.js SaaS (TypeScript)** – `templates/web/nextjs-saas-typescript/`
  - Opinionated starter for SaaS-style apps using:
    - Next.js (TypeScript)
    - Postgres (via Prisma – placeholder)
    - Auth, RBAC, billing (placeholders)
    - Docker & docker-compose stubs
    - Basic test setup stubs
  - Documentation:
    - `README.md` – overview and basic usage.
    - `TUTORIAL.md` – step-by-step guide (skeleton).
    - `ARCHITECTURE.md` – architectural intent and layout (skeleton).
    - `TASKS.md` – suggested exercises for learners.

- **Laravel Monolith (PHP)** – `templates/web/laravel-monolith-php/`
  - Laravel-based monolith starter with:
    - Auth scaffold (planned)
    - Blade templates
    - Queues & mail (placeholders)
    - Docker stubs
  - Documentation files for tutorial, architecture, and tasks.

- **Rails Marketplace (Ruby)** – `templates/web/rails-marketplace-ruby/`
  - Rails starter targeted at marketplace style apps:
    - Basic domain (Users, Listings, Orders – planned)
    - Auth, payments (placeholders)
    - Background jobs (Active Job)
  - Full set of documentation skeletons.

#### Templates: API (`templates/api/`)

- **FastAPI REST API (Python)** – `templates/api/fastapi-python-api/`
  - Minimal but realistic starter with:
    - FastAPI app and `/health` endpoint.
    - Placeholders for JWT auth, Postgres integration, migrations, and tests.
  - Includes `app/main.py` and docs skeleton.

- **Django REST API (Python, DRF)** – `templates/api/django-rest-python/`
  - Django + DRF starter:
    - Planned auth and Postgres setup.
    - Docker & test skeletons.
  - Template metadata and documentation files.

- **Node.js REST API (Express, JavaScript)** – `templates/api/node-express-javascript/`
  - Simple Express server with `/health` endpoint.
  - JSON handling and CORS (planned).
  - Basic `README.md`, tutorial and architecture stubs.

- **Kotlin Spring Boot API** – `templates/api/kotlin-springboot-api/`
  - Spring Boot API starter in Kotlin:
    - `Application.kt` with a `/health` endpoint.
    - Placeholder for database integration and tests.
  - Documentation files for future expansion.

- **ASP.NET Core Web API (C#)** – `templates/api/aspnetcore-webapi-csharp/`
  - Minimal .NET API using minimal APIs:
    - `/health` endpoint.
  - Ready to extend with controllers, services, and DB.
  - Documentation skeleton.

- **Spring Boot API (Java)** – `templates/api/springboot-api-java/`
  - Java Spring Boot API starter:
    - `Application.java` with `/health` endpoint.
  - Placeholder for Postgres and more complex domains.
  - Documentation skeleton.

#### Templates: Services (`templates/service/`)

- **Go REST Service (chi)** – `templates/service/go-chi-rest/`
  - REST microservice using `chi`:
    - `/health` endpoint.
    - Config via environment variables (planned).
    - Docker & test skeletons.
  - Documentation skeleton.

- **Go gRPC Service** – `templates/service/go-grpc-service/`
  - gRPC microservice skeleton:
    - Basic server listening on `:50051`.
    - Ready to register real gRPC services and load `.proto` files.
  - Documentation skeleton.

- **Node Microservice (TypeScript)** – `templates/service/node-service-typescript/`
  - TypeScript microservice starter:
    - Simple HTTP server with `/health`.
    - Placeholder for more advanced routing and config.
  - Documentation skeleton.

- **C++ gRPC Service** – `templates/service/cpp-grpc-service/`
  - C++ gRPC service skeleton:
    - Basic main file indicating where to implement the gRPC server.
  - Documentation skeleton.

#### Templates: CLI (`templates/cli/`)

- **Go CLI Tool** – `templates/cli/go-cli-tool/`
  - Basic Go CLI:
    - Flags via `flag` package.
    - “Hello, name!” example.
  - Documentation skeleton.

- **C CLI Tool** – `templates/cli/c-cli-tool/`
  - Minimal C CLI:
    - `main.c` reading `argv` and printing “Hello, name!”.

- **C# CLI Tool (.NET)** – `templates/cli/csharp-cli-tool/`
  - .NET console app:
    - `Program.cs` reading argument and printing greeting.
  - Documentation skeleton.

- **Java CLI Tool** – `templates/cli/java-cli-tool/`
  - Java CLI:
    - `Tool.java` in `com.prodstarter` package, reading args and printing greeting.
  - Documentation skeleton.

### Changed

- N/A – This is the first tagged version.

### Fixed

- N/A – This is the first tagged version.

### Removed

- N/A – This is the first tagged version.

### Security

- Initial repository setup follows common security best practices:
  - No secrets committed to the repo.
  - `.env` files ignored by default.
  - Placeholders and examples clearly marked as such, not intended for production as-is.

---

## [0.0.0] – Initial work (unreleased / pre-tag)

> Internal, pre-public milestone during project bootstrap.

- Experimented with repo structure and CLI prototypes.
- Drafted early versions of templates and documentation.
- Set up local tooling and scripts before the first public tag.

---

## Versioning Notes

- Minor versions (**x.Y.z**) will be used for:
  - adding new templates,
  - new CLI features,
  - notable documentation / website improvements.
- Patch versions (**x.y.Z**) will primarily be for:
  - bug fixes,
  - small non-breaking changes,
  - documentation tweaks.

When in doubt, we prefer **not to break** existing users of the CLI or templates.  
If a breaking change is unavoidable, it will be clearly documented in this file and in the release notes.

---

[Unreleased]: https://github.com/TheSkiF4er/ProdStarterHub/compare/v0.1.0...HEAD  
[0.1.0]: https://github.com/TheSkiF4er/ProdStarterHub/releases/tag/v0.1.0
