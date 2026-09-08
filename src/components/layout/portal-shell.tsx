import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { UserAccountMenu } from "@/components/layout/user-account-menu";
import { legalConfig } from "@/config/legal";
import { siteConfig } from "@/config/site";
import { getCandidateUser } from "@/lib/auth-session";

export async function PortalShell({ children }: { children: React.ReactNode }) {
  const account = await getCandidateUser();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link className="flex items-center gap-2 font-serif text-xl font-semibold" href="/">
            <span className="grid size-8 place-items-center rounded-full bg-primary font-sans text-sm text-primary-foreground">
              {siteConfig.name[0]}
            </span>
            {siteConfig.name}
          </Link>
          <UserAccountMenu account={account} />
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <SiteFooter className="pb-20 md:pb-0" organisationName={legalConfig.organisationName} />
    </div>
  );
}
