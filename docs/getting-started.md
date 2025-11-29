# Getting Started with ProdStarterHub

Welcome! 👋  
This guide will help you go from **zero** to a running project with **ProdStarterHub** in a few steps.

You’ll learn how to:

- Understand what ProdStarterHub is
- Install and use the CLI
- Scaffold and run your first project
- Pick a stack that fits you
- Take your next steps (learning, customizing, contributing)

---

## 1. What is ProdStarterHub?

**ProdStarterHub** is a **monorepo + CLI** that gives you **production-oriented starter templates** for:

- Web apps  
- REST / gRPC APIs  
- Microservices  
- CLI tools  

across popular stacks:

> **C · C++ · C# · Java · JavaScript · TypeScript · Python · Go · PHP · Ruby · Kotlin**

Each template includes:

- `README.md` – how to run and configure
- `TUTORIAL.md` – step-by-step “build this app” guide
- `ARCHITECTURE.md` – how it’s structured and why
- `TASKS.md` – small exercises to deepen your understanding

You can use ProdStarterHub in two main ways:

1. **As a user** – install the CLI, scaffold a project, and start building your product.  
2. **As a contributor** – improve templates, add new ones, and hack on the CLI and docs.

This guide focuses on **using** it first; at the end we’ll show how to get involved as a contributor.

---

## 2. Prerequisites

Before you start, you should have:

- **Node.js**: `>= 18.18.0`  
- **npm** or **pnpm**  
- **Git**  
- **Docker** (optional, recommended for database-based templates)

Check your versions:

```bash
node -v
npm -v      # or pnpm -v
git --version
````

If `node -v` shows something lower than `v18.18.0`, upgrade Node.js first.

---

## 3. Installing the ProdStarterHub CLI

You have two options:

### Option A: Install from npm (planned)

Once the CLI is published to npm:

```bash
# Global install
npm install -g prodstarter

# Check that it works
prodstarter --help
```

Or, to avoid a global install:

```bash
npx prodstarter --help
```

### Option B: Run from source (monorepo)

If you want to use the **latest source** (or contribute):

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO.git
cd PRODSTARTERHUB_REPO

pnpm install
pnpm --filter cli build

# Run the CLI from the repo root:
node cli/dist/index.js --help
```

You can create a shell alias if you like:

```bash
alias prodstarter="node /path/to/PRODSTARTERHUB_REPO/cli/dist/index.js"
```

---

## 4. Scaffolding your first project

The main command is:

```bash
prodstarter init
# or
npx prodstarter init
```

You’ll see an interactive wizard, something like:

```text
? Choose a template:
  Next.js SaaS (TypeScript)
  FastAPI REST API (Python)
  Go REST Service (chi)
  ASP.NET Core Web API (C#)
  Spring Boot API (Java)
  ...

? Project name: my-first-app
```

After you choose a template and a project name, the CLI will:

1. Create a new directory with your project name.
2. Copy the template files into it.
3. Replace basic placeholders (e.g. project name).
4. Print next steps.

Example:

```text
Scaffolding "my-first-app" from "nextjs-saas-typescript"...
Done!

Next steps:
  cd my-first-app
  pnpm install
  pnpm dev
```

---

## 5. Running the generated project

Each template ships with its own `README.md`, but here are **typical commands** by stack.

> Always read the template’s local `README.md` first — it wins over this generic guide.

### 5.1. Node / TypeScript (Next.js, Node services, etc.)

```bash
cd my-project

pnpm install
pnpm dev
# or
pnpm start
```

Then open the URL in your browser, often `http://localhost:3000`.

### 5.2. Python (FastAPI, Django REST)

```bash
cd my-python-api

# Install dependencies – the template README will specify:
# Example with pip:
pip install -r requirements.txt

# or with Poetry:
# poetry install

# Run app (FastAPI example):
uvicorn app.main:app --reload
# or use the command from the template README
```

Visit the documented URL (e.g. `http://localhost:8000`), and check `/health` or `/docs`.

### 5.3. Go (REST service, gRPC, CLI)

```bash
cd my-go-service

# Run REST / HTTP service:
go run ./cmd/server

# Run tests:
go test ./...
```

### 5.4. PHP / Laravel

```bash
cd my-laravel-app

composer install

# Set up the environment file:
cp .env.example .env
php artisan key:generate

# Run migrations (if configured):
php artisan migrate

# Start local server:
php artisan serve
```

### 5.5. Ruby on Rails

```bash
cd my-rails-app

bundle install

# Set up DB:
bin/rails db:create db:migrate

# Run server:
bin/rails server
```

### 5.6. C# / .NET (Web API or CLI)

```bash
cd my-dotnet-api-or-cli

dotnet restore
dotnet run
```

### 5.7. Java / Spring Boot

```bash
cd my-spring-api

# Using Maven wrapper:
./mvnw spring-boot:run

# Or using Gradle wrapper:
./gradlew bootRun
```

---

## 6. Choosing the right template

ProdStarterHub supports multiple languages and template types.
Here’s a quick cheat sheet.

### 6.1. By product type

**I want to build a SaaS / web app with a modern frontend:**

* `Next.js SaaS (TypeScript)`
  `templates/web/nextjs-saas-typescript/`
  Great if you like React / TypeScript and want a flexible frontend.

**I want a monolithic web app with server-rendered pages:**

* `Laravel Monolith (PHP)`
* `Rails Marketplace (Ruby)`

**I want a backend API:**

