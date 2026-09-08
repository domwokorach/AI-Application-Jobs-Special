"use server";

import { consumeVerificationToken } from "@/features/auth/services/tokens.service";
import { markEmailVerified } from "@/features/auth/services/accounts.service";
import { issueVerificationToken } from "@/features/auth/services/tokens.service";
import { sendVerificationEmail } from "@/features/auth/services/email.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { getCandidateUser } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { getBaseUrl } from "@/lib/base-url";
import type { AuthActionResult } from "@/features/auth/types/auth.types";

export async function verifyEmailAction(token: string): Promise<AuthActionResult> {
  const result = consumeVerificationToken(token);
  if (!result.valid) {
    return { success: false, message: "This verification link is no longer valid. It may have expired or already been used." };
  }
  await markEmailVerified(result.accountId);
  recordAuditEvent("EMAIL_VERIFIED", result.accountId);
  return { success: true };
}

export async function resendVerificationAction(): Promise<AuthActionResult> {
  const account = await getCandidateUser();
  if (!account) return { success: false, message: "You must be signed in to do that." };
  if (account.emailVerified) return { success: true };

  const identifier = await getRequestIdentifier();
  const limit = checkRateLimit(`resend-verification:${account.id}:${identifier}`, 3, 10 * 60);
  if (!limit.allowed) {
    return { success: false, message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const token = issueVerificationToken(account.id);
  const baseUrl = await getBaseUrl();
  const { delivered } = await sendVerificationEmail(account.id, { verifyUrl: `${baseUrl}/verify-email?token=${token}` });
  if (!delivered) return { success: false, message: "We couldn't send the verification email. Please try again." };
  return { success: true };
}
