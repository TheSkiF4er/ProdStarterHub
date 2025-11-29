````markdown
# Contributing to ProdStarterHub

First of all: **thank you** for taking the time to contribute 🙌  
ProdStarterHub exists to help developers around the world start real projects faster — your contribution directly helps other people ship and learn.

This document explains how to:

- Set up the project locally
- Work on the CLI, templates, docs, and website
- Add new starter templates
- Open issues and pull requests
- Contribute translations

---

## 🧭 Code of Conduct

By participating in this project, you agree to follow our  
[**Code of Conduct**](./CODE_OF_CONDUCT.md).

In short:

- Be respectful and constructive  
- Assume good intentions  
- No harassment or discrimination of any kind

If you experience or witness unacceptable behavior, please open a confidential issue or contact the maintainers directly.

---

## 📦 Repository structure

High‑level layout:

```text
prodstarter-hub/
├─ cli/                # TypeScript CLI: `prodstarter`
├─ website/            # (optional) Next.js / docs site
├─ core/               # Shared schemas & template registry
│  ├─ templates-schema/
│  └─ templates-registry.json
├─ templates/          # All starter templates (multi-language stacks)
│  ├─ web/
│  ├─ api/
│  ├─ service/
│  └─ cli/
├─ docs/               # Additional documentation
├─ .github/            # Workflows, issue templates, PR templates
├─ package.json        # Root package for the monorepo
├─ pnpm-workspace.yaml # pnpm workspace config
└─ tsconfig.base.json  # Base TypeScript config
````

---

## 🛠 Development setup

### 1. Prerequisites

* **Node.js** ≥ 18.18.0
* **pnpm** ≥ 9
* **Git**
* **Docker** (optional but recommended, for running template stacks)

### 2. Clone the repo

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/prodstarter-hub.git
cd prodstarter-hub
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Useful root scripts

From the repo root:

```bash
# Build all workspace packages
pnpm build

# Run tests for all packages
pnpm test

# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck

# Dev mode (runs dev scripts where defined)
pnpm dev

# Clean build artifacts (where defined)
pnpm clean
```

---

## 🎛 Working on the CLI (`cli/`)

The CLI is the heart of ProdStarterHub – it loads the template registry and scaffolds projects.

### How to run the CLI in dev

```bash
# From repo root
pnpm --filter cli dev
# or
cd cli
pnpm dev
```

Suggested `dev` script (in `cli/package.json`):

```jsonc
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc -p tsconfig.json",
    "lint": "eslint src --ext .ts",
    "test": "jest"
  }
}
```

### Building and testing

```bash
# Build
pnpm --filter cli build

# Lint
pnpm --filter cli lint

# Test
pnpm --filter cli test
```

### CLI guidelines

* Prefer **TypeScript**, strict mode ON (inherited from `tsconfig.base.json`).
* Handle errors gracefully, with clear messages.
* Keep commands **fast** and **interactive**, but also script‑friendly (avoid unnecessary prompts when flags are provided).
* Avoid hard‑coding paths; use `core/templates-registry.json` and relative paths from repo root.
* If you introduce breaking changes to the CLI:

  * Update the **README** and **docs**,
  * Add notes in the PR description,
  * Consider bumping CLI version appropriately.

---

## 📚 Working on documentation (`docs/`, `README.md`, template docs)

Good documentation is as important as good code.

You can:

* Improve the main [`README.md`](./README.md)
* Add or refine guides in `docs/`
* Enhance per‑template docs:

  * `README.md`
  * `TUTORIAL.md`
  * `ARCHITECTURE.md`
  * `TASKS.md`

Guidelines:

* Write in **clear, simple English** first.
* Use examples and command snippets generously.
* Prefer short paragraphs over walls of text.
* When relevant, add links to external resources (official docs, etc.).

---

## 🌐 Working on the website (`website/`)

If the website (Next.js) is present:

```bash
pnpm --filter website dev
# usually http://localhost:3000
```

Guidelines:

* Use TypeScript in the website as well.
* Keep the site lightweight and focused:

  * Landing
  * Docs
  * Template catalog
* Keep UI neutral and accessible:

  * Semantic HTML
  * Keyboard navigation where possible
  * A11y‑friendly components

---

## 🧩 Adding or updating starter templates

This is one of the most impactful contributions you can make.

### Template categories

Under `templates/` we have:

* `templates/web/` – full web apps (SaaS, monoliths, marketplaces, etc.)
* `templates/api/` – REST or RPC APIs
* `templates/service/` – microservices, background services, gRPC, etc.
* `templates/cli/` – CLI tools

### Supported languages & stacks

We aim to support:

* JavaScript, TypeScript (Node.js, Next.js)
* Python (FastAPI, Django/DRF)
* Go
* PHP (Laravel)
* Ruby (Rails)
* Kotlin (Spring Boot)
* Java (Spring Boot)
* C# (ASP.NET Core, .NET CLI)
* C / C++

### 1. Naming & structure

Each template lives in its own folder and **must** follow this pattern:

```text
templates/<type>/<template-id>/
  ├─ template.json
  ├─ README.md
  ├─ TUTORIAL.md
  ├─ ARCHITECTURE.md
  ├─ TASKS.md
  ├─ ... (source code, Docker files, env examples, etc.)
