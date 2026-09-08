"use server";

import { getCandidateUser, destroyAuthSession } from "@/lib/auth-session";
import { recordAuditEvent } from "@/features/auth/services/audit.service";

export async function logoutAction(): Promise<{ success: true }> {
  const account = await getCandidateUser();
  await destroyAuthSession();
  if (account) recordAuditEvent("LOGOUT", account.id);
  return { success: true };
}
