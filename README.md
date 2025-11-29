<h1 align="center">ProdStarterHub</h1>

<p align="center">
  <b>Production‑ready starter kits & templates for modern apps — in any stack</b><br/>
  <sub>C · C++ · C# · Java · JavaScript · TypeScript · Python · Go · PHP · Ruby · Kotlin</sub>
</p>

<p align="center">
  <a href="https://github.com/TheSkiF4er/ProdStarterHub/actions">
    <img src="https://github.com/TheSkiF4er/ProdStarterHub/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://www.npmjs.com/package/prodstarter">
    <img src="https://img.shields.io/npm/v/prodstarter.svg" alt="npm" />
  </a>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License: MIT" />
  <img src="https://img.shields.io/badge/status-early%20alpha-orange.svg" alt="Status: alpha" />
</p>

---

## 📖 Overview

**ProdStarterHub** is a monorepo and CLI tool that gives you **production‑oriented starter templates** for:

- Web applications  
- REST / gRPC APIs  
- Microservices  
- CLI tools  

across the most popular languages and ecosystems:

> **C · C++ · C# · Java · JavaScript · TypeScript · Python · Go · PHP · Ruby · Kotlin**

Each template is designed to be both:

- **Practical** – something you can actually build a real product on top of  
- **Educational** – something you can learn from, step by step

Every template comes with:

- `README.md` – how to run & configure
- `TUTORIAL.md` – step‑by‑step “build this app” guide
- `ARCHITECTURE.md` – how the project is structured and why
- `TASKS.md` – practice tasks to extend and improve the template

---

## ✨ Key Features

- **Multi‑stack support**  
  One repo, many stacks: JS/TS, Python, Go, PHP, Ruby, Kotlin, C, C++, C#, Java.

- **Production‑first design**  
  Focus on real‑world needs: auth, RBAC, DB, background jobs, tests, Docker, CI (where applicable).

- **Learning by doing**  
  Each template doubles as a mini‑course with tutorials and architecture notes.

- **Simple CLI**  
  A single command (`prodstarter init`) guides you through choosing a template and bootstrapping a new project.

- **Extensible & community‑driven**  
  Clear rules for adding new templates, improving existing ones, and translating docs.

- **AI‑ready (planned)**  
  Future `ai-customize` mode: describe your app in natural language, let the CLI choose a stack and generate a customized starter.

---

## 🧰 Supported Languages & Stacks

ProdStarterHub aims to support modern, widely used stacks:

- **JavaScript / TypeScript**
  - Next.js
  - Node.js (Express, plain HTTP, microservices)
- **Python**
  - FastAPI
  - Django + Django REST Framework
- **Go**
  - REST with chi
  - gRPC services
  - CLI tools
- **PHP**
  - Laravel (monolith)
- **Ruby**
  - Ruby on Rails (marketplace / monolith)
- **Kotlin & Java**
  - Spring Boot APIs
- **C# / .NET**
  - ASP.NET Core Web API
  - .NET console apps
- **C / C++**
  - CLI utilities
  - C++ gRPC skeletons

You do **not** need to know all of these. Pick the stack you like; you can always explore others later.

---

## 🗂 Repository Structure

High‑level layout (simplified):

```text
prodstarter-hub/
├─ cli/                # TypeScript CLI: `prodstarter`
├─ website/            # Optional Next.js docs/landing site
├─ core/
│  ├─ templates-schema/       # JSON schema for template metadata
│  └─ templates-registry.json # list of all templates
├─ templates/
│  ├─ web/                    # web apps (SaaS, monoliths, marketplaces)
│  ├─ api/                    # REST / RPC APIs
│  ├─ service/                # services, microservices, gRPC
│  └─ cli/                    # CLI tools
├─ docs/                      # additional documentation
├─ .github/                   # workflows, issue templates, PR template
├─ package.json               # root package for monorepo
├─ pnpm-workspace.yaml        # pnpm workspace config
└─ tsconfig.base.json         # base TypeScript config
````

---

## 📦 Template Catalog (overview)

> The exact list and features may evolve; see
> [`core/templates-registry.json`](./core/templates-registry.json) for the current registry.

### 🌐 Web templates

| Template                  | Stack                                 | Path                                    |
| ------------------------- | ------------------------------------- | --------------------------------------- |
| Next.js SaaS (TypeScript) | Next.js, TypeScript, Postgres, Docker | `templates/web/nextjs-saas-typescript/` |
| Laravel Monolith (PHP)    | Laravel, Blade, queues, mail          | `templates/web/laravel-monolith-php/`   |
| Rails Marketplace (Ruby)  | Ruby on Rails, marketplace setup      | `templates/web/rails-marketplace-ruby/` |

### 🔌 API templates

| Template                       | Stack                           | Path                                      |
| ------------------------------ | ------------------------------- | ----------------------------------------- |
| FastAPI REST API (Python)      | FastAPI, JWT, Postgres, OpenAPI | `templates/api/fastapi-python-api/`       |
| Django REST API (Python, DRF)  | Django + DRF, auth, Postgres    | `templates/api/django-rest-python/`       |
| Node.js REST API (Express, JS) | Express, JavaScript, CORS       | `templates/api/node-express-javascript/`  |
| Kotlin Spring Boot API         | Kotlin, Spring Boot, Postgres   | `templates/api/kotlin-springboot-api/`    |
| ASP.NET Core Web API (C#)      | .NET, minimal APIs              | `templates/api/aspnetcore-webapi-csharp/` |
| Spring Boot API (Java)         | Java, Spring Boot               | `templates/api/springboot-api-java/`      |

### 🧩 Services & microservices

| Template               | Stack     | Path                                         |
| ---------------------- | --------- | -------------------------------------------- |
| Go REST Service (chi)  | Go, chi   | `templates/service/go-chi-rest/`             |
| Go gRPC Service        | Go, gRPC  | `templates/service/go-grpc-service/`         |
| Node Microservice (TS) | Node, TS  | `templates/service/node-service-typescript/` |
| C++ gRPC Service       | C++, gRPC | `templates/service/cpp-grpc-service/`        |

### 📟 CLI templates

| Template           | Stack    | Path                             |
| ------------------ | -------- | -------------------------------- |
| Go CLI Tool        | Go       | `templates/cli/go-cli-tool/`     |
| C CLI Tool         | C        | `templates/cli/c-cli-tool/`      |
| C# CLI Tool (.NET) | C#, .NET | `templates/cli/csharp-cli-tool/` |
| Java CLI Tool      | Java     | `templates/cli/java-cli-tool/`   |

---

## ⚡ Getting Started

### 1. Prerequisites

* **Node.js** ≥ 18.18.0
* **pnpm** ≥ 9
* **Git**
* **Docker** (optional, but recommended for running templates with containers)

### 2. Install the CLI (via npm)

Once the CLI is published:

```bash
# global install
npm install -g prodstarter

