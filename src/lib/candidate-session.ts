import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { getCandidateUser } from "@/lib/auth-session";

export const CANDIDATE_SESSION_COOKIE_NAME = "candidate_session_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Identity used to authorize access to a candidate's own submitted documents/applications.
 * Prefers the real authenticated account id once the candidate has an account and is signed
 * in; falls back to the anonymous per-browser cookie for guests, so the existing
 * application/submission flow keeps working without requiring an account. All ~7 existing call
 * sites (application ownership checks, PDF download, submission actions) are unchanged — they
 * just now transparently resolve to the account id after login instead of the anonymous id.
 */

export async function getCandidateSessionId(): Promise<string | undefined> {
  const account = await getCandidateUser();
  if (account) return account.id;

  const store = await cookies();
  return store.get(CANDIDATE_SESSION_COOKIE_NAME)?.value;
}

export async function requireCandidateSessionId(): Promise<string> {
  const account = await getCandidateUser();
  if (account) return account.id;

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
