import { format } from "date-fns";

/** UK candidate-facing date/time format used consistently across activity and tracking views, e.g. "8 September 2026 · 09:15". */
export function formatApplicationActivityDate(iso: string): string {
  return format(new Date(iso), "d MMMM yyyy · HH:mm");
}
