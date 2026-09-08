"use server";

import { recordAuthenticatedPrivacyEvent, recordConfidentialityAuditEvent } from "@/features/privacy/services/privacy.service";
import type { SensitiveDocumentType } from "@/lib/auth";
import type { ConfidentialResourceType, ConfidentialitySensitivity } from "@/features/privacy/types/confidentiality.types";

export async function recordProtectedCopyAttemptAction(applicationId: string, documentType: SensitiveDocumentType): Promise<void> {
  await recordAuthenticatedPrivacyEvent("PROTECTED_COPY_ATTEMPT", applicationId, documentType);
}

export async function recordSensitiveScreenHiddenAction(applicationId: string, documentType: SensitiveDocumentType): Promise<void> {
  await recordAuthenticatedPrivacyEvent("SENSITIVE_SCREEN_HIDDEN", applicationId, documentType);
}

export async function recordSensitiveScreenReauthenticatedAction(applicationId: string, documentType: SensitiveDocumentType): Promise<void> {
  await recordAuthenticatedPrivacyEvent("SENSITIVE_SCREEN_REAUTHENTICATED", applicationId, documentType);
}

export async function recordConfidentialityWarningShownAction(
  resourceType: ConfidentialResourceType,
  sensitivity: ConfidentialitySensitivity,
  applicationId?: string,
): Promise<void> {
  await recordConfidentialityAuditEvent("CONFIDENTIALITY_WARNING_SHOWN", resourceType, sensitivity, applicationId);
}

export async function recordConfidentialityAcknowledgedAction(
  resourceType: ConfidentialResourceType,
  sensitivity: ConfidentialitySensitivity,
  applicationId?: string,
): Promise<void> {
  await recordConfidentialityAuditEvent("CONFIDENTIALITY_ACKNOWLEDGED", resourceType, sensitivity, applicationId);
}
