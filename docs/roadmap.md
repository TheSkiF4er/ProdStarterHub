# ProdStarterHub Roadmap

This document describes the **high-level roadmap** for **ProdStarterHub**:  
where we are now, where we’re going, and how you can influence the direction.

> ⚠️ Important: This roadmap is **aspirational**, not a contract.  
> Priorities may change based on community feedback, ecosystem changes, and real-world usage.

---

## 🎯 Vision

**ProdStarterHub** aims to be:

> “The easiest way to start a real, production-oriented project in any popular stack — and learn from it.”

Concretely, that means:

- **High-quality starter templates** across many stacks and languages.
- A **simple CLI** to discover, scaffold, and (eventually) customize projects.
- **Great documentation** and guides that teach real-world patterns.
- A **global community** sharing templates, improvements, and translations.

---

## 🧱 Guiding principles

These principles shape every milestone:

1. **Production mindset**  
   Templates should be realistic, not just “Hello World”.

2. **Learn by doing**  
   Every template is also a mini-course (tutorials, architecture docs, tasks).

3. **Consistency**  
   Common patterns across languages where it makes sense (naming, structure, docs).

4. **Polygot, not poly-chaos**  
   Many stacks, but curated. Quality > quantity.

5. **Community-first**  
   Clear contribution rules, good issue templates, and responsive maintainers.

6. **Safe evolution**  
   Prefer additive, non-breaking changes; document breaking ones clearly.

---

## 📌 Versioning Overview

ProdStarterHub aims to follow **Semantic Versioning**:

- **MAJOR** – breaking changes (CLI behavior, template structure contracts)
- **MINOR** – new features, new templates, improvements
- **PATCH** – bug fixes, small tweaks, documentation updates

Planned milestones:

- **v0.1** – Core foundation (alpha)
- **v0.2** – Template expansion & stack coverage
- **v0.3** – AI-assisted flows & smart UX
- **v0.4** – Ecosystem, gallery & advanced docs
- **v1.0** – Stable platform & “gold” templates

Below is a more detailed look at each stage.

---

## 🥚 v0.1 – Foundation (Alpha)

> Status: **Target baseline** – core pieces in place, “early alpha”.

### Goals

- Make ProdStarterHub **usable end-to-end** for early adopters.
- Solidify repository structure, CLI basics, and a first set of templates.
- Document how to contribute and propose new templates.

### Core deliverables

#### CLI (`prodstarter`)

- `init` – interactive project scaffolding.
- `list` – list templates from `core/templates-registry.json`.
- `doctor` – basic environment checks (Node, pnpm, Docker presence).
- Clear error messages and `--help` output.

#### Templates

A curated set of **initial templates**, including:

- Web:
  - Next.js SaaS (TypeScript)
  - Laravel Monolith (PHP)
  - Rails Marketplace (Ruby)
