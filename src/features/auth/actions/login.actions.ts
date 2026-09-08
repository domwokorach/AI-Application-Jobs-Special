"use server";

import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { LoginResult } from "@/features/auth/types/auth.types";
import { verifyAccountCredentials, toPublicAccount } from "@/features/auth/services/accounts.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { establishAuthSession } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";

const GENERIC_FAILURE = "We couldn't sign you in with those details. Check your email address and password and try again.";

export async function loginAction(values: unknown): Promise<LoginResult> {
  const identifier = await getRequestIdentifier();

  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  // Rate-limit per (ip, email) so one attacker can't lock out everyone by hammering a single
  // popular address, but repeated guesses against one account are still throttled.
  const limit = checkRateLimit(`login:${identifier}:${parsed.data.email.toLowerCase()}`, 8, 10 * 60);
  if (!limit.allowed) {
    return { success: false, message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const account = await verifyAccountCredentials(parsed.data.email, parsed.data.password);
  if (!account) {
    // Deliberately identical whether the email doesn't exist or the password was wrong — never
    // confirm which one it was.
    recordAuditEvent("LOGIN_FAILED", undefined, { emailAttempted: parsed.data.email.toLowerCase() });
    return { success: false, message: GENERIC_FAILURE };
  }

  await establishAuthSession(account.id);
  recordAuditEvent("LOGIN_SUCCEEDED", account.id);

  return { success: true, account: toPublicAccount(account) };
}
