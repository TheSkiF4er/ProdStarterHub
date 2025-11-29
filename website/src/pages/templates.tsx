import { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { useMemo, useState } from "react";
import fs from "fs";
import path from "path";

type TemplateType = "web" | "api" | "service" | "cli";
type TemplateComplexity = "beginner" | "intermediate" | "advanced";
type TemplateStatus = "experimental" | "alpha" | "beta" | "stable" | "deprecated";

export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  language: string;
  framework?: string;
  path: string;
  description?: string;
  features?: string[];
  recommendedFor?: string[];
  complexity?: TemplateComplexity;
  status?: TemplateStatus;
  minCliVersion?: string;
}

interface TemplatesPageProps {
  templates: Template[];
}

const humanizeLanguage = (lang: string) => {
  const lower = lang.toLowerCase();
  const mapping: Record<string, string> = {
    ts: "TypeScript",
    typescript: "TypeScript",
    js: "JavaScript",
    javascript: "JavaScript",
    py: "Python",
    python: "Python",
    go: "Go",
    golang: "Go",
    php: "PHP",
    ruby: "Ruby",
    kt: "Kotlin",
    kotlin: "Kotlin",
    csharp: "C#",
    "c#": "C#",
    java: "Java",
    c: "C",
    cpp: "C++",
    "c++": "C++",
  };
  return mapping[lower] ?? lang;
};

const humanizeType = (type: TemplateType) => {
  switch (type) {
    case "web":
      return "Web app";
    case "api":
      return "API";
    case "service":
      return "Service / Microservice";
    case "cli":
      return "CLI Tool";
    default:
      return type;
  }
};

const statusLabel = (status?: TemplateStatus) => status ?? "alpha";

const complexityLabel = (complexity?: TemplateComplexity) => complexity ?? "intermediate";

