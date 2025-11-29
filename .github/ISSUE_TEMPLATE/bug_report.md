---
name: 🐛 Bug report
about: Report a reproducible problem in the CLI, templates, or docs
title: "[BUG] "
labels: ["bug"]
assignees: []
---

> Thank you for taking the time to report a bug in **ProdStarterHub** 🙏  
> Please fill out as much as you can — it helps us fix issues faster.

---

## 🐛 Summary

**Describe the bug clearly and concisely.**

Example:

> When I run `prodstarter init` and choose the FastAPI template, the generated project fails to start with an import error.

---

## 📦 What part of ProdStarterHub is affected?

> Check all that apply.

- [ ] CLI (`prodstarter` / `cli/`)
- [ ] Template – Web (`templates/web/...`)
- [ ] Template – API (`templates/api/...`)
- [ ] Template – Service / microservice (`templates/service/...`)
- [ ] Template – CLI (`templates/cli/...`)
- [ ] Docs (`README.md`, `docs/`, template docs)
- [ ] GitHub workflows / CI
- [ ] Other (please describe below)

If this is template-related, please specify:

- **Template ID / path (if known)**:  
  e.g. `nextjs-saas-typescript`, `templates/api/fastapi-python-api/`

---

## 🧪 Steps to reproduce

> Please provide clear steps so we can reproduce the issue.

1. Run `...`
2. Answer prompts with:
   - Template: `...`
   - Project name: `...`
3. Run `...` inside the generated project
4. Observe error: `...`

**Minimal example (commands):**

```bash
# Example
prodstarter init
# (choose: ...)
cd my-project
pnpm install
pnpm dev
````

---

## ✅ Expected behavior

> What did you expect to happen?

Example:

> The development server should start without errors and the `/health` endpoint should return `{"status":"ok"}`.

---

## 🧨 Actual behavior

> What actually happened? Include full error messages if possible.

```text
Paste logs / stack traces / error messages here
```

Screenshots (if relevant):

> Drag & drop screenshots or attach them here.

---

## 🧩 Environment

> Please provide details about your system.

* **OS**:

  * [ ] macOS
  * [ ] Linux
  * [ ] Windows
  * [ ] Other: `...`

* **OS version**:
  e.g. `macOS 14.5`, `Ubuntu 22.04`, `Windows 11`

* **Shell (if relevant)**:
  e.g. `bash`, `zsh`, `PowerShell`

* **Node.js version** (`node -v`):
  e.g. `v18.18.0`

* **pnpm version** (`pnpm -v`):
  e.g. `9.x`

* **ProdStarter CLI version** (if installed globally) (`prodstarter --version`):
  e.g. `0.1.0`

* **Project created from**:

  * [ ] Latest main branch (cloned repo)
  * [ ] Released npm package (`npm i -g prodstarter`)
  * [ ] Other (describe): `...`

---

## 🧱 Template-specific details (if applicable)

If the bug happens in a generated project:

* **Template type**:

  * [ ] Web
  * [ ] API
  * [ ] Service / microservice
  * [ ] CLI

* **Template language / stack**:

  * [ ] JavaScript / TypeScript
  * [ ] Python (FastAPI / Django)
  * [ ] Go
  * [ ] PHP (Laravel)
  * [ ] Ruby (Rails)
  * [ ] C#
  * [ ] Java
  * [ ] C / C++
  * [ ] Other: `...`

* **Template name / folder**:
  e.g. `Next.js SaaS (TypeScript)`, `templates/web/nextjs-saas-typescript/`

* **Did you modify the generated code before the bug appeared?**

  * [ ] No, bug appears in a fresh scaffolded project
  * [ ] Yes (describe changes briefly below)

Description of local modifications (if any):

```text
What did you change before it broke?
```

---

## 🔍 Additional context

> Anything else we should know? Links, references, similar issues, etc.

* Related issues / PRs (if any):
  e.g. `Closes #123`, `Similar to #456`

* Is this a regression (did it work in a previous version)?

  * [ ] Yes
  * [ ] No
  * [ ] Not sure

If **yes**, which version worked before?

```text
e.g. CLI v0.0.9, template version as of commit abc123
```

Anything else:

```text
Add any other context, configs, or ideas that might help us debug.
```

---

Thank you for helping improve **ProdStarterHub** 💛
We’ll review your report and get back to you as soon as we can.
