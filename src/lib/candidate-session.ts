import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";

export const CANDIDATE_SESSION_COOKIE_NAME = "candidate_session_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Lightweight anonymous session identity used to authorize access to a candidate's own
 * submitted documents. This app has no real auth provider configured yet (see src/lib/auth.ts) —
 * once one is, callers should switch to requireUser().id instead.
 */

// Server Components can only read cookies, not set them.
export async function getCandidateSessionId(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
}

// Server Actions and Route Handlers may set cookies, so this can issue a session on first use.
export async function requireCandidateSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(CANDIDATE_SESSION_COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
  });
  return id;
}
