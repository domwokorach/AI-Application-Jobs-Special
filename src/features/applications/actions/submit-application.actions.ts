"use server";

import { applicationSchema } from "@/features/applications/schemas/application.schema";
import { sendApplicationConfirmationEmail, submitApplication } from "@/features/applications/services/applications.service";

export type SubmitApplicationActionResult =
  | {
      success: true;
      reference: string;
      submittedAt: string;
      email: string;
      jobTitle: string;
      location?: string;
      emailDelivered: boolean;
    }
  | { success: false; message: string };

export async function submitApplicationAction(applicationId: string, values: unknown): Promise<SubmitApplicationActionResult> {
  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Please complete all required sections before submitting." };
  }

  try {
    const submission = await submitApplication(applicationId, parsed.data);

    // Email delivery is deliberately separate from submission: a failure here must never
    // trigger a resubmission or lose the application record.
    try {
      const { delivered } = await sendApplicationConfirmationEmail(applicationId, {
        email: submission.email,
        jobTitle: submission.jobTitle,
        reference: submission.reference,
      });

      return { ...submission, success: true, emailDelivered: delivered };
    } catch {
      return { ...submission, success: true, emailDelivered: false };
    }
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
