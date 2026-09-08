import type { ApplicationStatus } from "@/types";

export type ReviewMenuAction =
  | "REVIEW_ALL"
  | "DOWNLOAD_PREVIEW"
  | "SAVE_AND_EXIT"
  | "RETURN_DASHBOARD"
  | "VIEW_SUBMITTED"
  | "DOWNLOAD_CONFIRMATION"
  | "TRACK_APPLICATION";

export type ReviewMenuGroups = {
  primary: ReviewMenuAction[];
  secondary: ReviewMenuAction[];
};

const DRAFT_ACTIONS: ReviewMenuGroups = {
  primary: ["REVIEW_ALL", "DOWNLOAD_PREVIEW"],
  secondary: ["SAVE_AND_EXIT", "RETURN_DASHBOARD"],
};

const SUBMITTED_ACTIONS: ReviewMenuGroups = {
  primary: ["VIEW_SUBMITTED", "DOWNLOAD_CONFIRMATION", "TRACK_APPLICATION"],
  secondary: ["RETURN_DASHBOARD"],
};

/**
 * Any status other than draft/ready-to-submit/submitting means the application has
 * already been sent — draft-only actions (save & exit, submit) must never resurface then.
 */
export function getReviewMenuActions(status: ApplicationStatus): ReviewMenuGroups {
  const isDraftFamily = status === "draft" || status === "ready-to-submit" || status === "submitting";
  return isDraftFamily ? DRAFT_ACTIONS : SUBMITTED_ACTIONS;
}
