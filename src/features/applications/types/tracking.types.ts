export type TimelineStatus =
  | "COMPLETED"
  | "CURRENT"
  | "PENDING"
  | "OVERDUE"
  | "ACTION_REQUIRED"
  | "CLOSED";

export type ApplicationTimelineStep = {
  id: string;
  title: string;
  description: string;
  status: TimelineStatus;
  occurredAt?: string;
  nextStep?: boolean;
};

export type TrackingStage =
  | "RECRUITMENT_PENDING"
  | "RECRUITMENT_ACCEPTED"
  | "HIRING_MANAGER_PENDING"
  | "HIRING_MANAGER_REVIEW"
  | "NEXT_STAGE"
  | "HIRED"
  | "UNSUCCESSFUL"
  | "WITHDRAWN"
  | "CLOSED";

/**
 * The recruiter/hiring-manager-side audit event. May carry information (scores, notes, who
 * viewed what and when) that must never reach the candidate — see `toCandidateTrackingEvent`,
 * which is the only place permitted to turn one of these into candidate-facing copy.
 */
export type InternalApplicationEventType =
  | "APPLICATION_SUBMITTED"
  | "RECRUITMENT_APPLICATION_VIEWED"
  | "RECRUITMENT_ACCEPTED"
  | "FORWARDED_TO_HIRING_MANAGER"
  | "CV_VIEWED"
  | "HIRING_MANAGER_REVIEW_STARTED"
  | "RECRUITER_SCORE_RECORDED"
  | "HIRING_MANAGER_NOTE_ADDED";

export type InternalApplicationEvent = {
  id: string;
  type: InternalApplicationEventType;
  occurredAt: string;
  /** When true, this event must never be surfaced to the candidate under any wording. */
  private?: boolean;
  data?: Record<string, unknown>;
};

export type CandidateTrackingEvent = {
  id: string;
  type: InternalApplicationEventType;
  title: string;
  description?: string;
  occurredAt: string;
};

export type CandidateTracking = {
  applicationId: string;
  reference: string;
  jobTitle: string;
  currentStage: TrackingStage;
  events: CandidateTrackingEvent[];
};
