"use server";

import { registerSchema } from "@/features/auth/schemas/register.schema";
import type { RegisterResult } from "@/features/auth/types/auth.types";
import { createAccount, findAccountByEmail } from "@/features/auth/services/accounts.service";
import { issueVerificationToken } from "@/features/auth/services/tokens.service";
import { sendVerificationEmail } from "@/features/auth/services/email.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { establishAuthSession } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { getBaseUrl } from "@/lib/base-url";
import { authConfig } from "@/config/auth";

export async function registerAction(values: unknown): Promise<RegisterResult> {
  const identifier = await getRequestIdentifier();
  const limit = checkRateLimit(`register:${identifier}`, 5, 15 * 60);
  if (!limit.allowed) {
    return { success: false, message: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const input = parsed.data;

  // Registration is the one auth endpoint where telling the candidate "that email is already
  // registered — sign in instead" is standard, expected UX (they just typed and confirmed the
  // address themselves), unlike login/forgot-password where the same disclosure would enable
  // account enumeration against addresses the caller doesn't already know.
  const existing = await findAccountByEmail(input.email);
  if (existing) {
    return {
      success: false,
      message: "An account already exists with this email address.",
      fieldErrors: { email: ["An account already exists with this email address. Try signing in instead."] },
    };
  }

  const account = await createAccount({
    email: input.email,
    password: input.password,
    title: input.title,
    firstName: input.firstName,
    middleNames: input.middleNames,
    lastName: input.lastName,
    preferredName: input.preferredName,
    mobile: input.mobile,
    alternativePhone: input.alternativePhone,
    address: {
      line1: input.addressLine1,
      line2: input.addressLine2,
      city: input.city,
      county: input.county,
      postcode: input.postcode ?? "",
      country: input.country,
    },
    emailVerified: !authConfig.requireEmailVerification,
  });

  // Always issue + send the verification email, even when verification isn't required to use
  // the portal, so the token/email plumbing and the "resend" flow are always live and testable.
  const verificationToken = issueVerificationToken(account.id);
  const baseUrl = await getBaseUrl();
  await sendVerificationEmail(account.id, {
    verifyUrl: `${baseUrl}/verify-email?token=${verificationToken}`,
  });

  await establishAuthSession(account.id);
  recordAuditEvent("ACCOUNT_CREATED", account.id, { emailVerificationRequired: authConfig.requireEmailVerification });

  return { success: true, emailVerificationRequired: authConfig.requireEmailVerification };
}
