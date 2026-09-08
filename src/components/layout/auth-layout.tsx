import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { legalConfig } from "@/config/legal";

export function AuthLayout({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return <div className="flex min-h-dvh flex-col bg-background"><main className="grid flex-1 place-items-center p-5"><Card className="w-full max-w-md"><CardHeader><p className="font-serif text-xl text-foreground">AI Application Fast Specialist</p><CardTitle className="pt-5 font-serif text-3xl">{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader><CardContent>{children}</CardContent></Card></main><SiteFooter organisationName={legalConfig.organisationName} /></div>;
}
