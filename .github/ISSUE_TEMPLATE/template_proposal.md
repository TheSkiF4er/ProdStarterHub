---
name: 🧩 Template proposal
about: Propose a new starter template (web, API, service, CLI) for ProdStarterHub
title: "[TEMPLATE] "
labels: ["template", "enhancement"]
assignees: []
---

> Thank you for proposing a new template for **ProdStarterHub**! 🙌  
> A good proposal focuses on the *use case* and *design* first, then the implementation details.

---

## 1. Summary

**What template do you want to add?**

- Short name (human-friendly):  
  > e.g. `Next.js + tRPC SaaS`, `Go Hexagonal REST Service`, `Laravel Multi-tenant SaaS`

- Suggested template ID (folder name):  
  > e.g. `nextjs-trpc-saas`, `go-hex-rest-service`, `laravel-multitenant-saas`

- Template type:
  - [ ] Web
  - [ ] API
  - [ ] Service / microservice
  - [ ] CLI

---

## 2. Stack details

**Programming language(s) and main framework(s):**

- Language:  
  - [ ] JavaScript
  - [ ] TypeScript
  - [ ] Python
  - [ ] Go
  - [ ] PHP
  - [ ] Ruby
  - [ ] C#
  - [ ] Java
  - [ ] C
  - [ ] C++
  - [ ] Other: `...`

- Primary framework / runtime / stack:  
  > e.g. `Next.js`, `FastAPI`, `Django REST Framework`, `Laravel`, `Rails`, `Spring Boot`, `ASP.NET Core`, `chi`, `gRPC`, `Node HTTP`, `.NET console`

- Additional key libraries (if any):  
  > e.g. `Prisma`, `tRPC`, `Redux Toolkit`, `PostgreSQL driver`, `ORM`, etc.

---

## 3. Target use cases

**What is this template *for*? Who should use it?**

Describe the main scenarios:

- Example app types (SaaS, marketplace, internal tools, dashboards, CLI utilities, etc.)
- Example users:
  - Beginner / intermediate / advanced developers?
  - Backend devs / full-stack devs / DevOps / data engineers?

> Why is this template useful to many developers, not just a very niche case?

---

## 4. Proposed features

**What should this template provide out of the box?**

Check all that apply and add details:

- [ ] Basic project structure
- [ ] Auth
  - [ ] Email/password
  - [ ] OAuth / SSO
  - [ ] API tokens / JWT
- [ ] RBAC / permissions
- [ ] Database
  - [ ] PostgreSQL
  - [ ] MySQL / MariaDB
  - [ ] SQLite
  - [ ] Other: `...`
- [ ] Migrations
- [ ] API style
  - [ ] REST
  - [ ] gRPC
  - [ ] GraphQL
  - [ ] tRPC / RPC-style
- [ ] Background jobs / workers
- [ ] Logging & monitoring hooks
- [ ] Testing setup
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] E2E tests
- [ ] Docker / Docker Compose
- [ ] Example CI config
- [ ] Example seed data / fixtures
- [ ] Deployment hints (Heroku, Fly.io, Railway, Docker Swarm, Kubernetes, etc.)
- [ ] Other key features:

```text
List any other important features or integrations you’d like to see.
````

---

## 5. Directory & files layout (proposal)

**Where should the template live, and what does its structure look like?**

* Proposed folder path:

```text
templates/<type>/<template-id>/
# Example:
# templates/web/nextjs-trpc-saas/
# templates/api/go-hex-rest-service/
```

* Proposed high-level structure:

```text
templates/<type>/<template-id>/
  ├─ template.json
  ├─ README.md
  ├─ TUTORIAL.md
  ├─ ARCHITECTURE.md
  ├─ TASKS.md
  ├─ docker-compose.yml          (if applicable)
  ├─ Dockerfile                   (if applicable)
  ├─ .env.example                 (if applicable)
  └─ src/                         (or app/, cmd/, etc. depending on stack)
```

If your stack suggests a different structure (e.g. `cmd/`, `internal/` for Go, or specific conventions for Rails/Laravel/Spring/.NET), describe it here:

```text
Explain the rationale behind the structure and how it matches ecosystem best practices.
```

---

## 6. template.json & registry entry (draft)

**Draft metadata for `template.json` and `core/templates-registry.json`.**

> Don’t worry about being perfect; this just helps us understand intent.

```json
{
  "id": "your-template-id",
  "name": "Human Friendly Template Name",
  "type": "web | api | service | cli",
  "language": "TypeScript | Python | Go | PHP | Ruby | C# | Java | C | C++ | ...",
  "framework": "Next.js | FastAPI | Laravel | Rails | Spring Boot | ASP.NET Core | chi | gRPC | ...",
  "features": ["auth", "rbac", "postgres", "docker", "tests"],
  "recommendedFor": ["saas", "dashboard", "microservices", "cli-tools"],
  "minCliVersion": "0.1.0"
}
```

---

## 7. Documentation plan

Every template should ship with:

* `README.md` – what it is, how to run it
* `TUTORIAL.md` – step-by-step guide
* `ARCHITECTURE.md` – structure and design decisions
* `TASKS.md` – exercises for learners

**What should these docs cover for your template?**

* Key concepts and flows to explain
* Specific topics that are often confusing in this stack
* Any diagrams / architecture overviews you consider important

```text
Describe how you imagine the docs helping users build and learn from this template.
```

---

## 8. Example flow / demo

**Give a short user story** of someone using this template:

> For example:
>
> 1. Create a new project from this template.
> 2. Configure `.env` with DB credentials.
> 3. Run migrations and start the dev server.
> 4. Visit `/signup` page, create an account.
> 5. Use the dashboard to perform X/Y/Z.

A short pseudo-walkthrough is very helpful:

```text
Step-by-step bullet list describing a typical “hello world” with this template.
```

---

## 9. Complexity & trade-offs

**How complex is this template compared to others?**

* [ ] Very simple (minimal starter, good for beginners)
* [ ] Moderate (some patterns and abstractions, good for intermediate devs)
* [ ] Advanced (domain-driven, hexagonal, event-driven, etc.)

**Trade-offs / design choices:**

* Why this framework / pattern and not another?
* Anything intentionally *not* included (e.g. “no frontend yet”, “no billing integration”, etc.)?

```text
Explain any important trade-offs that reviewers should be aware of.
```

---

## 10. Maintenance & ownership

**Are you willing to help maintain this template?**

* [ ] Yes, I can help maintain it (fix bugs, update deps, etc.)
* [ ] Maybe, I can occasionally help
* [ ] No, I’m just proposing the idea

If yes/maybe:

* How comfortable are you with this stack?

  * [ ] Beginner
  * [ ] Intermediate
  * [ ] Advanced
* Are you okay with:

  * [ ] Reviewing issues related to this template
  * [ ] Reviewing PRs that touch this template

---

## 11. Prior art / inspirations

Are there existing projects or starters that inspire this template?

* Links to repos, articles, tutorials, or boilerplates:

  * `https://github.com/...`
  * `https://example.com/blog/...`

What do you like about them and what would you improve?

```text
Explain how your proposal is similar and what makes it unique or better for this project.
```

---

## 12. Additional context

Anything else we should consider?

* Possible future extensions
* Ideas for integration with other templates
* Notes about performance, security, or scaling

```text
Add any extra context, concerns, or thoughts here.
```

---

Thank you for proposing a new template for **ProdStarterHub** 🌍
Well-thought-out templates help developers all over the world start real projects faster and learn modern stacks more easily.
