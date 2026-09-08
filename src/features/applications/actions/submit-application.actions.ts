"use server";

import { requireCandidateSessionId } from "@/lib/candidate-session";
import { applicationSchema } from "@/features/applications/schemas/application.schema";
import {
  generateApplicationPdf,
  getSubmission,
  sendApplicationConfirmationEmail,
  submitApplication,
  type ApplicationSummary,
  type DocumentStatus,
} from "@/features/applications/services/applications.service";

export type SubmitApplicationActionResult =
  | {
      success: true;
      reference: string;
      submittedAt: string;
      email: string;
      jobTitle: string;
      location?: string;
      summary: ApplicationSummary;
      emailDelivered: boolean;
      pdfStatus: DocumentStatus;
    }
  | { success: false; message: string };

export async function submitApplicationAction(applicationId: string, values: unknown): Promise<SubmitApplicationActionResult> {
  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Please complete all required sections before submitting." };
  }

  try {
    const ownerId = await requireCandidateSessionId();
    const submission = await submitApplication(applicationId, parsed.data, ownerId);

    // PDF generation and email delivery are deliberately separate follow-on steps: a failure in
    // either must never trigger a resubmission, a new reference, or lose the application record.
    let pdfStatus: DocumentStatus;
    try {
      await generateApplicationPdf(applicationId);
      pdfStatus = "READY";
    } catch {
      pdfStatus = "FAILED";
    }

    let emailDelivered: boolean;
    try {
      const { delivered } = await sendApplicationConfirmationEmail(applicationId, {
        email: submission.email,
        jobTitle: submission.jobTitle,
        reference: submission.reference,
      });
      emailDelivered = delivered;
    } catch {
      emailDelivered = false;
    }

    return { ...submission, success: true, emailDelivered, pdfStatus };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "We couldn't submit your application." };
  }
}

export type ResendConfirmationEmailResult = { success: boolean };

export async function resendConfirmationEmailAction(
  applicationId: string,
  details: { email: string; jobTitle: string; reference: string },
): Promise<ResendConfirmationEmailResult> {
  try {
    const { delivered } = await sendApplicationConfirmationEmail(applicationId, details);
    return { success: delivered };
  } catch {
    return { success: false };
  }
}

export type RegeneratePdfActionResult = { status: DocumentStatus };

export async function regeneratePdfAction(applicationId: string): Promise<RegeneratePdfActionResult> {
  const candidateId = await requireCandidateSessionId();
  const submission = await getSubmission(applicationId);
  if (!submission || submission.ownerId !== candidateId) {
    return { status: "FAILED" };
  }

  try {
    await generateApplicationPdf(applicationId);
    return { status: "READY" };
  } catch {
    return { status: "FAILED" };
  }
}
