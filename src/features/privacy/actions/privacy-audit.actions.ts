"use server";

import { recordAuthenticatedPrivacyEvent } from "@/features/privacy/services/privacy.service";
import type { SensitiveDocumentType } from "@/lib/auth";

export async function recordProtectedCopyAttemptAction(applicationId: string, documentType: SensitiveDocumentType): Promise<void> {
  await recordAuthenticatedPrivacyEvent("PROTECTED_COPY_ATTEMPT", applicationId, documentType);
}

export async function recordSensitiveScreenHiddenAction(applicationId: string, documentType: SensitiveDocumentType): Promise<void> {
  await recordAuthenticatedPrivacyEvent("SENSITIVE_SCREEN_HIDDEN", applicationId, documentType);
}

export async function recordSensitiveScreenReauthenticatedAction(applicationId: string, documentType: SensitiveDocumentType): Promise<void> {
  await recordAuthenticatedPrivacyEvent("SENSITIVE_SCREEN_REAUTHENTICATED", applicationId, documentType);
}
