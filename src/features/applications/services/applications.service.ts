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
  draftLastSavedAt.set(applicationId, new Date().toISOString());
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
const draftLastSavedAt = new Map<string, string>();
const pendingSubmissions = new Map<string, Promise<SubmissionRecord>>();
const emailDeliveries = new Map<string, boolean>();

/** Ordered so newest submission naturally lists first; callers still sort explicitly. */
export async function getSubmissionsForOwner(ownerId: string): Promise<Array<SubmissionRecord & { id: string }>> {
  return [...submissions.entries()]
    .filter(([, record]) => record.ownerId === ownerId)
    .map(([id, record]) => ({ id, ...record }));
}

export type DraftApplicationSummary = {
  id: string;
  jobTitle: string;
  location?: string;
  lastSavedAt: string;
  percentComplete: number;
};

/**
 * The one real, form-backed draft ("demo-application") only tracks a raw field bag, not a
 * jobTitle/location/percent suited for a list card — job role is chosen mid-form and never
 * step-saved on its own. Rather than fabricate that data, this reuses the same demo job
 * identity already shown throughout the multi-step form UI (see ApplicationShell's default
 * jobTitle/jobMeta) so the "in progress" card reflects the one real application consistently
 * with the rest of the app, with a genuinely persisted last-saved timestamp.
 */
export async function getDraftSummariesForOwner(ownerId: string): Promise<DraftApplicationSummary[]> {
  const summaries: DraftApplicationSummary[] = [];

  const realDraftId = "demo-application";
  if (!submissions.has(realDraftId) && applicationDrafts.has(realDraftId)) {
    // This mock has a single global draft slot rather than one per candidate — treat whoever
    // has saved into it as its owner, consistent with how submitApplication's ownerId works.
    const lastSavedAt = draftLastSavedAt.get(realDraftId) ?? new Date().toISOString();
    summaries.push({
      id: realDraftId,
      jobTitle: "Customer Experience Associate",
      location: "London · Hybrid",
      lastSavedAt,
      percentComplete: Math.min(90, Object.keys(applicationDrafts.get(realDraftId) ?? {}).length * 15 + 15),
    });
  }

  const illustrative = illustrativeDraftsByOwner.get(ownerId);
  if (illustrative) summaries.push(illustrative);

  return summaries;
}

const illustrativeDraftsByOwner = new Map<string, DraftApplicationSummary>();
const seededIllustrativeOwners = new Set<string>();

/**
 * Adds one additional illustrative submitted application and one illustrative draft for a
 * candidate who has already submitted their real demo application — purely so the "Your
 * Applications" list has something genuine to show for the "multiple applications" case. These
 * go through the exact same SubmissionRecord/tracking pipeline as a real submission (nothing in
 * the UI layer is faked); only this seed step is synthetic, in the same spirit as the rest of
 * this mock backend's single "demo-application". Runs at most once per candidate, and never for
 * a candidate who hasn't submitted anything yet — a brand-new account still sees the real empty
 * state first.
 */
export async function ensureIllustrativeApplicationsSeeded(ownerId: string): Promise<void> {
  if (seededIllustrativeOwners.has(ownerId)) return;
  if (!submissions.has("demo-application")) return;
  seededIllustrativeOwners.add(ownerId);

  const careAssistantId = `demo-application-care-assistant-${ownerId}`;
  if (!submissions.has(careAssistantId)) {
    const submittedAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    submissions.set(careAssistantId, {
      reference: generateReference(),
      submittedAt,
      email: submissions.get("demo-application")?.email ?? "",
      jobTitle: "Care Assistant",
      location: "Manchester",
      ownerId,
      summary: submissions.get("demo-application")!.summary,
    });
    const { seedApplicationTrackingUpTo } = await import("./tracking.service");
    await seedApplicationTrackingUpTo(careAssistantId, submissions.get(careAssistantId)!, "RECRUITMENT_ACCEPTED");
  }

  illustrativeDraftsByOwner.set(ownerId, {
    id: `demo-application-senior-support-worker-${ownerId}`,
    jobTitle: "Senior Support Worker",
    location: "Birmingham",
    lastSavedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    percentComplete: 75,
  });
}

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
