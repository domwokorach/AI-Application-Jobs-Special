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
  return <p aria-live="polite" className={`flex items-center gap-1.5 text-xs text-muted-foreground ${className ?? ""}`}><Icon className={`size-3.5 ${iconClass}`} aria-hidden />{labels[status]}</p>;
}
