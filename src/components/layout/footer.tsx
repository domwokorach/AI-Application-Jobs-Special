import { SiteFooter } from "@/components/layout/site-footer";
import { legalConfig } from "@/config/legal";

export function Footer() {
  return <SiteFooter organisationName={legalConfig.organisationName} />;
}
