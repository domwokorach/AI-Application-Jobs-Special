"use server";

import { changePasswordSchema } from "@/features/profile/schemas/change-password.schema";
import type { AuthActionResult } from "@/features/auth/types/auth.types";
import { findAccountById, verifyAccountCredentials, updateAccountPassword } from "@/features/auth/services/accounts.service";
import { revokeOtherSessions } from "@/features/auth/services/sessions.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { requireCandidateUser, getCurrentSessionId } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";

export async function changePasswordAction(values: unknown): Promise<AuthActionResult> {
  const account = await requireCandidateUser();

  const identifier = await getRequestIdentifier();
  const limit = checkRateLimit(`change-password:${account.id}:${identifier}`, 8, 15 * 60);
  if (!limit.allowed) {
    return { success: false, message: "Too many attempts. Please wait a few minutes and try again." };
  }

  const parsed = changePasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const full = await findAccountById(account.id);
  if (!full) return { success: false, message: "We couldn't find your account. Please sign in again." };

  const verified = await verifyAccountCredentials(full.email, parsed.data.currentPassword);
  if (!verified) {
    return { success: false, message: "Your current password is incorrect.", fieldErrors: { currentPassword: ["Your current password is incorrect."] } };
  }

  await updateAccountPassword(account.id, parsed.data.newPassword);
  revokeOtherSessions(account.id, await getCurrentSessionId());
  recordAuditEvent("PASSWORD_CHANGED", account.id);

  return { success: true };
}
