import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function FormSection({
  title,
  description,
  children,
  optional = false,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  const headingId = `${title.toLowerCase().replaceAll(/[^a-z0-9]/g, "-")}-section-title`;
  return (
    <section aria-labelledby={headingId} className="space-y-section">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl" id={headingId}>{title}</h1>
          {optional && <Badge variant="secondary">Optional</Badge>}
        </div>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      <Separator />
      <div className="space-y-form">{children}</div>
    </section>
  );
}