* `FastAPI REST API (Python)`
* `Django REST API (Python, DRF)`
* `Node.js REST API (Express, JavaScript)`
* `Kotlin Spring Boot API`
* `ASP.NET Core Web API (C#)`
* `Spring Boot API (Java)`

**I want a microservice / backend service:**

* `Go REST Service (chi)`
* `Go gRPC Service`
* `Node Microservice (TypeScript)`
* `C++ gRPC Service`

**I want a CLI tool:**

* `Go CLI Tool`
* `C CLI Tool`
* `C# CLI Tool (.NET)`
* `Java CLI Tool`

---

### 6.2. By language

* **JavaScript / TypeScript**

  * Next.js SaaS, Node REST API, Node microservice.
* **Python**

  * FastAPI REST API, Django REST API.
* **Go**

  * REST and gRPC services, CLI tool.
* **PHP**

  * Laravel monolith.
* **Ruby**

  * Rails marketplace.
* **Java / Kotlin**

  * Spring Boot APIs, CLI tool.
* **C# / .NET**

  * ASP.NET Core Web API, CLI tool.
* **C / C++**

  * CLI tool (C), gRPC service (C++).

If you’re unsure, a good starting point is:

* **Web + UI:** Next.js SaaS (TypeScript)
* **Backend-only API (Python):** FastAPI REST API
* **High-performance microservice:** Go REST Service (chi)

---

## 7. Using the CLI effectively

For a deeper dive, see [`docs/cli-usage.md`](./cli-usage.md).
Here’s a quick overview.

### 7.1. List templates

```bash
prodstarter list
```

Shows all templates along with language and framework.

Possible future filters:

```bash
# By language
prodstarter list --language python

# By type
prodstarter list --type api

# JSON output for tooling
prodstarter list --json
```

### 7.2. Scaffold without prompts (non-interactive)

If your CLI version supports it:

```bash
prodstarter init \
  --template fastapi-python-api \
  --name my-fastapi-app
```

This is handy for scripts, CI, and project generators.

### 7.3. Check your environment

```bash
prodstarter doctor
```

Runs basic checks (Node version, pnpm, Docker presence, etc.).

---

## 8. Working inside the monorepo (for contributors)

If you cloned the ProdStarterHub repo and want to develop **inside** it:

### 8.1. Install & bootstrap

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO.git
cd PRODSTARTERHUB_REPO

pnpm install
```

### 8.2. Useful root scripts

From the repo root:

```bash
# Build all packages (CLI, website, etc.)
pnpm build

# Run tests for all packages
pnpm test

# Lint all packages
pnpm lint

# Type-check all packages
pnpm typecheck

# Dev mode (runs dev scripts where defined)
pnpm dev
```

### 8.3. Working on the CLI only

```bash
pnpm --filter cli dev     # dev mode
pnpm --filter cli build   # build CLI
pnpm --filter cli test    # run CLI tests
```

---

## 9. Common pitfalls & troubleshooting

### 9.1. “Command not found: prodstarter”

* Make sure you installed it:

  ```bash
  npm install -g prodstarter
  ```

* Or use `npx` instead:

  ```bash
  npx prodstarter init
  ```

* On some systems, you may need to add the global npm bin to your `PATH`.

### 9.2. Template fails to start

* Double-check the template’s `README.md`.
* Confirm environment variables are set (`.env`, `.env.local`, etc.).
* Make sure Docker is running if the template depends on Docker databases.
* Run stack-specific tests if available (e.g. `go test ./...`, `dotnet test`, `pytest`, etc.).

If you still have issues:

* Open a **Bug report** via GitHub Issues (there’s a `bug_report` template).
* Include:

  * CLI version
  * OS
  * Node version
  * Template ID
  * Exact commands you ran
  * Error messages

---

## 10. Next steps

You have a few great options:

### 10.1. Learn from the template

* Read `TUTORIAL.md` and follow it from top to bottom.
* Check `ARCHITECTURE.md` to understand how the code is structured.
* Work through `TASKS.md` to practice modifying and extending the template.

### 10.2. Customize for your product

* Adjust project name, package names, namespaces.
* Configure database, auth, and deployment environment.
* Add features specific to your product (domains, entities, UI, integrations).

### 10.3. Contribute back

If ProdStarterHub helps you, consider contributing:

* Fix a bug or clarify documentation.
* Improve an existing template (better tests, Docker, structure).
* Add a new template for a stack you know well.
* Translate parts of the docs into your native language.

Read:

* [`CONTRIBUTING.md`](./../CONTRIBUTING.md)
* [`CODE_OF_CONDUCT.md`](./../CODE_OF_CONDUCT.md)

---

## 11. FAQ (short)

**Q: Is it safe to use these templates in production?**
A: They are **production-oriented starters**, but you must always review, test, and adapt them to your own requirements (security, performance, compliance, etc.).

**Q: Can I mix templates?**
A: Yes, but there’s no automatic “merge”. You can generate multiple projects and integrate them manually (e.g. a Go microservice talking to a Next.js frontend).

**Q: Will templates change over time?**
A: Yes. We’ll improve them as frameworks evolve. For existing projects, you’re responsible for updating your codebase; the CLI doesn’t auto-upgrade projects.

**Q: Where do I ask questions?**
A: Open a GitHub Issue tagged as a question or discussion. Be sure to include context and what you already tried.

---

You’re ready 🎉

* **Step 1:** Install the CLI or clone the repo.
* **Step 2:** Run `prodstarter init`.
* **Step 3:** Follow the template’s `README.md`.
* **Step 4:** Build something real.

If anything in this guide is confusing or missing, please open an issue to help improve it for the next developer. 💛
