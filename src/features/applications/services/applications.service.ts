import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import type { Application, ApplicationStepId } from "@/types";
import type { ApplicationFormValues } from "@/features/applications/schemas/application.schema";
import type { LanguageSelection } from "@/features/applications/schemas/languages.schema";

export async function getApplication(applicationId: string): Promise<Application | undefined> {
  void applicationId;
  return undefined;
}

export async function saveApplicationStep(
  applicationId: string,
  step: ApplicationStepId,
  data: Record<string, unknown>,
): Promise<void> {
  if (submissions.has(applicationId)) {
    throw new Error("This application has already been submitted and can no longer be edited.");
  }

  const draft = applicationDrafts.get(applicationId) ?? {};
  applicationDrafts.set(applicationId, { ...draft, ...data });
  void step;
}

// Non-sensitive, candidate-facing summary of a submitted application. Reasonable-adjustment and
// equality-monitoring answers are deliberately excluded — they must never appear in a downloadable receipt.
export type ApplicationSummary = {
  personalDetails: { fullName: string; email: string; mobile: string; dateOfBirth: string; address: string; postcode: string };
  jobPreferences: { role: string; location?: string; preferredEmployer?: string; employmentType?: string; availableFrom?: string };
  aboutYou: { personalProfile?: string; roleInterest?: string };
  languages: LanguageSelection[];
  workExperience: { title: string; employer: string }[];
  education: { institution: string; qualification: string }[];
  references: { name: string; email: string }[];
  declaration: { accurate: boolean; editRestrictionAcknowledged: boolean };
};

function buildApplicationSummary(data: ApplicationFormValues): ApplicationSummary {
  return {
    personalDetails: {
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      dateOfBirth: data.dateOfBirth,
      address: data.address,
      postcode: data.postcode,
    },
    jobPreferences: {
      role: data.role,
      location: data.location,
      preferredEmployer: data.preferredEmployer,
      employmentType: data.employmentType,
      availableFrom: data.availableFrom,
    },
    aboutYou: {
      personalProfile: data.personalProfile,
      roleInterest: data.roleInterest,
    },
    languages: data.languages,
    workExperience: data.work.map((entry) => ({ title: entry.title, employer: entry.employer })),
    education: data.education.map((entry) => ({ institution: entry.institution, qualification: entry.qualification })),
    references: data.references.map((entry) => ({ name: entry.name, email: entry.email })),
    declaration: {
      accurate: data.declarationAccurate,
      editRestrictionAcknowledged: data.declarationEditRestriction,
    },
  };
}

export type SubmissionRecord = {
  reference: string;
  submittedAt: string;
  email: string;
  jobTitle: string;
  location?: string;
  ownerId: string;
  summary: ApplicationSummary;
};

const submissions = new Map<string, SubmissionRecord>();
const applicationDrafts = new Map<string, Record<string, unknown>>();
const pendingSubmissions = new Map<string, Promise<SubmissionRecord>>();
const emailDeliveries = new Map<string, boolean>();

function generateReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);
  return `APP-${year}-${random}`;
}

/** Filename-safe version of a server-generated reference. Never derive a filename from candidate input. */
export function sanitizeReferenceForFilename(reference: string): string {
  return reference.replace(/[^A-Za-z0-9-]/g, "");
}

export async function submitApplication(
  applicationId: string,
  data: ApplicationFormValues,
  ownerId: string,
): Promise<SubmissionRecord> {
  const existing = submissions.get(applicationId);
  if (existing) return existing;

  const pending = pendingSubmissions.get(applicationId);
  if (pending) return pending;

  // Reserve the slot synchronously (before any await) so concurrent double-clicks or duplicate
  // requests dedupe onto the same in-flight submission instead of each generating a reference.
  const task = (async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      const record: SubmissionRecord = {
        reference: generateReference(),
        submittedAt: new Date().toISOString(),
        email: data.email,
        jobTitle: data.role,
        location: data.location,
        ownerId,
        summary: buildApplicationSummary(data),
      };
      submissions.set(applicationId, record);
      return record;
    } finally {
      pendingSubmissions.delete(applicationId);
    }
  })();
  pendingSubmissions.set(applicationId, task);
  return task;
}

export async function getSubmission(applicationId: string): Promise<SubmissionRecord | undefined> {
  return submissions.get(applicationId);
}

export type EmailDeliveryResult = { delivered: boolean };

export type ApplicationConfirmationEmail = {
  subject: string;
  text: string;
};

export function createApplicationConfirmationEmail(
  details: { jobTitle: string; reference: string },
): ApplicationConfirmationEmail {
  return {
    subject: "Application received",
    text: `Thank you for applying for the ${details.jobTitle} position.

We've received your application successfully.

Application reference:
${details.reference}

Please keep this reference for your records.

Our recruitment team will review your application.
We'll contact you if there is an update or if we need any further information.

You do not need to submit your application again.`,
  };
}

export async function sendApplicationConfirmationEmail(
  applicationId: string,
  details: { email: string; jobTitle: string; reference: string },
): Promise<EmailDeliveryResult> {
  const message = createApplicationConfirmationEmail(details);
  void message;

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

export type DocumentStatus = "NOT_GENERATED" | "GENERATING" | "READY" | "FAILED";

const pdfStatuses = new Map<string, DocumentStatus>();
const pdfBuffers = new Map<string, Buffer>();
const pdfPending = new Map<string, Promise<Buffer>>();

/**
 * Generates (or returns the cached) PDF receipt for a submitted application. PDF generation is
 * strictly a follow-on step: it never mutates the submission record, so a generation failure can
 * be retried indefinitely without ever re-submitting the application or issuing a new reference.
 */
export async function generateApplicationPdf(applicationId: string): Promise<Buffer> {
  const submission = submissions.get(applicationId);
  if (!submission) throw new Error("Application has not been submitted.");

  const cached = pdfBuffers.get(applicationId);
  if (cached && pdfStatuses.get(applicationId) === "READY") return cached;

  const pending = pdfPending.get(applicationId);
  if (pending) return pending;

  const task = (async () => {
    pdfStatuses.set(applicationId, "GENERATING");
    try {
      const { ApplicationConfirmationPdf } = await import("@/features/applications/pdf/application-confirmation-pdf");
      const buffer = await renderToBuffer(ApplicationConfirmationPdf({ submission }));
      pdfBuffers.set(applicationId, buffer);
      pdfStatuses.set(applicationId, "READY");
      return buffer;
    } catch (error) {
      pdfStatuses.set(applicationId, "FAILED");
      throw error;
    } finally {
      pdfPending.delete(applicationId);
    }
  })();
  pdfPending.set(applicationId, task);
  return task;
}

export async function getPdfStatus(applicationId: string): Promise<DocumentStatus> {
  return pdfStatuses.get(applicationId) ?? "NOT_GENERATED";
}
