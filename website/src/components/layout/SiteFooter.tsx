import Link from "next/link";

export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/95">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-[0.7rem] text-slate-500 md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} ProdStarterHub. Built with ❤️ for developers
          around the world.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/docs/getting-started"
            className="text-slate-400 hover:text-sky-400"
          >
            Getting started
          </Link>
          <Link href="/docs/cli-usage" className="text-slate-400 hover:text-sky-400">
            CLI usage
          </Link>
          <Link href="/docs/roadmap" className="text-slate-400 hover:text-sky-400">
            Roadmap
          </Link>
          <a
            href="https://github.com/YOUR_GITHUB_USERNAME/PRODSTARTERHUB_REPO"
            className="text-slate-400 hover:text-sky-400"
          >
            GitHub
          </a>
          <span className="text-slate-600">·</span>
          <span className="text-slate-500">
            MIT licensed · Contributions welcome
          </span>
        </div>
      </div>
    </footer>
  );
};
