# Pull Request Template – ProdStarterHub 🧩

Thank you for contributing to **ProdStarterHub**!  
Please use this template to help us review your PR quickly and effectively.

---

## 1. Summary

**What does this PR do?**  
_A short, clear description of the change._

- (Example) Add a new FastAPI template with JWT auth
- (Example) Improve CLI `init` UX and error handling

---

## 2. Type of change

> Check all that apply.

- [ ] 🚀 New feature (non-breaking change that adds functionality)
- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] 🧩 New template (web / api / service / cli)
- [ ] 🛠 Refactor (non-breaking internal change)
- [ ] 📚 Documentation / website update
- [ ] ✅ Tests (adding or improving coverage)
- [ ] ⚠️ Breaking change (fix or feature that may break existing usage)

If **breaking change**, describe clearly:

- What breaks?
- Who is affected (CLI users, specific templates, etc.)?
- How should users migrate?

---

## 3. Scope of changes

### 3.1. Affected areas

> Check all that apply.

- [ ] CLI (`cli/`)
- [ ] Website (`website/`)
- [ ] Core metadata / registry (`core/`)
- [ ] Templates – Web (`templates/web/`)
- [ ] Templates – API (`templates/api/`)
- [ ] Templates – Service / microservices (`templates/service/`)
- [ ] Templates – CLI (`templates/cli/`)
- [ ] Docs (`docs/`, `README.md`, etc.)
- [ ] CI / GitHub workflows (`.github/workflows/`)

### 3.2. Details

_Explain what you changed, file or feature by file or feature._

- …
- …

---

## 4. New or updated templates (if applicable)

> Fill this out **only** if your PR adds or modifies templates.

**Template ID(s):**

- `templates/<type>/<template-id>/`:
  - e.g. `templates/web/nextjs-saas-typescript/`
  - e.g. `templates/api/aspnetcore-webapi-csharp/`

**Template metadata:**

- [ ] `template.json` exists for each template
- [ ] Matching entry added/updated in `core/templates-registry.json`
- [ ] `id` and `path` are consistent with folder name

**Template documentation:**

For each template, I have:

- [ ] `README.md` – basic overview & how to run
- [ ] `TUTORIAL.md` – step-by-step guide (at least a skeleton)
- [ ] `ARCHITECTURE.md` – structure & design decisions (at least a skeleton)
- [ ] `TASKS.md` – practice tasks for learners (at least a few items)

**Template quality:**

- [ ] Template can be started with a simple command  
      (e.g. `pnpm dev`, `go run ./cmd/server`, `dotnet run`, `./mvnw spring-boot:run`, etc.)
- [ ] Sensitive data (secrets, real API keys, etc.) is **not** included
- [ ] `.env.example` or docs explain required environment variables (if applicable)
- [ ] Dockerfile / docker-compose is included or explicitly noted as TODO

---

## 5. How has this been tested?

> List the tests you ran and their results. Include commands.

**CLI / root:**

- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`

**Package-specific tests (if applicable):**

```bash
# examples:
pnpm --filter cli test
pnpm --filter cli lint
pnpm --filter website dev
# template-specific commands:
# - pnpm dev
# - go test ./...
# - dotnet test
# - ./mvnw test
````

*Notes or additional testing details:*

* …

---

## 6. Screenshots / output (optional but helpful)

> If your change affects the CLI UX, website, or template behavior, add screenshots or terminal output.

* CLI demo output:

  ```text
  prodstarter list
  ...
  ```

* Web / UI screenshot:
  *Attach image(s) here*

---

## 7. Documentation updates

Does this PR require documentation updates?

* [ ] Yes
* [ ] No

If **yes**, mark which docs were updated or added:

* [ ] Root `README.md`
* [ ] `docs/` (guides, how-tos)
* [ ] Template-specific docs (`README.md`, `TUTORIAL.md`, etc.)
* [ ] Changelog (`CHANGELOG.md`)

Brief description of doc changes:

* …

---

## 8. Checklist

Please confirm that:

* [ ] My code follows the project style and conventions (`tsconfig.base.json`, lint rules, etc.).
* [ ] I have run the relevant tests and they pass.
* [ ] I have added comments where the code is complex or non-obvious.
* [ ] I have updated documentation where necessary.
* [ ] I have not committed any secrets, tokens, or sensitive data.
* [ ] My PR title is descriptive (e.g. `feat(cli): add template filter`, not `fix stuff`).

---

## 9. Additional context

Is there anything else reviewers should know?

* Related issues (e.g. `Closes #123`, `Refs #456`):
* Design decisions or trade-offs:
* Potential follow-ups or TODOs:

```text
(Explain here)
```

Thank you again for contributing to **ProdStarterHub** 💛
Your work helps developers around the world start and ship better projects faster.
