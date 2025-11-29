import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>ProdStarterHub – Production-ready starter kits for modern stacks</title>
        <meta
          name="description"
          content="ProdStarterHub gives you production-oriented starter templates for web apps, APIs, services, and CLI tools in your favorite languages."
        />
        <meta
          name="keywords"
          content="starter templates, boilerplate, nextjs, fastapi, go, laravel, rails, spring boot, asp.net core, cli, microservices"
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-50">
        {/* Hero */}
        <section className="border-b border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-950/90">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-12 pt-16 md:flex-row md:items-center md:pb-16 md:pt-20">
            {/* Left column */}
            <div className="max-w-xl">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                ProdStarterHub
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Production-ready starter kits,
                <span className="block text-sky-400">in the stack you actually use.</span>
              </h1>
              <p className="mt-4 text-sm text-slate-300 md:text-base">
                Stop re-building the same boilerplate again and again. ProdStarterHub gives
                you curated, production-oriented templates for web apps, APIs, services,
                and CLI tools across popular languages like TypeScript, Python, Go, PHP,
                Ruby, C#, Java, C/C++, and Kotlin.
              </p>

              {/* CTAs */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/templates"
                  className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  Browse templates
                  <span className="ml-2 text-xs">→</span>
                </Link>

                <Link
                  href="/docs/getting-started"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 shadow-sm shadow-slate-900/40 transition hover:border-slate-500"
                >
                  Getting started guide
                </Link>
              </div>

              {/* Terminal snippet */}
              <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs font-mono text-slate-200 shadow-sm shadow-slate-900">
                <div className="mb-2 flex items-center justify-between text-[0.7rem] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    Quick start
                  </span>
                  <span className="text-slate-500">Node ≥ 18.18.0</span>
                </div>
                <pre className="overflow-x-auto text-[0.7rem] leading-relaxed">
                  <code>
                    {`# Once published to npm:\n`}
                    {`npm install -g prodstarter\n`}
                    {`prodstarter init\n\n`}
                    {`# Or via npx:\n`}
                    {`npx prodstarter init`}
                  </code>
                </pre>
              </div>

              {/* Stacks line */}
              <p className="mt-4 text-[0.7rem] uppercase tracking-[0.22em] text-slate-500">
                C · C++ · C# · Java · JavaScript · TypeScript · Python · Go · PHP · Ruby ·
                Kotlin
              </p>
            </div>

            {/* Right column: highlights */}
            <div className="flex-1 md:pl-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FeatureCard
                  title="Ship in days, not weeks"
                  body="Skip boilerplate and start from templates that already include environment config, health checks, and sensible defaults."
                  badge="Speed"
                />
                <FeatureCard
                  title="Learn from real code"
                  body="Each template comes with a tutorial, architecture notes, and practice tasks to deepen your understanding."
                  badge="Learning"
                />
                <FeatureCard
                  title="Polyglot by design"
                  body="Use the same mental model across TypeScript, Python, Go, PHP, Ruby, C#, Java, C/C++, and Kotlin."
                  badge="Languages"
                />
                <FeatureCard
                  title="Built for collaboration"
                  body="Contribute new templates, improve existing ones, or translate docs for your local developer community."
                  badge="Community"
                />
              </div>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                  What you get with each template
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Templates are more than boilerplate. They are small, opinionated
                  reference projects that show how to structure code for production.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <InfoItem
                title="Production-oriented defaults"
                body="Environment configuration, health checks, Docker stubs, logging hooks, and basic tests where it makes sense."
              />
              <InfoItem
                title="Structured documentation"
                body="Each template ships with README, TUTORIAL, ARCHITECTURE, and TASKS, so you always know how and why things work."
              />
              <InfoItem
                title="Consistent layout"
                body="Different stacks, similar structure. That makes it easier to jump between TypeScript, Python, Go, and more."
              />
            </div>
          </div>
        </section>

        {/* Stacks overview */}
        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                  Stacks & template types
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-300">
                  Start with what you know, then explore other languages and frameworks
                  using familiar patterns.
                </p>
              </div>
              <Link
                href="/templates"
                className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-slate-500"
              >
                View full catalog
                <span className="ml-1 text-[0.65rem]">↗</span>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
              <StackCard
                title="Web apps"
                examples="Next.js, Laravel, Rails"
                desc="SaaS dashboards, monoliths, and marketplace-style apps."
              />
              <StackCard
                title="APIs"
                examples="FastAPI, Django REST, Express, Spring Boot, ASP.NET Core"
                desc="REST and gRPC APIs powering web and mobile clients."
              />
              <StackCard
                title="Services"
                examples="Go REST, Go gRPC, Node TS, C++ gRPC"
                desc="Microservices and backend components for distributed systems."
              />
              <StackCard
                title="CLI tools"
                examples="Go, C, C#, Java"
                desc="Developer tools, automation scripts, and small utilities."
              />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-b border-slate-800 bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                How ProdStarterHub fits into your workflow
              </h2>
              <p className="mt-2 text-sm text-slate-300 md:text-base">
                Use it once to bootstrap your product, or many times to explore new stacks
                and architectures.
              </p>
            </div>

            <ol className="mx-auto grid max-w-4xl gap-4 text-sm text-slate-200 md:grid-cols-3">
              <li className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-sky-400">
                  1. Choose a template
                </p>
                <p>
                  Run <code className="rounded bg-slate-950 px-1 py-0.5">prodstarter list</code>{" "}
                  or visit the{" "}
                  <Link
                    href="/templates"
                    className="text-sky-400 underline-offset-2 hover:underline"
                  >
                    templates catalog
                  </Link>{" "}
                  to pick the stack and type you need.
                </p>
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-sky-400">
                  2. Scaffold your project
                </p>
                <p>
                  Run{" "}
                  <code className="rounded bg-slate-950 px-1 py-0.5">
                    prodstarter init
                  </code>{" "}
                  (or{" "}
                  <code className="rounded bg-slate-950 px-1 py-0.5">
                    npx prodstarter init
                  </code>
                  ), give your project a name, and start coding.
                </p>
              </li>
              <li className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
                <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-sky-400">
                  3. Learn & customize
                </p>
                <p>
                  Follow the included tutorial and architecture docs, then adapt the
                  structure to your own domain, team, and deployment environment.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/* Community / contribution */}
        <section className="bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
            <div className="grid gap-6 md:grid-cols-[2fr,3fr] md:items-center">
              <div>
                <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                  Built in the open, designed for a global community
                </h2>
                <p className="mt-3 text-sm text-slate-300 md:text-base">
                  ProdStarterHub becomes more valuable with every template, translation,
                  and improvement. Whether you are a TypeScript fan, a Go backend
                  engineer, a PHP or Ruby veteran, or a JVM/NET developer, you can help
                  shape the ecosystem.
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-200">
                  <li>• Add or refine templates for your favorite stack.</li>
                  <li>• Improve documentation and architecture examples.</li>
                  <li>• Translate key docs into your local language.</li>
                  <li>• Share real-world feedback from production use.</li>
                </ul>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO"
                    className="inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm shadow-slate-900/40 hover:bg-white"
                  >
                    View on GitHub
                    <span className="ml-2 text-xs">↗</span>
                  </a>
                  <Link
                    href="/docs/roadmap"
                    className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 hover:border-slate-500"
                  >
                    Project roadmap
                  </Link>
                </div>
              </div>

              <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200 shadow-sm shadow-slate-900">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">
                  Contribution snapshot
                </p>
                <ul className="space-y-2">
                  <li>
                    <span className="font-semibold text-sky-300">Templates</span>: web,
                    API, services, and CLI across multiple languages.
                  </li>
                  <li>
                    <span className="font-semibold text-sky-300">Docs</span>: getting
                    started, CLI usage, template overviews, and roadmap.
                  </li>
                  <li>
                    <span className="font-semibold text-sky-300">Governance</span>:
                    CONTRIBUTING, code of conduct, issue & PR templates.
                  </li>
                  <li>
                    <span className="font-semibold text-sky-300">Future</span>: AI-assisted
                    starter customization, “gold” templates, real-world examples.
                  </li>
                </ul>
                <p className="mt-2 text-[0.7rem] text-slate-400">
                  Start by reading{" "}
                  <a
                    href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO/blob/main/CONTRIBUTING.md"
                    className="text-sky-400 underline-offset-2 hover:underline"
                  >
                    CONTRIBUTING.md
                  </a>{" "}
                  and opening a discussion or proposal issue.
                </p>
              </div>
            </div>

            <p className="mt-10 border-t border-slate-800 pt-4 text-center text-[0.7rem] text-slate-500">
              Build faster. Learn better. Help others — in any stack and any language.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};

const FeatureCard: React.FC<{
  title: string;
  body: string;
  badge: string;
}> = ({ title, body, badge }) => (
  <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm shadow-slate-900">
    <div className="mb-2 flex items-center justify-between">
      <span className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-slate-300">
        {badge}
      </span>
    </div>
    <h3 className="mb-1 text-sm font-semibold text-slate-50">{title}</h3>
    <p className="text-xs text-slate-300">{body}</p>
  </div>
);

const InfoItem: React.FC<{ title: string; body: string }> = ({ title, body }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-900">
    <h3 className="mb-1 text-sm font-semibold text-slate-50">{title}</h3>
    <p className="text-xs text-slate-300">{body}</p>
  </div>
);

const StackCard: React.FC<{
  title: string;
  examples: string;
  desc: string;
}> = ({ title, examples, desc }) => (
  <div className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-900">
    <h3 className="mb-1 text-sm font-semibold text-slate-50">{title}</h3>
    <p className="text-[0.7rem] text-slate-400">Examples: {examples}</p>
    <p className="mt-2 text-xs text-slate-300">{desc}</p>
  </div>
);

export default HomePage;
