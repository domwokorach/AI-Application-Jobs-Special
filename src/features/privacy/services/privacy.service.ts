import "server-only";
import { getSubmission, type SubmissionRecord } from "@/features/applications/services/applications.service";
import { requireUser, type AuthenticatedUser, type RecruitmentRole, type SensitiveDocumentType } from "@/lib/auth";
import type { ConfidentialResourceType, ConfidentialitySensitivity } from "@/features/privacy/types/confidentiality.types";

// Deliberately excludes any "SCREENSHOT_TAKEN" style event: a normal website has no reliable,
// non-spoofable signal that an OS-level screenshot (e.g. macOS Shift+Cmd+4) occurred, so we never
// record one. Only events this app can actually observe and trust are represented here.
export type AuditEventType =
  | "DOCUMENT_VIEWED"
  | "DOCUMENT_ACCESS_DENIED"
  | "SENSITIVE_SCREEN_HIDDEN"
  | "SENSITIVE_SCREEN_REAUTHENTICATED"
  | "PROTECTED_COPY_ATTEMPT";

export type SensitiveDocumentAuditEvent = {
  type: AuditEventType;
  documentType: SensitiveDocumentType;
  applicationId: string;
  actorId?: string;
  actorRole?: RecruitmentRole;
  timestamp: string;
};

/**
 * Recorded when the confidentiality warning dialog is shown or acknowledged. Unlike
 * SensitiveDocumentAuditEvent, the resource being warned about isn't always a single downloadable
 * document (it may be a review screen), so this carries the broader `resourceType` union instead
 * of `SensitiveDocumentType`.
 */
export type ConfidentialityAuditEvent = {
  type: "CONFIDENTIALITY_WARNING_SHOWN" | "CONFIDENTIALITY_ACKNOWLEDGED";
  resourceType: ConfidentialResourceType;
  sensitivity: ConfidentialitySensitivity;
  applicationId?: string;
  actorId?: string;
  actorRole?: RecruitmentRole;
  timestamp: string;
};

export type PrivacyAuditEvent = SensitiveDocumentAuditEvent | ConfidentialityAuditEvent;

type AuthorizedDocumentAccess = {
  outcome: "authorized";
  actor: Required<Pick<AuthenticatedUser, "id" | "email" | "role">>;
  submission: SubmissionRecord;
};

type DeniedDocumentAccess = {
  outcome: "unauthenticated" | "session-expired" | "forbidden" | "not-found";
};

export type SensitiveDocumentAccess = AuthorizedDocumentAccess | DeniedDocumentAccess;

const auditEvents: PrivacyAuditEvent[] = [];

function sessionHasExpired(sessionExpiresAt?: string): boolean {
  return Boolean(sessionExpiresAt && new Date(sessionExpiresAt).getTime() <= Date.now());
}

function isDocumentAuthorized(
  actor: AuthenticatedUser,
  applicationId: string,
  documentType: SensitiveDocumentType,
): boolean {
  return actor.documentPermissions?.some(
    (permission) =>
      permission.applicationId === applicationId &&
      permission.documentTypes.includes(documentType),
  ) ?? false;
}

export async function recordSensitiveDocumentAuditEvent(event: SensitiveDocumentAuditEvent): Promise<void> {
  auditEvents.push(event);
}

export async function authorizeSensitiveDocumentAccess(
  applicationId: string,
  documentType: SensitiveDocumentType,
): Promise<SensitiveDocumentAccess> {
  let actor: AuthenticatedUser;
  try {
    actor = await requireUser();
  } catch {
    await recordSensitiveDocumentAuditEvent({
      type: "DOCUMENT_ACCESS_DENIED",
      documentType,
      applicationId,
      timestamp: new Date().toISOString(),
    });
    return { outcome: "unauthenticated" };
  }

  if (sessionHasExpired(actor.sessionExpiresAt)) {
    await recordSensitiveDocumentAuditEvent({
      type: "DOCUMENT_ACCESS_DENIED",
      documentType,
      applicationId,
      actorId: actor.id,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
    });
    return { outcome: "session-expired" };
  }

  const submission = await getSubmission(applicationId);
  if (!submission) return { outcome: "not-found" };

  if (!actor.role || !isDocumentAuthorized(actor, applicationId, documentType)) {
    await recordSensitiveDocumentAuditEvent({
      type: "DOCUMENT_ACCESS_DENIED",
      documentType,
      applicationId,
      actorId: actor.id,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
    });
    return { outcome: "forbidden" };
  }

  await recordSensitiveDocumentAuditEvent({
    type: "DOCUMENT_VIEWED",
    documentType,
    applicationId,
    actorId: actor.id,
    actorRole: actor.role,
    timestamp: new Date().toISOString(),
  });

  return {
    outcome: "authorized",
    actor: { id: actor.id, email: actor.email, role: actor.role },
    submission,
  };
}

export async function getSensitiveDocumentAuditEvents(): Promise<readonly PrivacyAuditEvent[]> {
  return auditEvents;
}

/**
 * Records that the confidentiality warning dialog was shown to, or acknowledged by, the currently
 * authenticated recruitment-side user. Silently no-ops without a session — this is best-effort
 * telemetry, not an access-control decision, and the actor identity always comes from the server
 * session (`requireUser()`), never from the client, per this app's audit policy.
 */
export async function recordConfidentialityAuditEvent(
  type: "CONFIDENTIALITY_WARNING_SHOWN" | "CONFIDENTIALITY_ACKNOWLEDGED",
  resourceType: ConfidentialResourceType,
  sensitivity: ConfidentialitySensitivity,
  applicationId?: string,
): Promise<void> {
  try {
    const actor = await requireUser();
    auditEvents.push({
      type,
      resourceType,
      sensitivity,
      applicationId,
      actorId: actor.id,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // No authenticated session to attribute the event to — nothing to record.
  }
}

/**
 * Records a client-reported privacy event (screen hidden/reauthenticated, copy attempt) against
 * the currently authenticated user. Silently no-ops if there is no authenticated session — these
 * are best-effort telemetry, not an access-control decision, so a failure here must never block
 * the candidate information the event refers to.
 */
export async function recordAuthenticatedPrivacyEvent(
  type: "SENSITIVE_SCREEN_HIDDEN" | "SENSITIVE_SCREEN_REAUTHENTICATED" | "PROTECTED_COPY_ATTEMPT",
  applicationId: string,
  documentType: SensitiveDocumentType,
): Promise<void> {
  try {
    const actor = await requireUser();
    await recordSensitiveDocumentAuditEvent({
      type,
      documentType,
      applicationId,
      actorId: actor.id,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // No authenticated session to attribute the event to — nothing to record.
  }
}
