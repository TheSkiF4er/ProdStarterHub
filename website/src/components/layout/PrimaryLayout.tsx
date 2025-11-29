import Head from "next/head";
import { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export interface PrimaryLayoutProps {
  title?: string;
  description?: string;
  children: ReactNode;
  withHeaderBorder?: boolean;
}

export const PrimaryLayout: React.FC<PrimaryLayoutProps> = ({
  title = "ProdStarterHub – Production-ready starter kits for modern stacks",
  description = "ProdStarterHub provides production-oriented starter templates for web apps, APIs, services, and CLI tools across modern languages.",
  children,
  withHeaderBorder = true,
}) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        <meta
          name="keywords"
          content="starter templates, boilerplate, nextjs, fastapi, go, laravel, rails, spring boot, asp.net core, cli, microservices"
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
        <SiteHeader withBorder={withHeaderBorder} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </div>
    </>
  );
};
