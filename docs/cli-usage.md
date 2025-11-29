# ProdStarterHub CLI – Usage Guide

The **ProdStarterHub CLI** (`prodstarter`) is the main way to:

- discover available templates,
- scaffold new projects,
- (later) customize templates using AI.

This guide explains how to install, use, and debug the CLI.

---

## 📦 Installation

### Prerequisites

- **Node.js**: `>= 18.18.0` (LTS recommended)  
- **pnpm** (for local development): `>= 9`  
- **Git**: to clone and version your projects  

Check your versions:

```bash
node -v
pnpm -v
git --version
````

### Install from npm (planned)

Once the CLI is published to npm:

```bash
# Global install
npm install -g prodstarter

# Or use without global install
npx prodstarter --help
```

### Run from source (monorepo)

If you are working with the ProdStarterHub repository itself:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO.git
cd PRODSTARTERHUB_REPO

pnpm install
pnpm --filter cli build
```

You can then run:

```bash
# From repo root
node cli/dist/index.js --help

# Or via pnpm
pnpm --filter cli dev
```

---

## 🚀 Quick Start

The fastest way to get going:

```bash
prodstarter init
# or
npx prodstarter init
```

You’ll see an interactive wizard:

```text
? Choose a template:
  Next.js SaaS (TypeScript)
  FastAPI REST API (Python)
  Go REST Service (chi)
  ASP.NET Core Web API (C#)
  Spring Boot API (Java)
  ...

? Project name: my-cool-saas
```

After confirming, the CLI will:

1. Read template metadata from `core/templates-registry.json`.
2. Copy the selected template from `templates/<type>/<template-id>/`.
3. Replace basic placeholders (e.g. `{{PROJECT_NAME}}`).
4. Print final instructions (usually `cd my-cool-saas && follow README.md`).

---

## 📖 Global CLI usage

General form:

```bash
prodstarter <command> [options]
# or
npx prodstarter <command> [options]
```

Available commands (current & planned):

* `prodstarter init` – scaffold a new project from a template.
* `prodstarter list` – list available templates.
* `prodstarter doctor` – run environment checks.
* `prodstarter ai-customize` – **planned** AI-assisted customization.

You can always run:

```bash
prodstarter --help
prodstarter <command> --help
```

to see the latest options supported by your installed version.

---

## 🧩 `prodstarter init`

Scaffold a new project from a chosen template.

### Interactive mode

```bash
prodstarter init
# or
npx prodstarter init
```

Prompts you for:

1. **Template** – which starter to use
2. **Project name** – new directory name (e.g. `my-app`)

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
Done!

Next steps:
  cd my-cool-saas
  (read template README.md)
  pnpm install
  pnpm dev
```

### Non-interactive / script-friendly mode (design)

Depending on your CLI version, some (or all) of these flags may be available:

```bash
prodstarter init \
  --template nextjs-saas-typescript \
  --name my-cool-saas
```

Common flags (intended design):

* `--template <id>` / `-t <id>`
  Template `id` from `templates-registry.json`, e.g. `fastapi-python-api`.

* `--name <project-name>` / `-n <project-name>`
  Target directory for the scaffolded project.

* `--directory <path>`
  Explicit base directory (defaults to `.`).

* `--force`
  Overwrite existing directory if not empty (use with care).

If an unknown template ID is provided, the CLI should print an error and suggest:

```text
Unknown template: "foo-bar".
Use "prodstarter list" to see all available templates.
```

> **Tip:** Use non-interactive mode in CI/CD scripts, scaffolding tools, or “create-my-product” wrappers.

---

## 📜 `prodstarter list`

List all available templates.

```bash
prodstarter list
# or
npx prodstarter list
```

Example output:

```text
Available templates:

[web]
- nextjs-saas-typescript
    Name: Next.js SaaS (TypeScript)
    Language: TypeScript
    Framework: Next.js
    Features: auth, rbac, billing, postgres, docker

- laravel-monolith-php
    Name: Laravel Monolith (PHP)
    Language: PHP
    Framework: Laravel

[api]
- fastapi-python-api
    Name: FastAPI REST API (Python)
    Language: Python
    Framework: FastAPI

...
```

### Filtering (intended design)

Depending on CLI version, you may have these flags:

```bash
# Filter by language
prodstarter list --language python

# Filter by type
prodstarter list --type api

# Combined filter
prodstarter list --language typescript --type web

# Show raw JSON (useful for tooling)
prodstarter list --json
```

Possible filter values:

* `--type`: `web`, `api`, `service`, `cli`
* `--language`: `typescript`, `javascript`, `python`, `go`, `php`, `ruby`, `kotlin`, `csharp`, `java`, `c`, `cpp`

(Exact names depend on implementation; check `--help` in your version.)

---

## 🩺 `prodstarter doctor`

Run basic environment checks.

```bash
prodstarter doctor
# or
npx prodstarter doctor
```

Typical checks:

* Node.js version (matches CLI requirement).
* pnpm availability (for working in the monorepo).
* Git installed.
* Optional: Docker installed and running.

Example output:

```text
ProdStarterHub Doctor

✔ Node.js: v18.18.0
✔ pnpm: 9.0.0
✔ Git: 2.46.0
⚠ Docker: not found (optional but recommended)

