import { cookies } from "next/headers";
import { tryRequireAuth } from "@/lib/auth/authorization";
import { logout } from "@/features/auth/services/auth.service";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/same-origin";
import { ok, fail, failFromError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) return fail("FORBIDDEN", "Cross-origin request rejected.", 403);

    const auth = await tryRequireAuth();
    if (auth) logout(auth.sessionId, auth.userId);

    const store = await cookies();
    clearAuthCookies(store);

    return ok({});
  } catch (error) {
    return failFromError(error);
  }
}
