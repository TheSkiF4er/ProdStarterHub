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

> 🌍 One project, many languages — both programming & spoken.

<details>
<summary><b>Multilingual short intro / Мультиязычное описание</b></summary><br/>

**English**
Create production‑ready apps in minutes with opinionated starter kits for modern stacks.

**简体中文 (Chinese)**
使用为现代技术栈精心设计的脚手架，在几分钟内创建可直接投入生产的应用。

**Español (Spanish)**
Crea aplicaciones listas para producción en minutos con plantillas de inicio pensadas para stacks modernos.

**Português (Portuguese)**
Crie apps prontos para produção em minutos com starters opinados para stacks modernos.

**हिन्दी (Hindi)**
आधुनिक स्टैक्स के लिए तैयार स्टार्टर किट्स के साथ कुछ ही मिनटों में प्रोडक्शन‑रेडी ऐप बनाएं।

**العربية (Arabic)**
أنشئ تطبيقات جاهزة للإنتاج في دقائق باستخدام حزم بداية محسّنة لأحدث التقنيات.

**Français (French)**
Créez des applications prêtes pour la production en quelques minutes grâce à des starters conçus pour les stacks modernes.

**Deutsch (German)**
Erstelle produktionsreife Anwendungen in wenigen Minuten mit durchdachten Starter‑Kits für moderne Stacks.

**Русский (Russian)**
Создавайте продакшн‑готовые приложения за минуты с продуманными стартовыми шаблонами под современные стеки.

**日本語 (Japanese)**
モダンなスタック向けに最適化されたスターターキットで、数分で本番運用可能なアプリを構築できます。

> 💡 Want docs fully in your language?
> Open an issue or PR to help translate key sections of this README and `/docs`.

</details>

---

## 📚 Table of contents

