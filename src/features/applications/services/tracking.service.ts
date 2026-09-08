import "server-only";
import { addMinutes } from "date-fns";
import type { CandidateTracking, InternalApplicationEvent, TrackingStage } from "@/features/applications/types/tracking.types";
import { toCandidateTrackingEvent } from "@/features/applications/utils/tracking-mapping.utils";
import { getSubmission, type SubmissionRecord } from "./applications.service";

export { buildApplicationTimelineSteps, getNextStepMessage } from "@/features/applications/utils/application-timeline.utils";

const trackingStore = new Map<string, InternalApplicationEvent[]>();

/**
 * Seeds the recruitment-progress event log for a newly submitted application. This is a mock
 * backend, so there is no real recruiter/hiring-manager side to trigger these events — the
 * pipeline is written once, here, as a persisted record (like `submissions` in
 * applications.service.ts), matching the shape a real audit trail would produce.
 *
 * Every timestamp is a small, fixed offset in minutes after the real submission time so the
 * demo events are never in the future. Crucially, this only ever runs once per application
 * (guarded by the `has` check) — the resulting stage is read back from the stored events on
 * every request, never recomputed from how much time has elapsed since. A page left open for an
 * hour must show exactly the same status as one refreshed a second after submitting.
 */
export function seedApplicationTracking(applicationId: string, submission: SubmissionRecord): void {
  if (trackingStore.has(applicationId)) return;

  const submittedAt = new Date(submission.submittedAt);
  const at = (minutesAfterSubmission: number) => addMinutes(submittedAt, minutesAfterSubmission).toISOString();

  trackingStore.set(applicationId, [
    { id: `${applicationId}-submitted`, type: "APPLICATION_SUBMITTED", occurredAt: submission.submittedAt },
    { id: `${applicationId}-recruitment-viewed`, type: "RECRUITMENT_APPLICATION_VIEWED", occurredAt: at(2), private: true },
    { id: `${applicationId}-recruitment-accepted`, type: "RECRUITMENT_ACCEPTED", occurredAt: at(5) },
    { id: `${applicationId}-recruiter-score`, type: "RECRUITER_SCORE_RECORDED", occurredAt: at(5.5), private: true, data: { score: 8 } },
    { id: `${applicationId}-forwarded`, type: "FORWARDED_TO_HIRING_MANAGER", occurredAt: at(9) },
    { id: `${applicationId}-cv-viewed`, type: "CV_VIEWED", occurredAt: at(13), private: true },
    { id: `${applicationId}-hm-review-started`, type: "HIRING_MANAGER_REVIEW_STARTED", occurredAt: at(14) },
  ]);
}

/** Derives the candidate-visible stage strictly from which discrete events have actually been recorded. */
function deriveCurrentStage(events: InternalApplicationEvent[]): TrackingStage {
  const types = new Set(events.map((event) => event.type));
  if (types.has("HIRING_MANAGER_REVIEW_STARTED")) return "HIRING_MANAGER_REVIEW";
  if (types.has("FORWARDED_TO_HIRING_MANAGER")) return "HIRING_MANAGER_PENDING";
  if (types.has("RECRUITMENT_ACCEPTED")) return "RECRUITMENT_ACCEPTED";
  return "RECRUITMENT_PENDING";
}

export async function getApplicationTracking(applicationId: string): Promise<CandidateTracking | undefined> {
  const submission = await getSubmission(applicationId);
  if (!submission) return undefined;

  seedApplicationTracking(applicationId, submission);
  const events = trackingStore.get(applicationId) ?? [];

  return {
    applicationId,
    reference: submission.reference,
    jobTitle: submission.jobTitle,
    currentStage: deriveCurrentStage(events),
    events: events
      .map(toCandidateTrackingEvent)
      .filter((event): event is NonNullable<typeof event> => event !== null),
  };
}

