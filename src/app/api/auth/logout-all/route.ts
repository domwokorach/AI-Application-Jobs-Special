import { cookies } from "next/headers";
import { requireAuth } from "@/lib/auth/authorization";
import { logoutAllSessions } from "@/features/auth/services/auth.service";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/same-origin";
import { ok, fail, failFromError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) return fail("FORBIDDEN", "Cross-origin request rejected.", 403);

    const auth = await requireAuth();
    logoutAllSessions(auth.userId);

    const store = await cookies();
    clearAuthCookies(store);

    return ok({});
  } catch (error) {
    return failFromError(error);
  }
}