Summary:
- You can use the CLI and most templates without Docker.
- For DB-backed templates, consider installing Docker or using a local database.
```

> In early versions, `doctor` may be a minimal stub that only prints a few checks. Expect it to grow over time.

---

## 🤖 `prodstarter ai-customize` (planned)

This command is reserved for a future AI-assisted flow:

```bash
prodstarter ai-customize
```

Intended behavior:

* Ask you to describe your project in natural language (any major language).
* Suggest the best template(s) from the registry.
* Optionally customize:

  * entities / models,
  * basic routes / endpoints,
  * folder naming.

Example future flow (conceptual):

```text
? Describe your project:
  "A simple SaaS app where teams can share and comment on code snippets."

Suggested stacks:
  1. Next.js SaaS (TypeScript) + Postgres
  2. Django REST API + React (future template)
  3. Go REST Service + SvelteKit (future template)

? Choose an option: 1
? Project name: code-snippets-saas
...
```

This is not guaranteed to exist in your current version; check via:

```bash
prodstarter ai-customize --help
```

---

## 📂 Template registry & metadata

The CLI uses a central file:

```text
core/templates-registry.json
```

Each entry describes a template, for example:

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

CLI behavior:

* `list` reads this file to display templates.
* `init` looks up the `id` to know **where** to copy from and what extra info to show.
* If `minCliVersion` is greater than your CLI version, it may warn or block usage.

> If you add or modify templates, always keep `templates-registry.json` in sync.

---

## 🧪 Using the CLI in CI/CD

You can scaffold, test, or validate projects in CI pipelines.

Example (GitHub Actions):

```yaml
- name: Install CLI
  run: npm install -g prodstarter

- name: Scaffold example app
  run: |
    prodstarter init \
      --template fastapi-python-api \
      --name ci-fastapi-demo

- name: Run template tests
  run: |
    cd ci-fastapi-demo
    # your stack-specific commands here
    # e.g. python -m pytest
```

Or using `npx` without global install:

```yaml
- name: Scaffold example app
  run: |
    npx prodstarter init \
      --template go-chi-rest \
      --name ci-go-demo
```

---

## 🧰 Advanced usage & tips

### 1. Changing the templates directory (design)

By default, the CLI expects templates under `templates/`.
A future option could allow a custom templates root:

```bash
prodstarter init --template nextjs-saas-typescript --name my-app \
  --templates-root ./custom-templates
```

Check your version’s `--help` to see if this is supported.

### 2. Dry run (design)

A “dry run” could show what will be created without writing files:

```bash
prodstarter init \
  --template laravel-monolith-php \
  --name preview-laravel \
  --dry-run
```

Useful for scripted tools or template validation.

### 3. Template variables

Some templates can expose variables, e.g.:

* `{{PROJECT_NAME}}`
* `{{PACKAGE_NAME}}`
* `{{SERVICE_PORT}}`

Currently, CLI replaces at least the **project name**; future versions may allow:

```bash
prodstarter init \
  --template node-service-typescript \
  --name my-service \
  --var SERVICE_PORT=8080
```

---

## 🐞 Troubleshooting

### “Command not found: prodstarter”

1. Check global installation:

   ```bash
   npm list -g --depth=0 | grep prodstarter
   ```

2. Ensure your global `npm` bin directory is on `PATH`. Example:

   ```bash
   # macOS / Linux
   export PATH="$PATH:$(npm bin -g)"
   ```

3. Or use `npx prodstarter` without global install.

---

### “Unknown command” or unexpected flags

Run:

```bash
prodstarter --help
prodstarter <command> --help
```

Your local CLI may not yet support some flags or commands described in future docs.

---

### “Unknown template” or missing template

If `init` fails with something like:

```text
Unknown template: "xyz".
```

Check:

* Does `core/templates-registry.json` contain that `id`?
* Does the `path` actually exist?
* Is the `type`/`language` filter hiding it (`list --type api`, etc.)?

If you’re working with a fork:

* Ensure you committed **both** the template folder and the registry update.

---

### Permission issues on non-Unix systems

On Windows or locked-down environments, you might see:

* Errors creating directories.
* Errors when running scripts.

Workarounds:

* Run shell as Administrator (only if you trust the code).
* Check antivirus or corporate security software.
* Use WSL2 on Windows for a more Unix-like environment.

---

## ❓ FAQ

**Q: Do I need to know how each template works before using it?**
A: Not really. The idea is that you can scaffold quickly and then explore the code + docs (`TUTORIAL.md`, `ARCHITECTURE.md`). But you should always review and understand before shipping to production.

**Q: Can I modify the generated project freely?**
A: Absolutely. Once generated, it’s your project. You can remove, refactor, or replace anything.

**Q: Can the CLI update a generated project when templates change?**
A: Not currently. The CLI is focused on **scaffolding** new projects, not diffing or upgrading existing ones. Template upgrades are usually manual (or via your own scripts).

**Q: Where do I report bugs or ask for features?**
A: Use GitHub Issues:

* `Bug report` – problems with CLI, templates, or docs.
* `Feature request` – new CLI features or improvements.
* `Template proposal` – new stacks or patterns you’d like to see.

---

## 🧩 Contributing to the CLI

If you want to improve the CLI itself:

1. Fork the repository and clone it locally.

2. Work inside the `cli/` package.

3. Use dev scripts:

   ```bash
   pnpm --filter cli dev
   pnpm --filter cli test
   pnpm --filter cli lint
   ```

4. When ready, open a pull request following [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

That’s it! 🎉
The **ProdStarterHub CLI** should now feel familiar:

* `init` to create new projects,
* `list` to explore templates,
* `doctor` to check your environment,
* and more to come.

If something is confusing or doesn’t work as expected, please open an issue — that’s how the tool gets better for everyone.
