import "server-only";
import { tryRequireAuth } from "@/lib/auth/authorization";
import { findAccountById, toPublicAccount } from "@/features/auth/services/accounts.service";
import type { PublicAccount } from "@/types";

/**
 * Thin, read-only candidate-facing wrapper around the general `requireAuth()`/`tryRequireAuth()`
 * helpers in `src/lib/auth/authorization.ts`. Kept as its own module (rather than inlined at
 * every call site) purely so the many existing Server Component callers — profile, account
 * settings, the portal shell, the homepage — don't need to change: they only ever wanted "is
 * someone signed in, and who are they" without caring about role/session plumbing.
 *
 * Session/token issuance and mutation (login, logout, refresh, delete) now lives behind
 * `/api/auth/*` and `features/auth/services/auth.service.ts` — this module never writes cookies.
 */

/** Safe to call from Server Components — only reads. Returns undefined for guests, an expired/
 * invalid access token, or an inactive account. */
export async function getCandidateUser(): Promise<PublicAccount | undefined> {
  const auth = await tryRequireAuth();
  if (!auth) return undefined;
  const account = await findAccountById(auth.userId);
  return account ? toPublicAccount(account) : undefined;
}

/** Throws if there is no authenticated candidate — use in Server Actions/Route Handlers that
 * must not proceed for a guest. This is the actual enforcement point; never rely on a hidden
 * button or client-side redirect alone. */
export async function requireCandidateUser(): Promise<PublicAccount> {
  const account = await getCandidateUser();
  if (!account) throw new Error("You must be signed in to do that.");
  return account;
}
