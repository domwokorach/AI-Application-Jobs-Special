import type {
  ApplicationTimelineStep,
  CandidateTracking,
  InternalApplicationEventType,
  TrackingStage,
} from "@/features/applications/types/tracking.types";

const NEXT_STEP_MESSAGES: Record<TrackingStage, string> = {
  RECRUITMENT_PENDING: "Recruitment will review your submitted application.",
  RECRUITMENT_ACCEPTED: "Recruitment is processing your application before it is forwarded for the next review stage.",
  HIRING_MANAGER_PENDING: "Your application is waiting for the Hiring Manager to begin their review.",
  HIRING_MANAGER_REVIEW: "The Hiring Manager is reviewing your application. We'll update you when the next stage is available.",
  NEXT_STAGE: "If your application progresses, we'll update your application status and let you know about the next step. You do not need to submit another application.",
  HIRED: "Congratulations. We'll be in touch about next steps.",
  UNSUCCESSFUL: "Thank you for applying. We encourage you to apply for future roles that match your experience.",
  WITHDRAWN: "You withdrew this application. You can apply again at any time.",
  CLOSED: "This vacancy is now closed.",
};

export function getNextStepMessage(stage: TrackingStage): string {
  return NEXT_STEP_MESSAGES[stage];
}

function eventAt(tracking: CandidateTracking, type: InternalApplicationEventType): string | undefined {
  return tracking.events.find((event) => event.type === type)?.occurredAt;
}

/**
 * Builds the fixed 5-step candidate timeline for the current stage. Status and copy for each step
 * come only from which events are on record — never from a fabricated countdown. Shared by the
 * dashboard's Recent Activity summary and the full tracking page so the two never drift apart.
 */
export function buildApplicationTimelineSteps(tracking: CandidateTracking): ApplicationTimelineStep[] {
  const stage = tracking.currentStage;
  const recruitmentReviewed = stage !== "RECRUITMENT_PENDING";
  const forwarded = stage === "HIRING_MANAGER_PENDING" || stage === "HIRING_MANAGER_REVIEW" || stage === "NEXT_STAGE";
  const reviewStarted = stage === "HIRING_MANAGER_REVIEW" || stage === "NEXT_STAGE";

  return [
    {
      id: "application-submitted",
      title: "Application submitted",
      description: "Your application has been successfully submitted and sent to Recruitment.",
      status: "COMPLETED",
      occurredAt: eventAt(tracking, "APPLICATION_SUBMITTED"),
    },
    {
      id: "recruitment-review",
      title: "Recruitment review",
      description: recruitmentReviewed
        ? "Your application has been reviewed by Recruitment."
        : "Your application is waiting for Recruitment to review it.",
      status: recruitmentReviewed ? "COMPLETED" : "CURRENT",
      occurredAt: eventAt(tracking, "RECRUITMENT_ACCEPTED"),
    },
    {
      id: "sent-to-hiring-manager",
      title: "Sent to Hiring Manager",
      description: forwarded ? "Your application has been forwarded to the Hiring Manager for further review." : "",
      status: forwarded ? "COMPLETED" : "PENDING",
      occurredAt: eventAt(tracking, "FORWARDED_TO_HIRING_MANAGER"),
      nextStep: stage === "RECRUITMENT_ACCEPTED",
    },
    {
      id: "hiring-manager-review",
      title: "Hiring Manager review",
      description: reviewStarted
        ? "Your application is currently under review by the Hiring Manager. We'll update you when there is a change."
        : forwarded
          ? "Your application has been sent to the Hiring Manager and is waiting to be reviewed."
          : "",
      status: forwarded ? "CURRENT" : "PENDING",
      occurredAt: eventAt(tracking, "HIRING_MANAGER_REVIEW_STARTED"),
      nextStep: stage === "HIRING_MANAGER_PENDING",
    },
    {
      id: "next-stage",
      title: "Next stage",
      description: "We'll update you when there is a change.",
      status: stage === "NEXT_STAGE" ? "COMPLETED" : "PENDING",
      nextStep: stage === "HIRING_MANAGER_REVIEW",
    },
  ];
}
