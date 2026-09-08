"use server";

import { personalDetailsSchema, contactDetailsSchema, addressDetailsSchema } from "@/features/profile/schemas/profile.schema";
import type { AuthActionResult } from "@/features/auth/types/auth.types";
import { updateAccountProfile } from "@/features/auth/services/accounts.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { requireCandidateUser } from "@/lib/auth-session";

export async function updatePersonalDetailsAction(values: unknown): Promise<AuthActionResult> {
  const account = await requireCandidateUser();
  const parsed = personalDetailsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await updateAccountProfile(account.id, parsed.data);
  recordAuditEvent("PROFILE_UPDATED", account.id, { section: "personal-details" });
  return { success: true };
}

export async function updateContactDetailsAction(values: unknown): Promise<AuthActionResult> {
  const account = await requireCandidateUser();
  const parsed = contactDetailsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await updateAccountProfile(account.id, parsed.data);
  recordAuditEvent("PROFILE_UPDATED", account.id, { section: "contact-details" });
  return { success: true };
}

export async function updateAddressAction(values: unknown): Promise<AuthActionResult> {
  const account = await requireCandidateUser();
  const parsed = addressDetailsSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await updateAccountProfile(account.id, {
    address: {
      line1: parsed.data.addressLine1,
      line2: parsed.data.addressLine2,
      city: parsed.data.city,
      county: parsed.data.county,
      postcode: parsed.data.postcode ?? "",
      country: parsed.data.country,
    },
  });
  recordAuditEvent("PROFILE_UPDATED", account.id, { section: "address" });
  return { success: true };
}
