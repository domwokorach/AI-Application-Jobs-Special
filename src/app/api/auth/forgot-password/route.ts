import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";
import { findAccountByEmail } from "@/features/auth/services/accounts.service";
import { issuePasswordResetToken, invalidateOutstandingResetTokens } from "@/features/auth/services/tokens.service";
import { sendPasswordResetEmail } from "@/features/auth/services/email.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { getBaseUrl } from "@/lib/base-url";
import { ok, fail, failFromError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const identifier = await getRequestIdentifier();
    const limit = checkRateLimit(`forgot-password:${identifier}`, 5, 15 * 60);
    if (!limit.allowed) {
      // Still return success — never reveal that rate limiting (vs. account state) is why
      // nothing appears to have happened.
      return ok({});
    }

    const parsed = forgotPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Enter a valid email address.", 422, parsed.error.flatten().fieldErrors);
    }

    const account = await findAccountByEmail(parsed.data.email);
    if (account) {
      invalidateOutstandingResetTokens(account.id);
      const resetToken = issuePasswordResetToken(account.id);
      const baseUrl = await getBaseUrl();
      await sendPasswordResetEmail(account.id, { resetUrl: `${baseUrl}/reset-password?token=${resetToken}` });
      recordAuditEvent("PASSWORD_RESET_REQUESTED", account.id);
    }

    // Same response whether or not an account exists for this email — never branch the visible
    // result on account existence.
    return ok({});
  } catch (error) {
    return failFromError(error);
  }
}
