import { cookies } from "next/headers";
import { loginSchema } from "@/features/auth/schemas/login.schema";
import { loginWithPassword } from "@/features/auth/services/auth.service";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/auth/cookies";
import { ok, fail, rateLimited, failFromError } from "@/lib/api/response";

const GENERIC_FAILURE = "We couldn't sign you in with those details. Check your email address and password and try again.";

export async function POST(request: Request) {
  try {
    const identifier = await getRequestIdentifier();
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Check the highlighted fields.", 422, parsed.error.flatten().fieldErrors);
    }

    // Rate-limit per (ip, email) so one attacker can't lock out everyone by hammering a single
    // popular address, but repeated guesses against one account are still throttled.
    const limit = checkRateLimit(`login:${identifier}:${parsed.data.email.toLowerCase()}`, 8, 10 * 60);
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const result = await loginWithPassword(parsed.data.email, parsed.data.password);

    if (result.outcome === "invalid-credentials") {
      // Deliberately identical whether the email doesn't exist or the password was wrong.
      return fail("INVALID_CREDENTIALS", GENERIC_FAILURE, 401);
    }
    if (result.outcome === "account-inactive") {
      return fail("ACCOUNT_INACTIVE", "This account is no longer active. Contact support if you believe this is a mistake.", 403);
    }

    const store = await cookies();
    setAccessTokenCookie(store, result.tokens.accessToken);
    setRefreshTokenCookie(store, result.tokens.refreshToken);

    return ok({ user: result.account });
  } catch (error) {
    return failFromError(error);
  }
}
