"use server";

import { getCandidateSessionId } from "@/lib/candidate-session";
import { getSubmission } from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";
import type { CandidateTracking } from "@/features/applications/types/tracking.types";

/**
 * Server Action used by client components (RecentActivity) that need a candidate's tracking
 * data. Deliberately not a `/api/*` Route Handler: this mock backend's data lives in
 * module-level in-memory Maps, and Route Handlers under `/api` are commonly bundled as
 * independent serverless functions (locally and on platforms like Vercel) — separate from the
 * function serving pages and Server Actions — so they can end up with their own, unsynced copy
 * of that state. Server Actions share the same runtime as the page that renders them, so
 * ownership checks here are reliably consistent with what the tracking page itself sees.
 */
export async function getApplicationTrackingAction(applicationId: string): Promise<CandidateTracking | undefined> {
  const candidateId = await getCandidateSessionId();
  const submission = await getSubmission(applicationId);

  if (!submission || submission.ownerId !== candidateId) return undefined;

  return getApplicationTracking(applicationId);
}
