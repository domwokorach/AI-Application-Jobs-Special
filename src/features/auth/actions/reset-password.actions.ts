"use server";

import { resetPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import type { AuthActionResult, ResetTokenValidation } from "@/features/auth/types/auth.types";
import { validatePasswordResetToken, consumePasswordResetToken } from "@/features/auth/services/tokens.service";
import { updateAccountPassword } from "@/features/auth/services/accounts.service";
import { revokeOtherSessions } from "@/features/auth/services/sessions.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";

/** Used by the /reset-password page (server component) to decide whether to render the "create
 * a new password" form or the "link no longer valid" state — a non-consuming check. */
export async function checkResetTokenAction(token: string): Promise<ResetTokenValidation> {
  return validatePasswordResetToken(token);
}

export async function resetPasswordAction(values: unknown): Promise<AuthActionResult> {
  const identifier = await getRequestIdentifier();
  const limit = checkRateLimit(`reset-password:${identifier}`, 10, 15 * 60);
  if (!limit.allowed) {
    return { success: false, message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Consume (single-use) rather than just validate — prevents the same link being replayed to
  // reset the password a second time.
  const result = consumePasswordResetToken(parsed.data.token);
  if (!result.valid) {
    return { success: false, message: "This password reset link is no longer valid. It may have expired or already been used." };
  }

  await updateAccountPassword(result.accountId, parsed.data.password);
  // A password reset is a signal the credential may have been compromised — cut off any other
  // signed-in session so it can't keep using the old (possibly leaked) password's session.
  revokeOtherSessions(result.accountId);
  recordAuditEvent("PASSWORD_RESET_COMPLETED", result.accountId);

  return { success: true };
}
