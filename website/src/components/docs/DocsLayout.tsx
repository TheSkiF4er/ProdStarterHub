import { ReactNode } from "react";
import Link from "next/link";
import { PrimaryLayout } from "../layout/PrimaryLayout";

export interface DocsLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const DocsLayout: React.FC<DocsLayoutProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <PrimaryLayout title={`${title} – ProdStarterHub docs`} description={description}>
      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 lg:py-12">
        <aside className="hidden w-56 flex-shrink-0 lg:block">
          <nav className="sticky top-20 space-y-4 text-xs text-slate-200">
            <DocsGroup title="Overview">
              <DocsLink href="/docs/getting-started">Getting started</DocsLink>
              <DocsLink href="/docs/cli-usage">CLI usage</DocsLink>
              <DocsLink href="/docs/templates-overview">Templates overview</DocsLink>
            </DocsGroup>
            <DocsGroup title="Project">
              <DocsLink href="/docs/roadmap">Roadmap</DocsLink>
              <DocsLink href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO">
                GitHub repository
              </DocsLink>
              <DocsLink href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO/issues">
                Issues & support
              </DocsLink>
            </DocsGroup>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-6 border-b border-slate-800 pb-4">
            <p className="mb-1 text-[0.7rem] uppercase tracking-[0.25em] text-sky-400">
              Docs
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
              {title}
            </h1>
            {description && (
              <p className="mt-2 text-sm text-slate-300">{description}</p>
            )}
          </header>
          <article className="prose prose-invert max-w-none prose-code:text-[0.8em] prose-pre:bg-slate-950 prose-pre:text-slate-100 prose-pre:border prose-pre:border-slate-800">
            {children}
          </article>
        </div>
      </div>
    </PrimaryLayout>
  );
};

const DocsGroup: React.FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <div>
    <p className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-400">
      {title}
    </p>
    <div className="space-y-1">{children}</div>
  </div>
);

const DocsLink: React.FC<{ href: string; children: ReactNode }> = ({
  href,
  children,
}) => {
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        className="block rounded px-2 py-1 text-[0.75rem] text-slate-300 hover:bg-slate-900 hover:text-slate-50"
      >
        {children} <span className="text-[0.6rem] text-slate-500">↗</span>
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="block rounded px-2 py-1 text-[0.75rem] text-slate-300 hover:bg-slate-900 hover:text-slate-50"
    >
      {children}
    </Link>
  );
};
