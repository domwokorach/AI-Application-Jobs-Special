import "server-only";
import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import { randomUUID } from "node:crypto";
import { encodedAccessSecret, jwtConfig } from "@/lib/auth/config";
import { authConfig } from "@/config/auth";
import type { UserRole } from "@/types";

const ALG = "HS256";
const ACCESS_TOKEN_TYPE = "access";

/** Minimal access-token payload. Never put anything here that isn't already safe to hand back
 * to the browser that owns this session — no addresses, no CV data, no reset tokens. */
export type AccessTokenClaims = {
  sub: string;
  role: UserRole;
  sessionId: string;
  typ: typeof ACCESS_TOKEN_TYPE;
  iat: number;
  exp: number;
  jti: string;
};

export type VerifyAccessTokenResult =
  | { valid: true; claims: AccessTokenClaims }
  | { valid: false; reason: "expired" | "invalid" };

export async function signAccessToken(input: { accountId: string; role: UserRole; sessionId: string }): Promise<string> {
  return new SignJWT({ role: input.role, sessionId: input.sessionId, typ: ACCESS_TOKEN_TYPE })
    .setProtectedHeader({ alg: ALG })
    .setSubject(input.accountId)
    .setIssuer(jwtConfig.issuer)
    .setAudience(jwtConfig.audience)
    .setIssuedAt()
    .setExpirationTime(`${authConfig.accessTokenTtlMinutes}m`)
    .setJti(randomUUID())
    .sign(encodedAccessSecret);
}

/**
 * Verifies signature, algorithm (pinned to HS256 — never trusts an `alg` from the token itself),
 * issuer, audience, and expiration, then checks the application-level `typ` claim so a token
 * minted for a different purpose can never be replayed here. Does not consult the session store
 * or account status — callers needing revocation/account-status enforcement (requireAuth) do
 * that themselves after this returns.
 */
export async function verifyAccessToken(token: string): Promise<VerifyAccessTokenResult> {
  try {
    const { payload } = await jwtVerify(token, encodedAccessSecret, {
      algorithms: [ALG],
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    });

    if (
      payload.typ !== ACCESS_TOKEN_TYPE ||
      typeof payload.sub !== "string" ||
      typeof payload.sessionId !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.jti !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number"
    ) {
      return { valid: false, reason: "invalid" };
    }

    return {
      valid: true,
      claims: {
        sub: payload.sub,
        role: payload.role as UserRole,
        sessionId: payload.sessionId,
        typ: ACCESS_TOKEN_TYPE,
        iat: payload.iat,
        exp: payload.exp,
        jti: payload.jti,
      },
    };
  } catch (error) {
    if (error instanceof joseErrors.JWTExpired) return { valid: false, reason: "expired" };
    return { valid: false, reason: "invalid" };
  }
}
