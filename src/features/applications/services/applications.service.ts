import "server-only";
import type { Application, ApplicationStepId } from "@/types";

export async function getApplication(applicationId: string): Promise<Application | undefined> {
  void applicationId;
  return undefined;
}

export async function saveApplicationStep(
  applicationId: string,
  step: ApplicationStepId,
  data: Record<string, unknown>,
): Promise<void> {
  void applicationId;
  void step;
  void data;
  throw new Error("Application persistence has not been configured. Connect a database in src/lib/db.ts.");
}

export type SubmissionRecord = { reference: string; submittedAt: string; email: string };

const submissions = new Map<string, SubmissionRecord>();
const emailDeliveries = new Map<string, boolean>();

function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `APP-${year}-${random}`;
}

export async function submitApplication(
  applicationId: string,
  data: Record<string, unknown> & { email?: string },
): Promise<SubmissionRecord> {
  const existing = submissions.get(applicationId);
  if (existing) return existing;

  await new Promise((resolve) => setTimeout(resolve, 600));

  const record: SubmissionRecord = {
    reference: generateReference(),
    submittedAt: new Date().toISOString(),
    email: typeof data.email === "string" ? data.email : "",
  };
  submissions.set(applicationId, record);
  return record;
}

export type EmailDeliveryResult = { delivered: boolean };

export async function sendApplicationConfirmationEmail(
  applicationId: string,
  details: { email: string; jobTitle: string; reference: string },
): Promise<EmailDeliveryResult> {
  void details;

  await new Promise((resolve) => setTimeout(resolve, 400));

  // Simulated mail provider: first attempt occasionally fails so the retry ("Resend") path is exercised;
  // a resend after a prior attempt always succeeds so tests don't flake indefinitely.
  const attempted = emailDeliveries.has(applicationId);
  const delivered = attempted ? true : Math.random() > 0.3;
  emailDeliveries.set(applicationId, delivered);
  return { delivered };
}

export async function getEmailDeliveryStatus(applicationId: string): Promise<boolean | undefined> {
  return emailDeliveries.get(applicationId);
}
