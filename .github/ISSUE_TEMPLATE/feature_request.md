---
name: 💡 Feature request
about: Suggest an idea for the CLI, templates, docs, or ecosystem
title: "[FEAT] "
labels: ["enhancement"]
assignees: []
---

> Thank you for taking the time to suggest a feature for **ProdStarterHub** 🙌  
> Good feature requests help us understand the *problem* first, then the *solution*.

---

## 💡 Summary

**What would you like to see added or improved?**

Briefly describe the feature or change:

> Example: Add a `--template` flag to `prodstarter init` so the command can be used non-interactively.

---

## 🤔 Problem / Motivation

**What problem does this solve? Why is it important?**

- Who is affected? (e.g. CLI users, template authors, beginners, advanced users)
- What are you trying to do that is currently hard, confusing, or impossible?

Example:

> I want to run `prodstarter init` in CI and scripts without interactive prompts.
> Right now, the wizard always asks for input, which makes automation harder.

---

## ✅ Proposed solution

**How do you imagine the feature working?**

Be as specific as you like:

- For CLI changes: commands, flags, examples.
- For templates: stack, features, starter structure.
- For docs: where it should live, what topics to cover.

Examples:

- CLI API / UX:

  ```bash
  prodstarter init --template nextjs-saas-typescript --name my-app --non-interactive
````

* New template idea:

  * Type: `web`
  * Language / stack: `Next.js + tRPC + Prisma + PostgreSQL`
  * Use case: “full-stack TypeScript app with end-to-end type safety”

---

## 🧩 Scope

> What parts of ProdStarterHub does this feature touch?

* [ ] CLI (`prodstarter` / `cli/`)
* [ ] Website / docs (`website/`, `docs/`)
* [ ] Core metadata / template registry (`core/templates-registry.json`)
* [ ] Existing templates (`templates/web/...`, `templates/api/...`, etc.)
* [ ] New template(s)
* [ ] GitHub workflows / CI
* [ ] Other (please describe):

If this is mainly about **new templates**, please fill in:

* Template type:

  * [ ] Web
  * [ ] API
  * [ ] Service / microservice
  * [ ] CLI
* Template language / stack:

  * [ ] JavaScript / TypeScript
  * [ ] Python (FastAPI, Django, etc.)
  * [ ] Go
  * [ ] PHP (Laravel)
  * [ ] Ruby (Rails)
  * [ ] C#
  * [ ] Java
  * [ ] C / C++
  * [ ] Other: `...`

Proposed template name and folder (if you have one):

```text
e.g. "Next.js SaaS (TypeScript)" at templates/web/nextjs-saas-typescript/
```

---

## 🔄 Alternatives & trade-offs

**Have you considered any alternative solutions or workarounds?**

* Existing commands / templates you tried
* How this is done in other projects / tools (if relevant)
* Pros and cons of your preferred approach vs. alternatives

Example:

> Alternative: write a custom shell script that interacts with the wizard.
> Drawback: brittle and not portable between environments.

---

## ⚠️ Breaking changes

Could this feature introduce breaking changes for users?

* [ ] No breaking changes expected
* [ ] Possibly (please describe)
* [ ] Yes (definitely breaking)

If **yes** or **possibly**, please describe:

* What might break?
* Which users are impacted?
* How could we minimize the impact or offer a migration path?

```text
Explain here
```

---

## 📚 Documentation impact

Would this feature require documentation updates?

* [ ] Yes
* [ ] No
* [ ] Not sure

If **yes**, what should be documented?

* [ ] CLI usage (README / docs)
* [ ] New or updated templates
* [ ] Examples / guides / tutorials
* [ ] Changelog entry

Any specific ideas for how docs should explain this feature?

```text
Doc ideas, examples, or structure suggestions
```

---

## 🙋‍♂️ Would you like to work on this?

* [ ] Yes, I’d like to open a PR
* [ ] Maybe, I’d need some guidance
* [ ] No, I’m just sharing the idea

If you want to work on it, tell us what kind of help you might need:

```text
e.g. pointers to code, design feedback, review, etc.
```

---

## 🔍 Additional context

Anything else we should know?

* Related issues / PRs (if any):
  e.g. `Related to #123`, `Follow-up to #456`

* Inspirations from other projects or tools:
  e.g. “This is similar to how create-t3-app does ...”

Other notes:

```text
Add any extra context, links, or examples you think are helpful.
```

---

Thank you for helping shape the future of **ProdStarterHub** 🌍
Even a small idea can make a big difference for other developers.