- API:
  - FastAPI REST API (Python)
  - Django REST API (Python, DRF)
  - Node.js REST API (Express, JS)
  - Kotlin Spring Boot API
  - ASP.NET Core Web API (C#)
  - Spring Boot API (Java)
- Services:
  - Go REST Service (chi)
  - Go gRPC Service
  - Node Microservice (TypeScript)
  - C++ gRPC Service
- CLI:
  - Go CLI Tool
  - C CLI Tool
  - C# CLI Tool (.NET)
  - Java CLI Tool

Each template should have at least:

- `template.json` metadata
- `README.md`, `TUTORIAL.md`, `ARCHITECTURE.md`, `TASKS.md` (even if partially filled)
- A minimal, runnable example (e.g. HTTP `/health` endpoint, CLI greeting, etc.)

#### Monorepo & tooling

- `pnpm-workspace.yaml` with a shared catalog.
- `tsconfig.base.json` for TypeScript consistency.
- `.nvmrc`, `.gitignore`, `.editorconfig`.
- GitHub Actions:
  - `ci.yml` – lint, test, build, CLI smoke test, optional website build.
  - `lint.yml` – fast lint checks per PR.

#### Docs & community

- `README.md` – multilingual intro, stacks overview, quick start.
- `CONTRIBUTING.md` – how to contribute, add templates, and follow standards.
- `CODE_OF_CONDUCT.md` – behavior guidelines.
- `CHANGELOG.md` – Keep a Changelog format.
- Issue templates:
  - `bug_report.md`
  - `feature_request.md`
  - `template_proposal.md`
- Docs:
  - `docs/getting-started.md`
  - `docs/cli-usage.md`
  - `docs/roadmap.md` (this file)

---

## 🌱 v0.2 – Template Expansion & Stack Coverage

> Focus: **More stacks, better quality, refined DX.**

### Goals

- Cover more **common real-world use cases** (not just “hello world”).
- Improve **tests, Docker support, and optional CI config** per template.
- Start refining **DX (developer experience)** inside templates.

### Potential features

#### CLI

- `list` filters:
  - `--type` (web/api/service/cli)
  - `--language` (typescript/python/go/etc.)
  - `--json` output for tools.
- `init` enhancements:
  - `--template <id>`
  - `--name <project-name>`
  - Non-interactive mode for CI and scripts.
  - Better validation and clearer errors.

#### Templates

- Add templates for more specific use cases, such as:
  - E-commerce starter (web + API).
  - Dashboard / admin panel starters.
  - “Backend for frontend” (BFF) templates.
- Improve existing templates with:
  - Docker & docker-compose that “just work”.
  - Minimal but meaningful test suites.
  - Seed data examples.
  - Better `.env.example` files.

#### Docs

- Template-specific guides:
  - “Deploy FastAPI template to X”
  - “Deploy Next.js SaaS template to Y”
- More “choose your stack” guidance:
  - Decision trees
  - Examples of when to pick which stack.

#### Quality & automation

- Template validation:
  - CI checks that ensure every `templates/*/*/` has required docs.
  - CI checks that `templates-registry.json` and `template.json` match schema.
- Basic “template health” signals:
  - Does it build?
  - Does it pass tests?
  - Are docs present?

---

## 🧠 v0.3 – AI & Smart UX

> Focus: **AI-assisted generation & smarter CLI UX.**

### Goals

- Let users **describe what they want**, not just choose from a list.
- Make the CLI smarter at recommending and customizing templates.
- Introduce deeper **introspection** of templates and code.

### Potential features

#### CLI & AI

- `ai-customize` command:
  - Accepts a natural-language description of the desired app.
  - Suggests the best template(s) and a stack.
  - Optionally customizes:
    - Entity/model skeletons
    - Basic routes / endpoints
    - Folder naming and configuration.

- Smart recommendations for:
  - Beginner-friendly stacks
  - High-performance stacks
  - Enterprise stacks

#### UX improvements

- More expressive terminal UI:
  - Searchable template list
  - Grouped templates (web/api/service/cli)
  - Flags to hide “experimental” templates.

- “Dry run” mode:
  - Show what would be generated without writing files.

#### Template introspection

- CLI commands to inspect a template:
  - Show its features, complexity, required tools.
  - Show its docs paths (tutorial, architecture, tasks).
  - Show runtime requirements (Node/Python/Go version, etc.).

---

## 🧬 v0.4 – Ecosystem, Gallery & Advanced Docs

> Focus: **Community, examples, and “real-world” depth.**

### Goals

- Showcase what people **actually build** using ProdStarterHub.
- Provide more **advanced documentation**: patterns, scaling, security basics.
- Solidify multi-language docs & translations.

### Potential features

#### Ecosystem & gallery

- “Built with ProdStarterHub”:
  - A curated list of open-source or public projects using templates.
  - Example configs for popular hosts: Render, Railway, Fly.io, AWS, etc.

- Example integration patterns:
  - Frontend template + API template + service template.
  - Multi-service patterns (gRPC + REST + message queues).

#### Docs

- Deep-dive guides:
  - “From starter to production: checklist”
  - “Scaling FastAPI / Go / Laravel / Rails for real traffic”
  - “Security basics for each template type”

- Multi-language docs:
  - Key guides translated into several major languages.
  - Clear structure for adding and updating translations.

#### Templates & quality

- More advanced templates:
  - Domain-driven design (DDD) examples.
  - Hexagonal / clean architecture examples.
  - Event-driven services.

- “Template maturity levels”:
  - `experimental` → `alpha` → `beta` → `stable` → `gold`
  - Criteria for each level (tests, docs, adoption, maintenance).

---

## 🏁 v1.0 – Stable Platform & “Gold” Templates

> Focus: **Stability, clarity, and maintaining a strong core set of templates.**

### Goals

- Declare the CLI **stable**: commands and flags won’t break unexpectedly.
- Maintain a set of **“gold” templates** with strong guarantees.
- Clarify how ProdStarterHub fits into long-term developer workflows.

### Core elements

#### CLI

- Stable set of commands and flags:
  - `init`, `list`, `doctor`, `ai-customize` (if implemented).
- Backwards-compatible behavior where possible.
- Clear deprecation policy for future changes.

#### “Gold” templates

A curated set of templates that meet strict standards:

- High test coverage.
- Strong docs (including diagrams and security notes).
- Regularly updated dependencies.
- Known deployment paths with examples.

Candidates could include:

- Next.js SaaS (TypeScript).
- FastAPI REST API (Python).
- Go REST Service (chi).
- Rails Marketplace (Ruby).
- Laravel Monolith (PHP).
- ASP.NET Core Web API (C#).
- Spring Boot API (Java).

#### Governance & maintenance

- Clear maintainership model:
  - Template maintainers.
  - CLI maintainers.
- Regular release cadence:
  - Monthly or quarterly minor releases.
  - Patch releases as needed for bugs/security.

---

## 🧭 Cross-cutting themes

In parallel with version milestones, some efforts run continuously:

### 🔐 Security

- Ensure no secrets committed in templates.
- Encourage safe defaults:
  - CSRF protection, rate limiting, secure headers (where relevant).
- Provide basic security checklists per template type.

### 🧪 Testing & CI

- Encourage tests for each template.
- Provide ready-to-use CI snippets (GitHub Actions, etc.).
- Validate templates in ProdStarterHub’s own CI.

### 🌍 Localization & accessibility

- Multilingual documentation for core guides.
- Consider i18n in some templates (e.g., Next.js).
- Encourage accessible frontend defaults.

---

## 🧑‍💻 How to influence the roadmap

You can shape this roadmap:

1. **Open issues with clear proposals**  
   - Use `[proposal]` in the title.
   - Describe the problem first, then the solution.

2. **Vote with 👍 reactions**  
   - Upvote issues and PRs you care about.

3. **Contribute templates or improvements**  
   - Especially in stacks you deeply understand.

4. **Share real-world feedback**  
   - How did a template work for your actual product?
   - What hurt, what helped, what’s missing?

---

## 📬 Feedback & Discussion

- Use **GitHub Issues** for:
  - Bugs (`Bug report`)
  - Features (`Feature request`)
  - New template ideas (`Template proposal`)

- Use Pull Requests for:
  - Docs corrections
  - Template improvements
  - New templates (after a proposal is discussed, ideally)

Every contribution — code, docs, ideas, or just a 👍 — helps make ProdStarterHub more useful for developers around the world. 💛
