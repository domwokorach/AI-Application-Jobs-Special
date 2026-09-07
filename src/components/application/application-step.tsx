import { Badge } from "@/components/ui/badge";

export function ApplicationStep({
  title,
  description,
  optional = false,
  children,
}: {
  title: string;
  description: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const headingId = `${title.toLowerCase().replaceAll(/[^a-z0-9]/g, "-")}-title`;
  return (
    <section aria-labelledby={headingId} className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl" id={headingId}>
            {title}
          </h1>
          {optional && <Badge variant="secondary">Optional</Badge>}
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      {children}
    </section>
  );
}
