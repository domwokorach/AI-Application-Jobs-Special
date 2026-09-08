import { cookies } from "next/headers";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/authorization";
import { deleteAccount } from "@/features/auth/services/auth.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/same-origin";
import { ok, fail, rateLimited, failFromError } from "@/lib/api/response";

// Password (the "recent authentication" check — there is no step-up/MFA session concept here)
// plus a typed literal confirmation, mirroring the two-step UI confirmation.
const deleteAccountSchema = z.object({
  password: z.string().min(1, "Enter your password to confirm."),
  confirm: z.string().refine((value) => value === "DELETE", { message: 'Type "DELETE" to confirm.' }),
});

export async function DELETE(request: Request) {
  try {
    if (!isSameOriginRequest(request)) return fail("FORBIDDEN", "Cross-origin request rejected.", 403);

    const auth = await requireAuth();

    const limit = checkRateLimit(`delete-account:${auth.userId}`, 5, 60 * 60);
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const parsed = deleteAccountSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Check the highlighted fields.", 422, parsed.error.flatten().fieldErrors);
    }

    const result = await deleteAccount(auth.userId, parsed.data.password);

    if (result.outcome === "incorrect-password") {
      return fail("INVALID_CREDENTIALS", "Your password is incorrect.", 401, {
        password: ["Your password is incorrect."],
      });
    }
    if (result.outcome === "not-found") {
      return fail("UNAUTHORIZED", "Authentication is required.", 401);
    }

    const store = await cookies();
    clearAuthCookies(store);

    return ok({});
  } catch (error) {
    return failFromError(error);
  }
}
