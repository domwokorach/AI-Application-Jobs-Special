"use server";

import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";
import type { ForgotPasswordResult } from "@/features/auth/types/auth.types";
import { findAccountByEmail } from "@/features/auth/services/accounts.service";
import { issuePasswordResetToken, invalidateOutstandingResetTokens } from "@/features/auth/services/tokens.service";
import { sendPasswordResetEmail } from "@/features/auth/services/email.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { getBaseUrl } from "@/lib/base-url";

export async function forgotPasswordAction(values: unknown): Promise<ForgotPasswordResult> {
  const identifier = await getRequestIdentifier();
  const limit = checkRateLimit(`forgot-password:${identifier}`, 5, 15 * 60);
  if (!limit.allowed) {
    // Still generic — do not reveal that rate limiting (vs. account state) is the reason.
    return { success: true };
  }

  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Enter a valid email address.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const account = await findAccountByEmail(parsed.data.email);
  if (account) {
    invalidateOutstandingResetTokens(account.id);
    const resetToken = issuePasswordResetToken(account.id);
    const baseUrl = await getBaseUrl();
    await sendPasswordResetEmail(account.id, { resetUrl: `${baseUrl}/reset-password?token=${resetToken}` });
    recordAuditEvent("PASSWORD_RESET_REQUESTED", account.id);
  }

  // Same response whether or not an account exists for this email — this is the entire point
  // of the flow; never branch the visible result on account existence.
  return { success: true };
}
