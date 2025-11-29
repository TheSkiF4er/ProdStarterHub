# ProdStarterHub Templates – Overview

This document gives you a **bird’s-eye view** of all ProdStarterHub templates:

- What types of templates exist
- Which languages and stacks are covered
- What each template is good for
- How to choose a template for your project
- How to read template metadata and structure

If you’re wondering **“Which starter should I pick?”**, this is the right place.

---

## 🧱 Template types

Every template belongs to one of four **types**:

1. **`web`** – Full web applications (frontends and/or server-rendered apps).
2. **`api`** – Backend APIs (REST, gRPC, etc.), often used by web/mobile clients.
3. **`service`** – Microservices or background services (REST, gRPC, internal jobs).
4. **`cli`** – Command-line tools and utilities.

Folders follow this pattern:

```text
templates/
  web/
    <template-id>/
  api/
    <template-id>/
  service/
    <template-id>/
  cli/
    <template-id>/
````

Each template directory should contain at minimum:

```text
templates/<type>/<template-id>/
  ├─ template.json       # Template metadata
  ├─ README.md           # What it is, how to run it
  ├─ TUTORIAL.md         # Step-by-step guide
  ├─ ARCHITECTURE.md     # Design & structure explained
  └─ TASKS.md            # Exercises for learners
```

---

## 🌍 Language & stack coverage

ProdStarterHub aims to support a **curated set** of popular languages and ecosystems:

* **JavaScript / TypeScript**

  * Next.js, Node.js, microservices
* **Python**

  * FastAPI, Django REST Framework
* **Go**

  * chi (REST), gRPC, CLI
* **PHP**

  * Laravel
* **Ruby**

  * Rails
* **Kotlin & Java**

  * Spring Boot APIs, CLI
* **C# / .NET**

  * ASP.NET Core Web API, console apps
* **C / C++**

  * CLI tools, gRPC services

You don’t need to know all of these. Start with the stack you’re comfortable with, and treat other templates as learning material.

---

## 📚 Template catalog (high level)

This is a **summary**; the canonical source is:

```text
core/templates-registry.json
```

Each entry looks like:

```json
{
  "id": "fastapi-python-api",
  "name": "FastAPI REST API (Python)",
  "type": "api",
  "language": "Python",
  "framework": "FastAPI",
  "path": "templates/api/fastapi-python-api",
  "features": ["rest-api", "openapi", "jwt-auth", "postgres", "docker", "tests"],
  "recommendedFor": ["apis", "microservices", "backends-for-frontends"],
  "minCliVersion": "0.1.0"
}
```

Below is a human-friendly overview.

---

## 🌐 Web templates

### 1. Next.js SaaS (TypeScript)

* **ID:** `nextjs-saas-typescript`
* **Type:** `web`
* **Language:** TypeScript
* **Framework:** Next.js
* **Path:** `templates/web/nextjs-saas-typescript/`

**What it is**

A starter for **SaaS-style web apps** built with Next.js and TypeScript.
Designed for dashboards, admin panels, and subscription-based apps.

**Key features (target)**

* Next.js app structure, routing & basic layout.
* TypeScript everywhere.
* API routes with a simple `/health` endpoint.
* PostgreSQL integration via an ORM (planned).
* Auth & RBAC stubs (e.g. `TODO` markers and doc guidance).
* Docker & docker-compose stubs.
* Minimal test setup.

**Recommended for**

* SaaS dashboards and admin panels.
* Data-heavy internal tools.
* Developers who like React + TypeScript.

**Complexity**

* **Intermediate** – expects some familiarity with React/Next.js and TypeScript.

---

### 2. Laravel Monolith (PHP)

* **ID:** `laravel-monolith-php`
* **Type:** `web`
* **Language:** PHP
* **Framework:** Laravel
* **Path:** `templates/web/laravel-monolith-php/`

**What it is**

A monolithic Laravel starter for traditional **server-rendered apps** with Blade.

**Key features (target)**

* Standard Laravel app skeleton.
* Auth scaffolding (login/registration).
* Queues & mail hooks (configured or documented).
* Docker & docker-compose stubs.
* Tests scaffold (PHPUnit).

**Recommended for**

* CRUD-heavy business apps.
* Monoliths where backend + frontend live together.
* Teams already invested in PHP/Laravel.

**Complexity**

* **Intermediate** – good if you know some basic Laravel.

---

### 3. Rails Marketplace (Ruby)

* **ID:** `rails-marketplace-ruby`
* **Type:** `web`
* **Language:** Ruby
* **Framework:** Ruby on Rails
* **Path:** `templates/web/rails-marketplace-ruby/`

**What it is**

A Rails starter oriented toward **marketplace-style** apps (buyers/sellers, listings, orders).

**Key features (target)**

* Standard Rails structure.
* Example domain: Users, Listings, Orders (planned).
* Background jobs via Active Job.
* Auth & payments as documented placeholders.
* Docker stubs and test skeletons (RSpec or Minitest).

**Recommended for**

* Marketplaces and listing-based apps.
* Teams who like Rails’ batteries included approach.
* Rapid prototyping with room to grow.

**Complexity**

* **Intermediate**.

---

## 🔌 API templates

### 1. FastAPI REST API (Python)

* **ID:** `fastapi-python-api`
* **Type:** `api`
* **Language:** Python
* **Framework:** FastAPI
* **Path:** `templates/api/fastapi-python-api/`

**What it is**

A FastAPI starter for **REST APIs** with automatic OpenAPI docs.

**Key features (target)**

* FastAPI app with a `/health` endpoint.
* OpenAPI / Swagger UI.
* JWT auth stubs.
* PostgreSQL integration via SQLAlchemy (planned).
* Docker & docker-compose stubs.
* pytest-based test skeleton.

**Recommended for**

* Backend APIs for web/mobile clients.
* Microservices in Python.
* Quick prototypes with strong typing.

**Complexity**

* **Beginner → Intermediate**.

---

### 2. Django REST API (Python, DRF)

* **ID:** `django-rest-python`
* **Type:** `api`
* **Language:** Python
* **Framework:** Django REST Framework
* **Path:** `templates/api/django-rest-python/`

**What it is**

A Django + DRF starter for **structured REST backends**.

**Key features (target)**

* Django project with DRF configured.
* Auth and admin enabled.
* PostgreSQL setup.
* Docker stubs.
* Test skeleton (pytest or Django’s test runner).

**Recommended for**

* Backends where you want Django admin plus a REST API.
* Monolith backends for web/mobile.
* Teams already familiar with Django.

**Complexity**

* **Intermediate**.

---

### 3. Node.js REST API (Express, JavaScript)

* **ID:** `node-express-javascript`
* **Type:** `api`
* **Language:** JavaScript
* **Framework:** Express
* **Path:** `templates/api/node-express-javascript/`

**What it is**

A classic **Express** starter for REST-style APIs using plain JavaScript.

**Key features (target)**

* Express server with `/health`.
* JSON parsing, basic error handling.
* CORS configuration.
* Logging hooks.
* Docker & test skeletons.

**Recommended for**

* Lightweight APIs and prototypes.
* Teams comfortable with Node but not yet using TypeScript.
* Microservices where simplicity matters more than strict typing.

**Complexity**

* **Beginner → Intermediate**.

---

### 4. Kotlin Spring Boot API

* **ID:** `kotlin-springboot-api`
* **Type:** `api`
* **Language:** Kotlin
* **Framework:** Spring Boot
* **Path:** `templates/api/kotlin-springboot-api/`

**What it is**

A Spring Boot starter using Kotlin for **modern JVM APIs**.

**Key features (target)**

* REST controller with `/health`.
* PostgreSQL integration (planned).
* Spring profiles for environments.
* Test skeleton (JUnit).

**Recommended for**

* JVM-centric teams who prefer Kotlin.
* Enterprise services and APIs.
* Use cases needing strong type safety and Spring ecosystem.

**Complexity**

* **Intermediate → Advanced**.

---

### 5. ASP.NET Core Web API (C#)

* **ID:** `aspnetcore-webapi-csharp`
* **Type:** `api`
* **Language:** C#
* **Framework:** ASP.NET Core
* **Path:** `templates/api/aspnetcore-webapi-csharp/`

**What it is**

A **.NET** Web API starter using minimal APIs or controllers.

**Key features (target)**

* `/health` endpoint using minimal API.
* Ready to extend with controllers & services.
* Dockerfile & test skeleton (xUnit or NUnit).

**Recommended for**

* Teams using C# / .NET for backends.
* Internal services in Windows or Linux environments.

**Complexity**

* **Intermediate**.

---

### 6. Spring Boot API (Java)

* **ID:** `springboot-api-java`
* **Type:** `api`
* **Language:** Java
* **Framework:** Spring Boot
* **Path:** `templates/api/springboot-api-java/`

**What it is**

A Spring Boot starter for **Java-based REST APIs**.

**Key features (target)**

* REST controller with `/health`.
* Planned PostgreSQL integration.
* Docker & test skeleton.

**Recommended for**

* Enterprise Java backends.
* Teams standardized on Spring Boot.

**Complexity**

* **Intermediate → Advanced**.

---

## 🧩 Service & microservice templates

### 1. Go REST Service (chi)

* **ID:** `go-chi-rest`
* **Type:** `service`
* **Language:** Go
* **Framework:** chi
* **Path:** `templates/service/go-chi-rest/`

**What it is**

A **Go** microservice template using `chi` for REST.

**Key features (target)**

* HTTP server with `/health`.
* Structured logging and config (planned).
* Dockerfile & docker-compose stubs.
* Go test skeleton.

**Recommended for**

* Microservices needing performance and simplicity.
* Internal APIs and system components.

**Complexity**

* **Intermediate**.

---

### 2. Go gRPC Service

* **ID:** `go-grpc-service`
* **Type:** `service`
* **Language:** Go
* **Framework:** gRPC
* **Path:** `templates/service/go-grpc-service/`

**What it is**

A **gRPC microservice** starter in Go.

**Key features (target)**

* gRPC server skeleton.
* Ready for `.proto` definitions.
* Docker & test hooks.

**Recommended for**

* Internal RPC services.
* Service meshes and polyglot systems.

**Complexity**

* **Intermediate → Advanced**.

---

### 3. Node Microservice (TypeScript)

* **ID:** `node-service-typescript`
* **Type:** `service`
* **Language:** TypeScript
* **Framework:** Node.js (HTTP or small framework)
* **Path:** `templates/service/node-service-typescript/`

**What it is**

A minimal **TypeScript** microservice skeleton.

**Key features (target)**

* Simple HTTP server with `/health`.
* Logging and configuration hooks.
* Docker & test skeletons.

**Recommended for**

* Node-based microservices.
* Background workers or lightweight backend components.

**Complexity**

* **Intermediate**.

---

### 4. C++ gRPC Service

* **ID:** `cpp-grpc-service`
* **Type:** `service`
* **Language:** C++
* **Framework:** gRPC
* **Path:** `templates/service/cpp-grpc-service/`

**What it is**

A **C++ gRPC** service starter for high-performance systems.

**Key features (target)**

* Basic C++ gRPC server main file.
* Ready to integrate `.proto` files and service implementations.
* Docker stub (planned).

**Recommended for**

* High-performance infrastructure services.
* Systems/low-level integration scenarios.

**Complexity**

* **Advanced**.

---

## 📟 CLI templates

### 1. Go CLI Tool

* **ID:** `go-cli-tool`
* **Type:** `cli`
* **Language:** Go
* **Framework:** standard library
* **Path:** `templates/cli/go-cli-tool/`

**What it is**

A **Go** CLI starter using the standard `flag` package.

**Key features (target)**

* Simple CLI with arguments.
* Logging and error handling hooks.
* Test skeleton.

**Recommended for**

* Dev tools, automation scripts, small cross-platform binaries.

**Complexity**

* **Beginner → Intermediate**.

---

### 2. C CLI Tool

* **ID:** `c-cli-tool`
* **Type:** `cli`
* **Language:** C
* **Framework:** standard library
* **Path:** `templates/cli/c-cli-tool/`

**What it is**

A **C** command-line utility skeleton.

**Key features (target)**

* Simple `main` reading `argc/argv`.
* Minimal build instructions (e.g. `gcc`).

**Recommended for**

* Low-level tools, systems utilities, embedded support.

**Complexity**

* **Intermediate**.

---

### 3. C# CLI Tool (.NET)

* **ID:** `csharp-cli-tool`
* **Type:** `cli`
* **Language:** C#
* **Framework:** .NET
* **Path:** `templates/cli/csharp-cli-tool/`

**What it is**

A **.NET console app** starter.

**Key features (target)**

* `Program.cs` reading args and printing output.
* Test skeleton (xUnit or NUnit).

**Recommended for**

* Internal tools in .NET shops.
* Scripts and automation tasks.

**Complexity**

* **Beginner → Intermediate**.

---

### 4. Java CLI Tool

* **ID:** `java-cli-tool`
* **Type:** `cli`
* **Language:** Java
* **Framework:** standard library
* **Path:** `templates/cli/java-cli-tool/`

**What it is**

A **Java** CLI starter.

**Key features (target)**

* Simple main class reading arguments.
* Basic build instructions (Maven or Gradle).

**Recommended for**

* Cross-platform CLI tools in Java.
* Internal utilities for JVM-based teams.

**Complexity**

* **Beginner → Intermediate**.

---

## 🔍 How to choose a template

A few simple heuristics:

1. **Do you need a UI?**

   * Yes → Start with a **web** template (e.g. Next.js, Laravel, Rails).
   * No → Go for an **api** or **service** template.

2. **What language do you prefer or your team uses?**

   * Python → FastAPI / Django REST.
   * JavaScript / TypeScript → Next.js, Node REST, Node microservices.
   * Go → Go REST / gRPC / CLI.
   * PHP → Laravel.
   * Ruby → Rails.
   * C# → ASP.NET Core, .NET CLI.
   * Java / Kotlin → Spring Boot.
   * C / C++ → CLI / C++ gRPC service.

3. **What complexity level do you want?**

   * Beginner-friendly:

     * Node.js REST API (Express, JS)
     * Go CLI / Java CLI / C# CLI
     * FastAPI REST API
   * Intermediate:

     * Next.js SaaS, Laravel, Rails
     * Go REST Service, Node Microservice
   * Advanced:

     * C++ gRPC Service
     * Some Spring Boot & ASP.NET scenarios

4. **What’s the main use case?**

   * SaaS / dashboards → Next.js SaaS, Laravel, Rails.
   * Backend API → FastAPI, Django REST, Node REST, Spring/ASP.NET.
   * Microservices → Go services, Node TS service, C++ gRPC.
   * CLI tools → Go/C#/Java/C.

---

## 🧾 Metadata & schema

Per-template `template.json` and `core/templates-registry.json` entries should follow:

* Schema: `core/templates-schema/template.schema.json`
* Required fields:

  * `id`, `name`, `type`, `language`, `framework`
  * `features`, `recommendedFor`, `minCliVersion`
* Optional but recommended:

  * `path`, `description`, `complexity`, `status`, `runtime`, `docs`, `docker`, `scaffolding`, `maintainers`

This makes it possible for the CLI to:

* List templates nicely (`prodstarter list`).
* Filter by type/language.
* Warn if a template requires a newer CLI version.
* Potentially use extra metadata in future AI-assisted flows.

---

## 🧩 Adding a new template

In short:

1. Pick a **unique `id`** and folder path under `templates/<type>/<id>/`.
2. Create the template code & structure.
3. Add:

   * `template.json`
   * `README.md`
   * `TUTORIAL.md`
   * `ARCHITECTURE.md`
   * `TASKS.md`
4. Update `core/templates-registry.json` with your template entry.
5. Make sure it builds and runs with simple commands; add tests where possible.
6. Open a PR using the **Template proposal** and **Contribution** guidelines.

See:

* [`CONTRIBUTING.md`](../CONTRIBUTING.md)
* Issue template: `template_proposal.md`

---

If you have ideas for **new templates** or improvements to existing ones, please open a proposal – the template ecosystem is the heart of ProdStarterHub, and your contributions help developers all over the world start real projects faster. 💛
