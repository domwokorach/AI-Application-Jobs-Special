"use server";

import { applicationSchema } from "@/features/applications/schemas/application.schema";
import { sendApplicationConfirmationEmail, submitApplication } from "@/features/applications/services/applications.service";

export type SubmitApplicationActionResult =
  | { success: true; reference: string; submittedAt: string; email: string; emailDelivered: boolean }
  | { success: false; message: string };

export async function submitApplicationAction(applicationId: string, values: unknown): Promise<SubmitApplicationActionResult> {
  const parsed = applicationSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Please complete all required sections before submitting." };
  }

  try {
    const { reference, submittedAt, email } = await submitApplication(applicationId, parsed.data);

    // Email delivery is deliberately separate from submission: a failure here must never
    // trigger a resubmission or lose the application record.
    const { delivered } = await sendApplicationConfirmationEmail(applicationId, {
      email,
      jobTitle: "",
      reference,
    });

    return { success: true, reference, submittedAt, email, emailDelivered: delivered };
  } catch (error) {
    return { success: false, message: error instanceof Error ? error.message : "We couldn't submit your application." };
  }
}

export type ResendConfirmationEmailResult = { success: boolean };

export async function resendConfirmationEmailAction(
  applicationId: string,
  details: { email: string; reference: string },
): Promise<ResendConfirmationEmailResult> {
  const { delivered } = await sendApplicationConfirmationEmail(applicationId, {
    email: details.email,
    jobTitle: "",
    reference: details.reference,
  });
  return { success: delivered };
}
