import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { legalConfig } from "@/config/legal";

export interface LegalPageLayoutProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalPageLayout({ title, description, lastUpdated, children }: LegalPageLayoutProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center px-5">
          <Link className="font-serif text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" href="/">
            {legalConfig.organisationName}
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-14">
        <article className="space-y-8">
          <header className="space-y-3 border-b border-border pb-8">
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
            {description && <p className="max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>}
            {lastUpdated && <p className="text-sm text-muted-foreground">{lastUpdated}</p>}
          </header>
          <div className="space-y-8 text-sm leading-7 text-foreground sm:text-base">{children}</div>
        </article>
      </main>
      <SiteFooter organisationName={legalConfig.organisationName} />
    </div>
  );
}
