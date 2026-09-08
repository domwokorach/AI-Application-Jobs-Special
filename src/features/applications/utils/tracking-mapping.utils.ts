import type { CandidateTrackingEvent, InternalApplicationEvent, InternalApplicationEventType } from "@/features/applications/types/tracking.types";

/**
 * Candidate-safe copy for each internal event type that is allowed to reach the candidate.
 * Event types absent from this map (recruiter/hiring-manager "viewed" events, scores, private
 * notes) are internal-only and always map to `null` — see `toCandidateTrackingEvent`.
 */
const CANDIDATE_EVENT_COPY: Partial<Record<InternalApplicationEventType, { title: string; description: string }>> = {
  APPLICATION_SUBMITTED: {
    title: "Application submitted",
    description: "Your application has been successfully submitted and sent to Recruitment.",
  },
  RECRUITMENT_ACCEPTED: {
    title: "Recruitment review",
    description: "Your application has been reviewed by Recruitment.",
  },
  FORWARDED_TO_HIRING_MANAGER: {
    title: "Sent to Hiring Manager",
    description: "Your application has been forwarded to the Hiring Manager for further review.",
  },
  HIRING_MANAGER_REVIEW_STARTED: {
    title: "Hiring Manager review",
    description: "Your application is currently under review by the Hiring Manager.",
  },
};

/**
 * Maps an internal (recruiter-side) audit event to what the candidate is allowed to see.
 * Returns `null` for events that must stay internal-only — e.g. a recruiter or hiring manager
 * merely opening a document (`RECRUITMENT_APPLICATION_VIEWED`, `CV_VIEWED`) is not the same as
 * completing a review, and scores/notes are never candidate-facing at all.
 */
export function toCandidateTrackingEvent(event: InternalApplicationEvent): CandidateTrackingEvent | null {
  if (event.private) return null;

  const copy = CANDIDATE_EVENT_COPY[event.type];
  if (!copy) return null;

  return {
    id: event.id,
    type: event.type,
    title: copy.title,
    description: copy.description,
    occurredAt: event.occurredAt,
  };
}
