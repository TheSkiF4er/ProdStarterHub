# ProdStarterHub CLI (`prodstarter`)

> The command-line interface for **ProdStarterHub** –  
> scaffold **production-oriented starter templates** for modern stacks in seconds.

This package contains the **CLI** that powers:

- `prodstarter init` – scaffold new projects from curated templates  
- `prodstarter list` – discover available templates  
- `prodstarter doctor` – check your environment  
- *(planned)* `prodstarter ai-customize` – AI-assisted starter customization

If you just want to create apps, install the CLI and follow the examples below.  
If you want to **hack on the CLI itself**, see the **Development** section.

---

## ✨ Features

- **Multi-stack scaffolding**  
  Quickly create projects for modern stacks:

  - Web apps (Next.js, Laravel, Rails, …)  
  - REST / gRPC APIs (FastAPI, Django REST, Node, Spring Boot, ASP.NET Core, …)  
  - Microservices (Go, Node TS, C++ gRPC, …)  
  - CLI tools (Go, C, C#, Java, …)

- **Production-minded templates**  
  Templates are designed to be realistic starting points:
  - health checks, environment configuration, Docker stubs, basic tests (where applicable)

- **Monorepo-aware**  
  Reads metadata from `core/templates-registry.json` and template directories under `templates/`.

- **Script-friendly**  
  Intended to support non-interactive flags for CI & automation (evolving over time).

---

## 📦 Installation

### Prerequisites

- **Node.js**: `>= 18.18.0`
- **npm** or **pnpm**
- **Git** (for working with templates and this repo)

Check:

```bash
node -v
npm -v     # or pnpm -v
git --version
````

### Install from npm (planned)

Once released to npm:

```bash
# Global install
npm install -g prodstarter

# Verify
prodstarter --help
```

Or use the CLI without global install:

```bash
npx prodstarter --help
```

> Until the package is published, use the **local / monorepo** setup (below).

### Use from the monorepo (local development)

Clone the main repository:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO.git
cd PRODSTARTERHUB_REPO
```

Install dependencies and build:

```bash
pnpm install
pnpm --filter cli build
```

Run the CLI from the repo root:

```bash
node cli/dist/index.js --help
# or via pnpm
pnpm --filter cli dev
```

You can optionally create a shell alias:

```bash
alias prodstarter="node /path/to/PRODSTARTERHUB_REPO/cli/dist/index.js"
```

---

## 🚀 Quick Start

### Scaffold a new project

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

Scaffolding "my-cool-saas" from "nextjs-saas-typescript"...
Done!

Next steps:
  cd my-cool-saas
  (read template README.md)
  pnpm install
  pnpm dev
```

Then follow the template’s local `README.md` to run and customize your app.

---

## 🧾 CLI Commands

> Command: `prodstarter <command> [options]`
> Or: `npx prodstarter <command> [options]`

### `prodstarter init`

Scaffold a new project from a template.

```bash
prodstarter init
# or
npx prodstarter init
```

Interactive workflow:

1. Choose a template (from `core/templates-registry.json`).
2. Enter a project name.
3. The CLI copies the template directory and replaces basic placeholders.

**Non-interactive usage (design / may vary by version)**

Depending on the CLI version, you may be able to do:

```bash
prodstarter init \
  --template fastapi-python-api \
  --name my-fastapi-app
```

Intended flags:

* `--template, -t <id>` – template ID from `templates-registry.json`
* `--name, -n <name>` – project directory name
* `--directory <path>` – target directory (default: `.`)
* `--force` – overwrite non-empty directory (use with care)

> Run `prodstarter init --help` to see what your installed version supports.

---

### `prodstarter list`

List available templates from the central registry.

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
    Features: auth, rbac, postgres, docker, tests

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

**Planned filters** (may be partially implemented depending on version):

```bash
# Filter by type (web/api/service/cli)
prodstarter list --type api

# Filter by language
prodstarter list --language python

# JSON output for tooling
prodstarter list --json
```

---

### `prodstarter doctor`

Run basic environment checks.

```bash
prodstarter doctor
# or
npx prodstarter doctor
```

Typical checks:

* Node.js version
* Presence of `pnpm` (for monorepo work)
* Git availability
* Optional: Docker presence

Example:

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

In early alpha, `doctor` may be a minimal stub that will evolve over time.

---

### `prodstarter ai-customize` (planned)

Reserved for a future **AI-assisted flow**:

```bash
prodstarter ai-customize
```

Intended to:

* Ask you to describe your project in natural language.
* Recommend stacks & templates.
* Optionally customize models, endpoints, or structure.

Check if your version has it:

```bash
prodstarter ai-customize --help
```

---

## 🧱 Project Structure (CLI package)

Inside `cli/`:

```text
cli/
├─ src/
│  ├─ index.ts                 # CLI entry point (commander wiring)
│  ├─ commands/
│  │  ├─ init.ts               # `prodstarter init`
│  │  ├─ list.ts               # `prodstarter list`
│  │  └─ doctor.ts             # `prodstarter doctor`
│  ├─ services/
│  │  ├─ logger.ts             # Simple logging utilities
│  │  ├─ template-registry.ts  # Load & validate template metadata
│  │  └─ project-scaffolder.ts # Copy template -> target dir, variable substitution
│  └─ types/                   # Shared types/interfaces (optional)
│
├─ dist/                       # Compiled JS (ignored in git, created by build)
├─ tsconfig.json               # TS config for CLI only (extends repo base)
├─ package.json                # CLI package definition
└─ README.md                   # This file
```

Related files at the repo root:

* `core/templates-registry.json` – template catalog the CLI reads.
* `core/templates-schema/template.schema.json` – JSON schema for metadata.
* `templates/**` – actual template directories.

---

## 🔧 Scripts

From inside `cli/` (or via `pnpm --filter cli` at the repo root):

```bash
# Clean build artifacts
pnpm clean

# Type-check and build the CLI
pnpm build

# Type-check only
pnpm typecheck

# Run in dev mode (TS directly via ts-node)
pnpm dev

# Lint CLI source
pnpm lint

# Run unit tests
pnpm test

# Watch tests (if you’re iterating)
pnpm test:watch
```

These rely on dev dependencies such as `typescript`, `eslint`, `jest`, `ts-jest`, `rimraf`, etc., configured via `package.json` and `tsconfig.json`.

---

## 🧪 Testing

The CLI is tested using **Jest** + **ts-jest**.

Typical test layout:

```text
cli/
  src/
    commands/
      init.ts
      list.ts
      doctor.ts
    __tests__/
      init.test.ts
      list.test.ts
      doctor.test.ts
```

Run tests:

```bash
pnpm test
# or
pnpm test:watch
```

The goal of tests is to cover:

* Command wiring and argument parsing.
* Template registry loading and validation.
* File system operations (scaffolding) – ideally with mocks or temp dirs.
* Edge cases (unknown template, missing registry, invalid config).

---

## 🐞 Troubleshooting

### “`prodstarter` command not found”

* If installed globally:

  * Ensure global npm bin is on `PATH`:

    ```bash
    npm bin -g
    ```
* Otherwise, run via `npx`:

  ```bash
  npx prodstarter init
  ```
* Or use the local monorepo build:

  ```bash
  node cli/dist/index.js init
  ```

### “Unknown command” / flags don’t work

* Check help for your version:

  ```bash
  prodstarter --help
  prodstarter init --help
  ```
* Some documented features may be **planned** and not yet implemented in your local version.

### “Unknown template: X”

* Run:

  ```bash
  prodstarter list
  ```

  and confirm the template ID exists.
* Check `core/templates-registry.json` for the entry.
* Ensure the `path` in the registry actually exists in `templates/`.

---

## 🤝 Contributing

Contributions to the CLI are very welcome! 💛

Typical ways to help:

* Improve UX (better prompts, errors, progress indicators).
* Add flags and non-interactive modes (`--template`, `--name`, etc.).
* Improve validation of `templates-registry.json` and `template.json`.
* Add tests and refactor internals.

Before contributing:

1. Read the root [`CONTRIBUTING.md`](../CONTRIBUTING.md).

2. Make sure changes are focused:

   * One feature / bugfix per PR.

3. Run checks:

   ```bash
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   ```

4. Open a PR using the repository’s Pull Request template.

---

## 📜 License

The CLI is part of the **ProdStarterHub** project and is licensed under the **MIT License**.

See the root [`LICENSE`](../LICENSE) file for details.

---

> Build faster. Learn deeper. Help others — with a single CLI command:
> `prodstarter init`