```

**Examples:**

* `templates/web/nextjs-saas-typescript/`
* `templates/api/fastapi-python-api/`
* `templates/cli/go-cli-tool/`

### 2. `template.json` requirements

Each template MUST have a `template.json` describing metadata.

Example:

```json
{
  "id": "nextjs-saas-typescript",
  "name": "Next.js SaaS (TypeScript)",
  "type": "web",
  "language": "TypeScript",
  "framework": "Next.js",
  "features": ["auth", "rbac", "billing", "postgres", "docker", "tests"],
  "recommendedFor": ["saas", "dashboard"],
  "minCliVersion": "0.1.0"
}
```

Fields:

* `id` – unique, filesystem‑friendly ID (matches folder name).
* `name` – human‑readable name.
* `type` – one of: `web`, `api`, `service`, `cli`.
* `language` – e.g. `TypeScript`, `Python`, `Go`, `PHP`, `Ruby`, `Kotlin`, `C#`, `Java`, `C`, `C++`.
* `framework` – e.g. `Next.js`, `FastAPI`, `Django REST Framework`, `Express`, `Spring Boot`, `ASP.NET Core`, `chi`, `gRPC`, `standard-library`.
* `features` – list of key features (auth, docker, tests, etc.).
* `recommendedFor` – common use cases (`saas`, `marketplace`, `microservices`, etc.).
* `minCliVersion` – minimum CLI version required.

### 3. Register the template

Add an entry to [`core/templates-registry.json`](./core/templates-registry.json) that matches your `template.json`.

The `id` and `path` **must** be consistent with the folder name:

```json
{
  "id": "nextjs-saas-typescript",
  "name": "Next.js SaaS (TypeScript)",
  "type": "web",
  "language": "TypeScript",
  "framework": "Next.js",
  "path": "templates/web/nextjs-saas-typescript",
  "features": ["auth", "rbac", "billing", "postgres", "docker", "tests"],
  "recommendedFor": ["saas", "dashboard"],
  "minCliVersion": "0.1.0"
}
```

### 4. Minimum quality for templates

Each template should be:

* **Runnable** with minimal steps:

  * e.g. `pnpm install && pnpm dev`, or `go run ...`, or `dotnet run`, or `./mvnw spring-boot:run`.
* **Documented**:

  * `README.md` – how to run, configure, and deploy (at least locally).
  * `TUTORIAL.md` – step‑by‑step “build it yourself” guide.
  * `ARCHITECTURE.md` – layers, modules, dependencies, major decisions.
  * `TASKS.md` – small exercises for learners (e.g. “add a new entity”, “secure this endpoint”).
* **Container‑friendly** (if applicable):

  * `Dockerfile` or `docker-compose.yml`.
* **Testable**:

  * At least a minimal test setup (smoke test, health check test, etc.).

It’s okay if you mark some parts as “placeholder” in the first version (for example, billing integration, advanced auth), as long as:

* The project **runs**,
* The docs clearly state which parts are placeholders.

---

## 🌍 Translations

ProdStarterHub aims to be **multilingual** and accessible worldwide.

