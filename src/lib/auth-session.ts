import "server-only";
import { cookies } from "next/headers";
import { createAccountSession, getAccountSession, revokeSession } from "@/features/auth/services/sessions.service";
import { findAccountById, toPublicAccount } from "@/features/auth/services/accounts.service";
import { authConfig } from "@/config/auth";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth-session-cookie";
import type { PublicAccount } from "@/types";

export { AUTH_SESSION_COOKIE_NAME };

/**
 * The real, authenticated candidate session — distinct from the anonymous
 * `candidate_session_id` cookie in src/lib/candidate-session.ts, which pre-dates login and
 * still identifies guests who haven't created an account. The auth session cookie stores only
 * an opaque, unguessable session id; the session record (and its expiry) lives server-side in
 * sessions.service.ts, so it can be revoked (logout, password reset/change) without trusting
 * anything the client presents.
 */
export async function establishAuthSession(accountId: string): Promise<void> {
  const session = await createAccountSession(accountId);
  const store = await cookies();
  store.set(AUTH_SESSION_COOKIE_NAME, session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: authConfig.sessionTtlDays * 24 * 60 * 60,
  });
}

export async function destroyAuthSession(): Promise<void> {
  const store = await cookies();
  const sessionId = store.get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (sessionId) revokeSession(sessionId);
  store.delete(AUTH_SESSION_COOKIE_NAME);
}

/** The raw session id from the cookie, if any — used only to exempt the current session when
 * revoking every other session (e.g. after a candidate changes their own password while signed
 * in, they shouldn't be logged out of the tab they're sitting in). */
export async function getCurrentSessionId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(AUTH_SESSION_COOKIE_NAME)?.value;
}

/** Safe to call from Server Components — only reads. Returns undefined for guests or an expired session. */
export async function getCandidateUser(): Promise<PublicAccount | undefined> {
  const store = await cookies();
  const sessionId = store.get(AUTH_SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return undefined;

  const session = await getAccountSession(sessionId);
  if (!session) return undefined;

  const account = await findAccountById(session.accountId);
  return account ? toPublicAccount(account) : undefined;
}

/** Throws if there is no authenticated candidate — use in Server Actions/Route Handlers that
 * must not proceed for a guest (change password, update profile, etc.). This is the actual
 * enforcement point; never rely on a hidden button or client-side redirect alone. */
export async function requireCandidateUser(): Promise<PublicAccount> {
  const account = await getCandidateUser();
  if (!account) throw new Error("You must be signed in to do that.");
  return account;
}
