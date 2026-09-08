import "server-only";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { findAccountById } from "@/features/auth/services/accounts.service";
import { UnauthorizedError, ForbiddenError } from "@/lib/auth/errors";
import type { UserRole } from "@/types";

/** What a valid, authenticated request proves — nothing more. A valid JWT establishes identity;
 * it does not by itself authorize access to any particular resource (see requireRole and
 * resource-ownership checks at the call site). */
export type AuthContext = {
  userId: string;
  role: UserRole;
  sessionId: string;
};

/**
 * The one place access tokens get parsed. Verifies the JWT (signature/alg/iss/aud/exp/typ, in
 * jwt.ts), then loads the account to reject anything but an ACTIVE account — this is what makes
 * a deleted/suspended account's still-unexpired access token stop working without needing to
 * hit the session store on every single request.
 */
export async function requireAuth(): Promise<AuthContext> {
  const store = await cookies();
  const token = store.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) throw new UnauthorizedError();

  const result = await verifyAccessToken(token);
  if (!result.valid) {
    throw new UnauthorizedError(result.reason === "expired" ? "TOKEN_EXPIRED" : "TOKEN_INVALID");
  }

  const account = await findAccountById(result.claims.sub);
  if (!account || account.status !== "ACTIVE") {
    throw new UnauthorizedError("ACCOUNT_INACTIVE", "This account is no longer active.");
  }

  return { userId: account.id, role: account.role, sessionId: result.claims.sessionId };
}

/** Best-effort variant for optional-auth call sites (e.g. rendering different nav for guests vs
 * signed-in users) — never throws, returns undefined for any invalid/missing/inactive session. */
export async function tryRequireAuth(): Promise<AuthContext | undefined> {
  try {
    return await requireAuth();
  } catch {
    return undefined;
  }
}

/** Role authorization — always a *second* check after requireAuth(), never a substitute for
 * resource-level ownership checks where the resource has an owner (see AGENTS.md §23-24). */
export function requireRole(auth: AuthContext, ...roles: UserRole[]): void {
  if (!roles.includes(auth.role)) throw new ForbiddenError();
}
