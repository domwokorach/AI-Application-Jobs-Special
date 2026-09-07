import { NextResponse } from "next/server";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { generateApplicationPdf, getSubmission, sanitizeReferenceForFilename } from "@/features/applications/services/applications.service";

export async function GET(_request: Request, { params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;

  const candidateId = await getCandidateSessionId();
  if (!candidateId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await getSubmission(applicationId);
  if (!submission) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  // Ownership check: never allow one candidate's session to fetch another candidate's document.
  if (submission.ownerId !== candidateId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const buffer = await generateApplicationPdf(applicationId);
    const filename = `application-${sanitizeReferenceForFilename(submission.reference)}.pdf`;
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "We couldn't prepare your PDF confirmation. Please try again." }, { status: 500 });
  }
}
