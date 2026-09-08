import { CheckCircle2, LoaderCircle, TriangleAlert } from "lucide-react";
import type { AutosaveStatus } from "@/hooks/use-autosave";

const labels: Record<AutosaveStatus, string> = {
  idle: "All changes saved",
  saving: "Saving…",
  saved: "All changes saved just now",
  error: "Could not save changes",
};

export function SaveStatus({ status = "saved", className }: { status?: AutosaveStatus; className?: string }) {
  const Icon = status === "error" ? TriangleAlert : status === "saving" ? LoaderCircle : CheckCircle2;
  const iconClass = status === "error" ? "text-destructive" : status === "saving" ? "animate-spin text-muted-foreground" : "text-success";
  return (
    // Fixed width + truncation keeps this a single line at every status, including the longest
    // label ("All changes saved just now") — without it, wrapping to a second line pushes
    // whatever renders after this component down whenever the autosave status changes.
    <p aria-live="polite" className={`flex w-52 min-w-0 items-center gap-1.5 text-xs text-muted-foreground ${className ?? ""}`} role="status">
      <Icon aria-hidden className={`size-3.5 shrink-0 ${iconClass}`} />
      <span className="min-w-0 truncate">{labels[status]}</span>
    </p>
  );
}
