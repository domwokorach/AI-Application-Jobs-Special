import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteFooter } from "@/components/layout/site-footer";
import { legalConfig } from "@/config/legal";
import { siteConfig } from "@/config/site";

export function AuthLayout({
  children,
  description,
  title,
  maxWidthClassName = "max-w-md",
}: {
  children: React.ReactNode;
  description: string;
  title: string;
  maxWidthClassName?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <main className="grid flex-1 place-items-center p-5 py-10">
        <Card className={`w-full ${maxWidthClassName}`}>
          <CardHeader>
            <p className="font-serif text-xl text-foreground">{siteConfig.name}</p>
            <CardTitle className="pt-5 font-serif text-3xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </main>
      <SiteFooter organisationName={legalConfig.organisationName} />
    </div>
  );
}
