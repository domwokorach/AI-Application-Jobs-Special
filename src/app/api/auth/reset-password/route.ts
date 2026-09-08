import { resetPasswordSchema } from "@/features/auth/schemas/reset-password.schema";
import { consumePasswordResetToken } from "@/features/auth/services/tokens.service";
import { updateAccountPassword } from "@/features/auth/services/accounts.service";
import { revokeAllAuthSessions } from "@/features/auth/services/sessions.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { ok, fail, rateLimited, failFromError } from "@/lib/api/response";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const identifier = await getRequestIdentifier();
    const limit = checkRateLimit(`reset-password:${identifier}`, 10, 15 * 60);
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const parsed = resetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Check the highlighted fields.", 422, parsed.error.flatten().fieldErrors);
    }

    // Consume (single-use) rather than just validate — prevents the same link being replayed to
    // reset the password a second time.
    const result = consumePasswordResetToken(parsed.data.token);
    if (!result.valid) {
      return fail("TOKEN_INVALID", "This password reset link is no longer valid. It may have expired or already been used.", 400);
    }

    await updateAccountPassword(result.accountId, parsed.data.password);
    // A password reset is a signal the credential may have been compromised — cut off every
    // session (there's no "current" session to preserve here; the caller isn't signed in).
    revokeAllAuthSessions(result.accountId);
    recordAuditEvent("PASSWORD_RESET_COMPLETED", result.accountId);

    const store = await cookies();
    clearAuthCookies(store);

    return ok({});
  } catch (error) {
    return failFromError(error);
  }
}
