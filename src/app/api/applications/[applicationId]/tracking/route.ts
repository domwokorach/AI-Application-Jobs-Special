import { NextResponse } from "next/server";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getSubmission } from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";

export async function GET(_request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;

  const candidateId = await getCandidateSessionId();
  const submission = await getSubmission(applicationId);

  // Ownership check: never allow one candidate's session to fetch another candidate's tracking.
  if (!submission || submission.ownerId !== candidateId) {
    return NextResponse.json({ success: false, data: null, error: "Application not found" }, { status: 404 });
  }

  const tracking = await getApplicationTracking(applicationId);
  return NextResponse.json({ success: true, data: tracking, error: null });
}
