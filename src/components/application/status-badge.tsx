import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { VariantProps } from "class-variance-authority";
import type { ApplicationStatus } from "@/types";

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"];

const statusConfig: Record<ApplicationStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Submitted", variant: "info" },
  "under-review": { label: "Under review", variant: "info" },
  interview: { label: "Interview", variant: "warning" },
  offer: { label: "Offer", variant: "success" },
  unsuccessful: { label: "Unsuccessful", variant: "destructive" },
  withdrawn: { label: "Withdrawn", variant: "outline" },
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, variant } = statusConfig[status];
  return <Badge variant={variant}>{label}</Badge>;
}
