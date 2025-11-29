import Link from "next/link";

export interface SiteHeaderProps {
  withBorder?: boolean;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({ withBorder = true }) => {
  return (
    <header
      className={`sticky top-0 z-40 bg-slate-950/90 backdrop-blur ${
        withBorder ? "border-b border-slate-800" : ""
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500 text-xs font-bold text-slate-950">
              PS
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">
                ProdStarterHub
              </div>
              <div className="text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                Production-ready starters
              </div>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-4 text-xs font-medium text-slate-200 md:flex">
          <HeaderLink href="/templates" label="Templates" />
          <HeaderLink href="/docs/getting-started" label="Docs" />
          <HeaderLink href="/docs/cli-usage" label="CLI" />
          <HeaderLink href="/docs/roadmap" label="Roadmap" />
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO"
            className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-slate-500 md:inline-flex"
          >
            <span className="mr-1">GitHub</span>
            <span className="text-[0.65rem]">↗</span>
          </a>
          <Link
            href="/templates"
            className="inline-flex items-center rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400"
          >
            Start now
          </Link>
        </div>
      </div>
    </header>
  );
};

interface HeaderLinkProps {
  href: string;
  label: string;
}

const HeaderLink: React.FC<HeaderLinkProps> = ({ href, label }) => (
  <Link
    href={href}
    className="rounded-full px-3 py-1 text-xs text-slate-200 hover:bg-slate-900"
  >
    {label}
  </Link>
);
