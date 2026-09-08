import type { TrackingStage } from "@/features/applications/types/tracking.types";

export type ApplicationListItem =
  | {
      kind: "draft";
      id: string;
      jobTitle: string;
      location?: string;
      lastSavedAt: string;
      percentComplete: number;
    }
  | {
      kind: "submitted";
      id: string;
      jobTitle: string;
      location?: string;
      reference: string;
      submittedAt: string;
      stage: TrackingStage;
    };

/** Most-recently-updated first — the default, useful order for a candidate's own list. */
export function sortApplicationListItems(items: ApplicationListItem[]): ApplicationListItem[] {
  const updatedAt = (item: ApplicationListItem) => (item.kind === "draft" ? item.lastSavedAt : item.submittedAt);
  return [...items].sort((a, b) => new Date(updatedAt(b)).getTime() - new Date(updatedAt(a)).getTime());
}
