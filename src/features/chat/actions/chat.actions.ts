"use server";

import { getCandidateSessionId } from "@/lib/candidate-session";
import {
  ensureIllustrativeApplicationsSeeded,
  getDraftSummariesForOwner,
  getSubmissionsForOwner,
} from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";
import { getCandidateApplicationStatus } from "@/features/applications/utils/tracking-mapping.utils";

/**
 * Candidate-safe application data for the chatbot. Deliberately mirrors what `/applications`
 * already renders (see application-list.types.ts) rather than exposing anything beyond a job
 * title, draft completion, and the already-mapped candidate-facing status label — no recruiter
 * notes, scores, ownerId, or raw internal stage values ever leave this action.
 */
export type ChatDraftApplication = {
  id: string;
  jobTitle: string;
  percentComplete: number;
};

export type ChatSubmittedApplication = {
  id: string;
  jobTitle: string;
  statusLabel: string;
};

export type ChatApplicationsSummary = {
  drafts: ChatDraftApplication[];
  submitted: ChatSubmittedApplication[];
};

/**
 * The chatbot never trusts a candidateId/applicationId supplied by the browser — this action
 * resolves the caller's identity itself from the session cookie, exactly like the tracking page
 * and `getApplicationTrackingAction` do, so chat can never be used to look up someone else's data.
 */
export async function getChatApplicationsSummaryAction(): Promise<ChatApplicationsSummary> {
  const candidateId = await getCandidateSessionId();
  if (!candidateId) return { drafts: [], submitted: [] };

  await ensureIllustrativeApplicationsSeeded(candidateId);

  const [drafts, submissions] = await Promise.all([
    getDraftSummariesForOwner(candidateId),
    getSubmissionsForOwner(candidateId),
  ]);

  const submitted = await Promise.all(
    submissions.map(async (submission): Promise<ChatSubmittedApplication | undefined> => {
      const tracking = await getApplicationTracking(submission.id);
      if (!tracking) return undefined;
      return {
        id: submission.id,
        jobTitle: submission.jobTitle,
        statusLabel: getCandidateApplicationStatus(tracking.currentStage).label,
      };
    }),
  );

  return {
    drafts: drafts.map((draft) => ({ id: draft.id, jobTitle: draft.jobTitle, percentComplete: draft.percentComplete })),
    submitted: submitted.filter((entry): entry is ChatSubmittedApplication => entry !== undefined),
  };
}