const TemplatesPage: NextPage<TemplatesPageProps> = ({ templates }) => {
  const [typeFilter, setTypeFilter] = useState<TemplateType | "all">("all");
  const [languageFilter, setLanguageFilter] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const languages = useMemo(
    () =>
      Array.from(
        new Set(
          templates
            .map((t) => humanizeLanguage(t.language))
            .sort((a, b) => a.localeCompare(b))
        )
      ),
    [templates]
  );

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (typeFilter !== "all" && t.type !== typeFilter) return false;

      if (languageFilter !== "all") {
        if (humanizeLanguage(t.language) !== languageFilter) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const haystack = [
          t.id,
          t.name,
          t.language,
          t.framework,
          t.description,
          ...(t.features ?? []),
          ...(t.recommendedFor ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [templates, typeFilter, languageFilter, search]);

  const groupedByType = useMemo(() => {
    const groups: Record<TemplateType, Template[]> = {
      web: [],
      api: [],
      service: [],
      cli: [],
    };
    for (const t of filteredTemplates) {
      groups[t.type].push(t);
    }
    return groups;
  }, [filteredTemplates]);

  return (
    <>
      <Head>
        <title>Templates | ProdStarterHub</title>
        <meta
          name="description"
          content="Browse ProdStarterHub templates for web apps, APIs, services, and CLI tools across multiple languages and stacks."
        />
      </Head>

      <main className="min-h-screen bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <header className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
              ProdStarterHub
            </p>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Template Catalog
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
              Explore production-oriented starter templates for modern stacks. Filter by
              type, language, and keywords to find the best starting point for your next
              product or experiment.
            </p>
          </header>

          {/* Filters */}
          <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm shadow-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                <FilterPill
                  label="All types"
                  active={typeFilter === "all"}
                  onClick={() => setTypeFilter("all")}
                />
                <FilterPill
                  label="Web"
                  active={typeFilter === "web"}
                  onClick={() => setTypeFilter("web")}
                />
                <FilterPill
                  label="API"
                  active={typeFilter === "api"}
                  onClick={() => setTypeFilter("api")}
                />
                <FilterPill
                  label="Service"
                  active={typeFilter === "service"}
                  onClick={() => setTypeFilter("service")}
                />
                <FilterPill
                  label="CLI"
                  active={typeFilter === "cli"}
                  onClick={() => setTypeFilter("cli")}
                />
              </div>

              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:justify-end">
                <select
                  value={languageFilter}
                  onChange={(e) =>
                    setLanguageFilter(e.target.value as typeof languageFilter)
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-sky-500/50 focus:border-sky-500 focus:ring-2 md:w-56"
                >
                  <option value="all">All languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>

                <div className="relative w-full md:w-64">
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, stack, features…"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none ring-sky-500/50 focus:border-sky-500 focus:ring-2"
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-500">
                    ⌘K
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <StatusLegend />
              <span className="h-4 w-px bg-slate-700" />
              <span>
                Showing{" "}
                <span className="font-semibold text-sky-400">
                  {filteredTemplates.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold">{templates.length}</span> templates
              </span>
            </div>
          </section>

          {/* Template groups */}
          {filteredTemplates.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-center text-sm text-slate-300">
              <p className="mb-1 font-medium">
                No templates match your current filters.
              </p>
              <p className="text-xs text-slate-400">
                Try clearing the search field or selecting a different type or language.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {(["web", "api", "service", "cli"] as TemplateType[]).map((type) => {
                const group = groupedByType[type];
                if (!group || group.length === 0) return null;

                return (
                  <section key={type} aria-labelledby={`section-${type}`}>
                    <div className="mb-3 flex items-baseline justify-between">
                      <div>
                        <h2
                          id={`section-${type}`}
                          className="text-lg font-semibold capitalize text-slate-50"
                        >
                          {humanizeType(type)}
                        </h2>
                        <p className="text-xs text-slate-400">
                          {type === "web" &&
                            "Full-stack or server-rendered web apps with modern tooling."}
                          {type === "api" &&
                            "Backend APIs and services designed to power web and mobile clients."}
                          {type === "service" &&
                            "Microservices and backend components for distributed systems."}
                          {type === "cli" &&
                            "Command-line tools and utilities for developers and operators."}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      {group.map((tpl) => (
                        <TemplateCard key={tpl.id} template={tpl} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {/* Footer note */}
          <footer className="mt-12 border-t border-slate-800 pt-6 text-xs text-slate-500">
            <p>
              Template metadata is sourced from{" "}
              <code className="rounded bg-slate-900 px-1 py-0.5 text-[0.7rem]">
                core/templates-registry.json
              </code>
              . To propose a new template or improve an existing one, open a{" "}
              <a
                href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO/issues/new?template=template_proposal.md"
                className="text-sky-400 underline-offset-2 hover:underline"
              >
                template proposal
              </a>{" "}
              in GitHub.
            </p>
          </footer>
        </div>
      </main>
    </>
  );
};

const FilterPill: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition ${
      active
        ? "border-sky-500 bg-sky-500/10 text-sky-300"
        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
    }`}
  >
    {label}
  </button>
);

const StatusLegend: React.FC = () => (
  <div className="flex flex-wrap items-center gap-2 text-[0.7rem]">
    <span className="font-semibold text-slate-300">Legend:</span>
    <LegendDot className="bg-sky-400" label="Stable / production-ready" />
    <LegendDot className="bg-emerald-400" label="Beta / usable with care" />
    <LegendDot className="bg-amber-400" label="Alpha / early-stage" />
    <LegendDot className="bg-rose-400" label="Experimental" />
  </div>
);

const LegendDot: React.FC<{ className: string; label: string }> = ({
  className,
  label,
}) => (
  <span className="inline-flex items-center gap-1">
    <span
      className={`inline-block h-2 w-2 rounded-full ${className}`}
      aria-hidden="true"
    />
    <span>{label}</span>
  </span>
);

const TemplateCard: React.FC<{ template: Template }> = ({ template }) => {
  const language = humanizeLanguage(template.language);
  const status = statusLabel(template.status);
  const complexity = complexityLabel(template.complexity);

  const statusColor =
    status === "stable"
      ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
      : status === "beta"
      ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40"
      : status === "experimental"
      ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
      : "bg-amber-500/15 text-amber-300 border-amber-500/40";

  const complexityLabelShort =
    complexity === "beginner"
      ? "Beginner"
      : complexity === "advanced"
      ? "Advanced"
      : "Intermediate";

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-slate-900">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-50">{template.name}</h3>
          <p className="mt-0.5 text-[0.75rem] text-slate-400">
            <code className="rounded bg-slate-950/60 px-1 py-0.5 text-[0.7rem] text-sky-300">
              {template.id}
            </code>{" "}
            · {humanizeType(template.type)} · {language}
            {template.framework ? ` / ${template.framework}` : ""}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wide ${statusColor}`}
          >
            {status}
          </span>
          <span className="text-[0.65rem] text-slate-400">
            Complexity:{" "}
            <span className="font-semibold text-slate-200">
              {complexityLabelShort}
            </span>
          </span>
        </div>
      </header>

      {template.description && (
        <p className="mb-3 text-xs text-slate-200">{template.description}</p>
      )}

      {template.features && template.features.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">
            Key features
          </p>
          <div className="flex flex-wrap gap-1">
            {template.features.slice(0, 6).map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center rounded-full bg-slate-800 px-2 py-0.5 text-[0.65rem] text-slate-100"
              >
                {feature}
              </span>
            ))}
            {template.features.length > 6 && (
              <span className="inline-flex items-center rounded-full bg-slate-800/70 px-2 py-0.5 text-[0.65rem] text-slate-300">
                +{template.features.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {template.recommendedFor && template.recommendedFor.length > 0 && (
        <div className="mb-3">
          <p className="mb-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">
            Recommended for
          </p>
          <p className="text-[0.7rem] text-slate-200">
            {template.recommendedFor.join(" · ")}
          </p>
        </div>
      )}

      <footer className="mt-auto flex items-center justify-between pt-2 text-[0.7rem] text-slate-400">
        <code className="rounded bg-slate-950/70 px-1 py-0.5">
          {template.path}
        </code>
        {template.minCliVersion && (
          <span>
            Requires CLI{" "}
            <span className="font-semibold text-slate-200">
              ≥ {template.minCliVersion}
            </span>
          </span>
        )}
      </footer>
    </article>
  );
};

export const getStaticProps: GetStaticProps<TemplatesPageProps> = async () => {
  // Try to resolve core/templates-registry.json from monorepo structure
  const candidates = [
    path.join(process.cwd(), "core", "templates-registry.json"),
    path.join(process.cwd(), "..", "core", "templates-registry.json"),
  ];

  let registryPath: string | null = null;
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      registryPath = candidate;
      break;
    }
  }

  if (!registryPath) {
    // eslint-disable-next-line no-console
    console.warn(
      "[ProdStarterHub] templates.tsx: core/templates-registry.json not found. The templates page will be empty."
    );
    return {
      props: {
        templates: [],
      },
    };
  }

  const raw = fs.readFileSync(registryPath, "utf8");
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      "[ProdStarterHub] templates.tsx: Failed to parse templates-registry.json:",
      error
    );
    return {
      props: {
        templates: [],
      },
    };
  }

  const templates: Template[] = Array.isArray(parsed)
    ? parsed
        .filter((entry) => entry && typeof entry === "object")
        .map((entry: any) => ({
          id: String(entry.id),
          name: String(entry.name),
          type: entry.type as TemplateType,
          language: String(entry.language),
          framework: entry.framework ? String(entry.framework) : undefined,
          path: String(entry.path),
          description: entry.description ? String(entry.description) : undefined,
          features: Array.isArray(entry.features)
            ? entry.features.map((f: unknown) => String(f))
            : [],
          recommendedFor: Array.isArray(entry.recommendedFor)
            ? entry.recommendedFor.map((f: unknown) => String(f))
            : [],
          complexity: entry.complexity as TemplateComplexity | undefined,
          status: entry.status as TemplateStatus | undefined,
          minCliVersion: entry.minCliVersion
            ? String(entry.minCliVersion)
            : undefined,
        }))
        // Basic safety filter
        .filter(
          (t) =>
            t.id &&
            t.name &&
            t.type &&
            t.language &&
            t.path
        )
    : [];

  // Sort templates by type, then language, then name
  templates.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    const langA = humanizeLanguage(a.language);
    const langB = humanizeLanguage(b.language);
    if (langA !== langB) return langA.localeCompare(langB);
    return a.name.localeCompare(b.name);
  });

  return {
    props: {
      templates,
    },
  };
};

export default TemplatesPage;