* [What is ProdStarterHub?](#-what-is-prodstarterhub)
* [Why ProdStarterHub?](#-why-prodstarterhub)
* [Stacks & templates](#-stacks--templates)
* [Quick start](#-quick-start)
* [CLI commands](#-cli-commands)
* [Multilingual docs vision](#-multilingual-docs-vision)
* [Contributing](#-contributing--как-поучаствовать)
* [Roadmap](#-roadmap)
* [Community & support](#-community--support)
* [License](#-license)

---

## ❓ What is ProdStarterHub?

**ProdStarterHub** is a monorepo + CLI that gives you **production‑ready starter templates** for:

* Web apps
* REST / gRPC APIs
* Microservices
* CLI tools

for the most popular languages: **C, C++, C#, Java, JavaScript, TypeScript, Python, Go, PHP, Ruby, Kotlin**.

Each template comes with:

* `README.md` – how to run & configure
* `TUTORIAL.md` – step‑by‑step “build this app” guide
* `ARCHITECTURE.md` – design & structure explained
* `TASKS.md` – practice tasks to go deeper

> 🇷🇺 Коротко: это “магазин” продакшн‑шаблонов под разные стеки + CLI, который разворачивает проект за пару команд.

---

## 💡 Why ProdStarterHub?

* 🚀 **Ship faster**
  Skip weeks of boilerplate — get auth, config, Docker, tests and project structure out of the box.

* 🎓 **Learn by doing**
  Each template is also a mini‑курс: читать код, повторять шаги, выполнять задачи.

* 🌐 **Use your favorite stack**
  Jump between JS/TS, Python, Go, PHP, Ruby, C#, Java, C/C++, Kotlin — всё в одной экосистеме.

* 🤝 **Built for collaboration**
  Clear contribution rules: добавить новый шаблон или улучшить существующий легко.

* 🧠 **AI‑ready (planned)**
  Future `ai-customize` command: describe your app in natural language and let the CLI pick & customize a starter.

---

## 🧰 Stacks & templates

### 🌍 Language overview

Supported languages today:

* ✅ JavaScript / TypeScript
* ✅ Python
* ✅ Go
* ✅ PHP
* ✅ Ruby
* ✅ Kotlin
* ✅ C
* ✅ C++
* ✅ C#
* ✅ Java

---

### 🌐 Web templates

| Template                      | Stack                                 | Path                                    |
| ----------------------------- | ------------------------------------- | --------------------------------------- |
| **Next.js SaaS (TypeScript)** | Next.js, TypeScript, Postgres, Docker | `templates/web/nextjs-saas-typescript/` |
| **Laravel Monolith (PHP)**    | Laravel, Blade, queues, mail          | `templates/web/laravel-monolith-php/`   |
| **Rails Marketplace (Ruby)**  | Ruby on Rails, marketplace domain     | `templates/web/rails-marketplace-ruby/` |

---

### 🔌 API templates

| Template                           | Stack                           | Path                                      |
| ---------------------------------- | ------------------------------- | ----------------------------------------- |
| **FastAPI REST API (Python)**      | FastAPI, JWT, Postgres, OpenAPI | `templates/api/fastapi-python-api/`       |
| **Django REST API (Python, DRF)**  | Django + DRF, auth, Postgres    | `templates/api/django-rest-python/`       |
| **Node.js REST API (Express, JS)** | Express, JS, CORS               | `templates/api/node-express-javascript/`  |
| **Kotlin Spring Boot API**         | Kotlin, Spring Boot, Postgres   | `templates/api/kotlin-springboot-api/`    |
| **ASP.NET Core Web API (C#)**      | .NET, minimal APIs              | `templates/api/aspnetcore-webapi-csharp/` |
| **Spring Boot API (Java)**         | Java, Spring Boot               | `templates/api/springboot-api-java/`      |

---

### 🧩 Services & microservices

| Template                           | Stack                       | Path                                         |
| ---------------------------------- | --------------------------- | -------------------------------------------- |
| **Go REST Service (chi)**          | Go, chi, clean architecture | `templates/service/go-chi-rest/`             |
| **Go gRPC Service**                | Go, gRPC                    | `templates/service/go-grpc-service/`         |
| **Node Microservice (TypeScript)** | Node, TypeScript            | `templates/service/node-service-typescript/` |
| **C++ gRPC Service**               | C++, gRPC                   | `templates/service/cpp-grpc-service/`        |

---

### 📟 CLI templates

| Template               | Stack    | Path                             |
| ---------------------- | -------- | -------------------------------- |
| **Go CLI Tool**        | Go       | `templates/cli/go-cli-tool/`     |
| **C CLI Tool**         | C        | `templates/cli/c-cli-tool/`      |
| **C# CLI Tool (.NET)** | C#, .NET | `templates/cli/csharp-cli-tool/` |
| **Java CLI Tool**      | Java     | `templates/cli/java-cli-tool/`   |

> 🔎 Full registry lives in [`core/templates-registry.json`](./core/templates-registry.json).

---

## ⚡ Quick start

### 1. Prerequisites

* Node.js (LTS) + npm / pnpm
* Git
* Docker (optional, but recommended)

### 2. Install the CLI

Once published to npm:

```bash
# global install
npm install -g prodstarter

# or without global install
npx prodstarter init
```

> 🇷🇺 Пока пакет не опубликован, можно запускать CLI из исходников.

From source:

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO.git
cd PRODSTARTERHUB_REPO

pnpm install
pnpm --filter cli build

# пример
node cli/dist/index.js list
```

### 3. Scaffold a new project

```bash
prodstarter init
# or
npx prodstarter init
```

Пример диалога:

```text
? Choose a template:
  Next.js SaaS (TypeScript)
  FastAPI REST API (Python)
  ASP.NET Core Web API (C#)
  Spring Boot API (Java)
  ...

? Project name: my-cool-saas

Scaffolding "my-cool-saas" from "nextjs-saas-typescript"...
Done! cd my-cool-saas && follow README.md
```

### 4. Run your new app

Каждый шаблон имеет свой `README.md`, но обычно это что‑то вроде:

```bash
cd my-cool-saas

# JS/TS пример
pnpm install
pnpm dev

# Python пример
# poetry install / pip install ...
# uvicorn app.main:app --reload

# Go пример
go run ./cmd/server

# .NET пример
dotnet run --project src/ProdStarter.Api

# Java пример
./mvnw spring-boot:run
# или
./gradlew bootRun
```

---

## 🧾 CLI commands

> Run via `prodstarter <command>` or `npx prodstarter <command>`

* `init`
  Interactive wizard: pick template → choose project name → scaffold app.

* `list`
  Show available templates from `core/templates-registry.json`.

* `doctor`
  Basic environment check (Node, Docker, etc. — пока простой stub).

* *(planned)* `ai-customize`
  Describe your project in natural language (English, Español, Русский, etc.), let AI pick stack + features and generate a specialized starter.

---

## 🌐 Multilingual docs vision

Мы хотим, чтобы документация была **дружелюбной к разработчикам по всему миру**:

* English – main reference / API docs
* Русский – быстрый старт и пояснения к архитектуре
* Español / Português – intro + tutorials
* Français / Deutsch – high‑level overview + contribution guides
* العربية / हिन्दी / 日本語 / 简体中文 – onboarding, FAQ, ключевые шаги

How you can help:

1. Pick a doc file (e.g. `docs/getting-started.md`).
2. Add a section like `## 🇪🇸 Español` with a translation.
3. Submit a PR labeled `translation`.

> Даже короткий перевод (5–10 ключевых абзацев) сильно снижает порог входа для новичков.

---

## 🤝 Contributing / Как поучаствовать

Contributions are very welcome — from **any language, any country** 🌍

### Ways to contribute

* Add new templates (например, специализированный e‑commerce starter).
* Improve existing ones (tests, better Docker setup, best practices).
* Translate docs into your native language.
* Enhance CLI UX (`init` flow, `doctor`, future `ai-customize`).
* Share how you built your product on top of ProdStarterHub.

### Basic guidelines

* One feature / fix per PR.
* For each template, please ensure:

  * `template.json` is present and matches `core/templates-registry.json`.
  * `README.md`, `TUTORIAL.md`, `ARCHITECTURE.md`, `TASKS.md` exist.
  * Project can be started via a simple command (`pnpm dev`, `go run`, `dotnet run`, `./mvnw spring-boot:run`, etc.).
  * Optional but great: at least minimal tests + CI steps.

Before opening a PR:

```bash
pnpm lint
pnpm test
```

Please read:

* [`CONTRIBUTING.md`](./CONTRIBUTING.md)
* [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)

---

## 🗺️ Roadmap

* [ ] **v0.1** – Core CLI (`init`, `list`, `doctor`) + 3–4 стабильных шаблона (Next.js, FastAPI, Go REST).
* [ ] **v0.2** – Добавить Laravel, Rails, Kotlin, ASP.NET Core, Spring Boot; улучшить тесты и Docker.
* [ ] **v0.3** – AI‑assisted `ai-customize`, генерация сущностей/эндпоинтов по описанию.
* [ ] **v0.4** – Примеры реальных open‑source проектов на базе ProdStarterHub.
* [ ] **v1.0** – Stable API, extensibility, multi‑language docs и чёткие гарантийные шаблоны (“gold templates”).

Have ideas? Open an issue with prefix `[proposal]` and include:

* Stack / language
* Use case
* Why it’s useful for many devs globally

---

## ⭐ Community & support

If ProdStarterHub helps you:

* ⭐ Star the repo on GitHub — это самый быстрый способ поддержать проект.
* 🔁 Share with your friends / colleagues / community.
* 🧩 Show what you built:

  * Add a link to your project in a “Built with ProdStarterHub” issue.

Каждый новый участник — будь то JS‑разработчик из Бразилии, Go‑разработчик из Германии или C#‑дев из России — делает экосистему сильнее.

---

## 📜 License

This project is licensed under the **MIT License**.
See [`LICENSE`](./LICENSE) for details.

> Build faster. Learn better. Help others — in any stack and any language.
