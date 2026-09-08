import { requireAuth } from "@/lib/auth/authorization";
import { findAccountById, toPublicAccount } from "@/features/auth/services/accounts.service";
import { ok, fail, failFromError } from "@/lib/api/response";

export async function GET() {
  try {
    const auth = await requireAuth();
    const account = await findAccountById(auth.userId);
    if (!account) return fail("UNAUTHORIZED", "Authentication is required.", 401);
    return ok({ user: toPublicAccount(account) });
  } catch (error) {
    return failFromError(error);
  }
}
