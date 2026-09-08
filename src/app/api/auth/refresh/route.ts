import { cookies } from "next/headers";
import { refreshSession } from "@/features/auth/services/auth.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { REFRESH_TOKEN_COOKIE, setAccessTokenCookie, setRefreshTokenCookie, clearAuthCookies } from "@/lib/auth/cookies";
import { isSameOriginRequest } from "@/lib/auth/same-origin";
import { ok, fail, rateLimited, failFromError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    if (!isSameOriginRequest(request)) return fail("FORBIDDEN", "Cross-origin request rejected.", 403);

    const identifier = await getRequestIdentifier();
    const limit = checkRateLimit(`refresh:${identifier}`, 30, 5 * 60);
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const store = await cookies();
    const rawRefreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!rawRefreshToken) {
      clearAuthCookies(store);
      return fail("UNAUTHORIZED", "No active session to refresh.", 401);
    }

    const result = await refreshSession(rawRefreshToken);

    if (result.outcome !== "success") {
      // Both "reuse-detected" (possible token theft) and "rejected" (expired/invalid/revoked)
      // end the same way from the client's point of view: the local session is dead.
      clearAuthCookies(store);
      return fail(
        result.outcome === "reuse-detected" ? "SESSION_REVOKED" : "TOKEN_INVALID",
        "Your session is no longer valid. Please sign in again.",
        401,
      );
    }

    setAccessTokenCookie(store, result.tokens.accessToken);
    setRefreshTokenCookie(store, result.tokens.refreshToken);

    return ok({ user: result.account });
  } catch (error) {
    return failFromError(error);
  }
}
