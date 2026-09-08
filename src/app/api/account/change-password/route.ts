import { changePasswordSchema } from "@/features/profile/schemas/change-password.schema";
import { requireAuth } from "@/lib/auth/authorization";
import { findAccountById, checkAccountCredentials, updateAccountPassword } from "@/features/auth/services/accounts.service";
import { revokeOtherAuthSessions } from "@/features/auth/services/sessions.service";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { isSameOriginRequest } from "@/lib/auth/same-origin";
import { ok, fail, rateLimited, failFromError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) return fail("FORBIDDEN", "Cross-origin request rejected.", 403);

    const auth = await requireAuth();

    const identifier = await getRequestIdentifier();
    const limit = checkRateLimit(`change-password:${auth.userId}:${identifier}`, 8, 15 * 60);
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Check the highlighted fields.", 422, parsed.error.flatten().fieldErrors);
    }

    const account = await findAccountById(auth.userId);
    if (!account) return fail("UNAUTHORIZED", "Authentication is required.", 401);

    const check = await checkAccountCredentials(account.email, parsed.data.currentPassword);
    if (check.outcome !== "valid") {
      return fail("INVALID_CREDENTIALS", "Your current password is incorrect.", 401, {
        currentPassword: ["Your current password is incorrect."],
      });
    }

    await updateAccountPassword(auth.userId, parsed.data.newPassword);
    revokeOtherAuthSessions(auth.userId, auth.sessionId);
    recordAuditEvent("PASSWORD_CHANGED", auth.userId);

    return ok({});
  } catch (error) {
    return failFromError(error);
  }
}