You can:

* Add translated sections to existing docs:

  * Example: `## 🇪🇸 Español` under `README.md`.
* Create translated guides in `docs/` (e.g. `getting-started.ru.md`).

Guidelines:

* Keep the original English section as the source of truth.
* Make translations faithful but natural in the target language.
* Mention in your PR which languages you’re adding/updating.

---

## 🐞 Reporting bugs

If you found a bug, please:

1. Check if it’s already reported in [Issues](https://github.com/YOUR_GITHUB_USERNAME/prodstarter-hub/issues).
2. If not, open a new issue and include:

   * What you were trying to do
   * Expected behavior
   * Actual behavior
   * Steps to reproduce (code snippets and commands help a lot)
   * Template / CLI version / OS / Node version

Use the provided **issue templates** whenever possible.

---

## 💡 Suggesting features / new templates

Feature ideas and template proposals are very welcome.

Guidelines:

1. Use the appropriate issue template (e.g. “Feature request”, “Template proposal”).
2. Clearly describe:

   * **What** you want to add
   * **Why** it’s useful for many developers (not just one‑off)
   * **Which stack** and use case it targets
3. If you can, propose:

   * Folder name
   * `template.json` draft
   * Rough list of features

---

## 🔀 Pull requests

### Before you open a PR

* Make sure your changes are focused on a **single concern**:

  * One template
  * One CLI feature
  * One documentation change
* Run checks locally:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Fix any issues before submitting, if possible.

### PR title

Use a clear, descriptive title, for example:

* `feat(cli): add template filtering by language`
* `feat(template): add Laravel monolith starter`
* `docs: improve getting-started guide`
* `fix(cli): handle missing templates-registry.json gracefully`

You can use Conventional Commits style if you like, but it’s not strictly enforced.

### PR description

Include:

* What you changed
* Why you changed it
* How you tested it (commands you ran)
* Screenshots or terminal output (if relevant)

If you’re adding a template:

* Link to the new folder
* Mention updates to `templates-registry.json`
* Summarize features and limitations (placeholders, TODOs)

---

## 🎯 Coding style

### TypeScript / JavaScript

* Use **TypeScript** where possible.
* Follow settings from [`tsconfig.base.json`](./tsconfig.base.json):

  * `"strict": true`
  * Avoid `any` unless absolutely necessary and justified.
* Run ESLint and Prettier via project scripts (once configured).

### Other languages

Follow idiomatic style for each ecosystem:

* Python: PEP8, type hints where reasonable
* Go: `gofmt`, `go vet`
* PHP: PSR‑12
* Ruby: RuboCop conventions (if used)
* C# / .NET: standard .NET naming & layout
* Java / Kotlin: common Spring conventions
* C / C++: clear and documented, avoid non‑portable tricks

---

## 🔐 Security

If you discover a security vulnerability:

* **Do not** open a public issue with exploit details.
* Instead, contact the maintainers privately (see contact info in repo or `SECURITY.md`, if present).
* Provide enough detail to reproduce and understand the impact.

We will work with you to responsibly address the issue.

---

## ✅ Contribution checklists

### For a new template

* [ ] Created `templates/<type>/<template-id>/`
* [ ] Added `template.json`
* [ ] Implemented minimal, runnable code
* [ ] Added:

  * [ ] `README.md`
  * [ ] `TUTORIAL.md`
  * [ ] `ARCHITECTURE.md`
  * [ ] `TASKS.md`
* [ ] Added a matching entry in `core/templates-registry.json`
* [ ] Template runs via a simple command
* [ ] (Optional but recommended) added tests & Docker setup

### For a CLI change

* [ ] Updated or added unit tests
* [ ] Ensured backward compatibility, or documented breaking changes
* [ ] Updated CLI usage in `README.md` / `docs/`
* [ ] `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build` all pass

### For docs / translations

* [ ] English source text is clear and correct
* [ ] Translations are faithful and natural
* [ ] Links and references are up to date

---

Thank you again for helping build **ProdStarterHub** 💛
Every contribution — code, docs, templates, translations, feedback — makes it more useful for developers everywhere.

```
::contentReference[oaicite:0]{index=0}
```