# or use without global install
npx prodstarter init
```

### 3. Scaffold a new project

```bash
prodstarter init
# or
npx prodstarter init
```

You will be asked:

1. Which template you want (e.g. **Next.js SaaS (TypeScript)**, **FastAPI REST API**, **ASP.NET Core Web API**, etc.)
2. Your project name.

Example:

```text
? Choose a template:
  Next.js SaaS (TypeScript)
  FastAPI REST API (Python)
  Go REST Service (chi)
  ASP.NET Core Web API (C#)
  Spring Boot API (Java)
  ...

? Project name: my-cool-saas

Scaffolding "my-cool-saas" from "nextjs-saas-typescript"...
Done! cd my-cool-saas && follow README.md
```

### 4. Run your new app

Each template has its own `README.md` with exact commands.
Typical examples:

```bash
# Node / TypeScript example
pnpm install
pnpm dev

# Python (FastAPI) example
# poetry install / pip install ...
uvicorn app.main:app --reload

# Go example
go run ./cmd/server

# .NET example
dotnet run --project src/ProdStarter.Api

# Java Spring Boot example
./mvnw spring-boot:run
# or
./gradlew bootRun
```

---

## 🧪 Running from source (monorepo)

If you are developing ProdStarterHub itself:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/REPO_NAME.git
cd REPO_NAME

pnpm install
```

Common root scripts:

```bash
# Build all workspace packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck

# Run dev scripts where available (cli, website, etc.)
pnpm dev
```

Work on a specific package:

```bash
# CLI
pnpm --filter cli dev
pnpm --filter cli build

# Website (Next.js)
pnpm --filter website dev
```

---

## 🧾 CLI Commands

> Run via `prodstarter <command>` or `npx prodstarter <command>`.

* `init`
  Interactive wizard: choose template → set project name → scaffold project.

* `list`
  Show available templates from `core/templates-registry.json`.

* `doctor`
  Basic environment checks (Node.js, Docker, etc.; initially minimal, to be expanded).

* *(planned)* `ai-customize`
  Describe your app in natural language, let AI select a stack and customize a starter.

---

## 🤝 Contributing

Contributions are very welcome: code, templates, docs, translations, and feedback.

You can:

* Add new templates (for stacks you know well).
* Improve existing templates (tests, structure, docs, Docker).
* Enhance the CLI and developer experience.
* Improve documentation or add translations.

Before contributing, please read:

* [`CONTRIBUTING.md`](./CONTRIBUTING.md)
* [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)

Basic flow:

1. Fork the repository.

2. Create a feature branch.

3. Make your changes.

4. Run checks:

   ```bash
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   ```

5. Open a pull request with a clear description of what you changed and why.

---

## 🗺 Roadmap (high‑level)

* **v0.1**

  * Core CLI (`init`, `list`, `doctor`)
  * A small set of high‑quality templates (Next.js, FastAPI, Go REST, etc.)

* **v0.2**

  * More templates (Laravel, Rails, Kotlin, ASP.NET Core, Spring Boot)
  * Better testing and Docker setups
  * Documentation improvements

* **v0.3**

  * AI‑assisted `ai-customize` command
  * Smarter template recommendations by use case

* **v0.4**

  * “Built with ProdStarterHub” gallery
  * Example open‑source projects using the templates

* **v1.0**

  * Stable CLI API
  * Well‑documented extension system for templates
  * Strong set of “gold” templates with guaranteed maintenance

---

## ⭐ Community & Support

If ProdStarterHub helps you:

* **Star the repository** on GitHub — it really helps others discover it.
* Share it with your friends, colleagues, and community.
* Show what you built using ProdStarterHub and consider contributing back improvements.

Bug reports, questions, and feature suggestions are welcome via
[GitHub Issues](https://github.com/TheSkiF4er/ProdStarterHub/issues).

---

## 📜 License

ProdStarterHub is licensed under the **MIT License**.
See [`LICENSE`](./LICENSE) for full details.

> Build faster. Learn deeper. Help others — in any stack.

```
::contentReference[oaicite:0]{index=0}
```
