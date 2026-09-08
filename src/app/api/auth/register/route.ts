import { cookies } from "next/headers";
import { registerSchema } from "@/features/auth/schemas/register.schema";
import { registerAccount } from "@/features/auth/services/auth.service";
import { issueVerificationToken } from "@/features/auth/services/tokens.service";
import { sendVerificationEmail } from "@/features/auth/services/email.service";
import { authConfig } from "@/config/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRequestIdentifier } from "@/lib/request-ip";
import { getBaseUrl } from "@/lib/base-url";
import { setAccessTokenCookie, setRefreshTokenCookie } from "@/lib/auth/cookies";
import { ok, fail, rateLimited, failFromError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const identifier = await getRequestIdentifier();
    const limit = checkRateLimit(`register:${identifier}`, 5, 15 * 60);
    if (!limit.allowed) return rateLimited(limit.retryAfterSeconds);

    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Check the highlighted fields.", 422, parsed.error.flatten().fieldErrors);
    }
    const input = parsed.data;

    const result = await registerAccount({
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

    if (result.outcome === "email-taken") {
      return fail("EMAIL_TAKEN", "An account already exists with this email address.", 409, {
        email: ["An account already exists with this email address. Try signing in instead."],
      });
    }

    // Always issue + send the verification email, even when verification isn't required to use
    // the portal, so the token/email plumbing and the "resend" flow are always live and testable.
    const verificationToken = issueVerificationToken(result.account.id);
    const baseUrl = await getBaseUrl();
    await sendVerificationEmail(result.account.id, { verifyUrl: `${baseUrl}/verify-email?token=${verificationToken}` });

    const store = await cookies();
    setAccessTokenCookie(store, result.tokens.accessToken);
    setRefreshTokenCookie(store, result.tokens.refreshToken);

    return ok({ user: result.account, emailVerificationRequired: authConfig.requireEmailVerification }, 201);
  } catch (error) {
    return failFromError(error);
  }
}
