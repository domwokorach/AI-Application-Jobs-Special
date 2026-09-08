import { SiteFooter } from "@/components/layout/site-footer";
import { legalConfig } from "@/config/legal";

export function PortalShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <div className="flex-1">{children}</div>
      <SiteFooter className="pb-20 md:pb-0" organisationName={legalConfig.organisationName} />
    </div>
  );
}
