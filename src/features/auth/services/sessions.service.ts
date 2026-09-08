import "server-only";
import { randomUUID, randomBytes, timingSafeEqual } from "node:crypto";
import { authConfig } from "@/config/auth";
import { hashToken } from "@/lib/tokens";

/** Server-side refresh-session record. The raw refresh token is never stored — only the hash of
 * its secret half. `revokedAt` + `replacedBySessionId` are what make rotation-reuse detectable:
 * a session that has already been rotated away is still present (so a replayed old refresh
 * token resolves to a record), just marked revoked. */
export type AuthSession = {
  id: string;
  accountId: string;
  secretHash: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt?: string;
  revokedAt?: string;
  replacedBySessionId?: string;
};

const sessionsById = new Map<string, AuthSession>();
const sessionIdsByAccount = new Map<string, Set<string>>();

/** Opaque refresh token shape: `${sessionId}.${secret}`. Not a JWT — the session id gives O(1)
 * lookup and the secret is compared against its stored hash in constant time. */
function formatRefreshToken(sessionId: string, secret: string): string {
  return `${sessionId}.${secret}`;
}

function parseRefreshToken(rawToken: string): { sessionId: string; secret: string } | undefined {
  const separatorIndex = rawToken.indexOf(".");
  if (separatorIndex <= 0) return undefined;
  return { sessionId: rawToken.slice(0, separatorIndex), secret: rawToken.slice(separatorIndex + 1) };
}

function indexSession(session: AuthSession): void {
  sessionsById.set(session.id, session);
  const existing = sessionIdsByAccount.get(session.accountId) ?? new Set<string>();
  existing.add(session.id);
  sessionIdsByAccount.set(session.accountId, existing);
}

function newSessionRecord(accountId: string): { session: AuthSession; secret: string } {
  const now = Date.now();
  const secret = randomBytes(32).toString("base64url");
  const session: AuthSession = {
    id: randomUUID(),
    accountId,
    secretHash: hashToken(secret),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + authConfig.refreshTokenTtlDays * 24 * 60 * 60 * 1000).toISOString(),
  };
  return { session, secret };
}

export async function createAuthSession(accountId: string): Promise<{ session: AuthSession; refreshToken: string }> {
  const { session, secret } = newSessionRecord(accountId);
  indexSession(session);
  return { session, refreshToken: formatRefreshToken(session.id, secret) };
}

export type RefreshValidation =
  | { valid: true; session: AuthSession }
  | { valid: false; reason: "not-found" | "malformed" | "expired" | "revoked" };

function checkRefreshToken(rawToken: string): RefreshValidation {
  const parsed = parseRefreshToken(rawToken);
  if (!parsed) return { valid: false, reason: "malformed" };

  const session = sessionsById.get(parsed.sessionId);
  if (!session) return { valid: false, reason: "not-found" };

  const providedHash = Buffer.from(hashToken(parsed.secret));
  const storedHash = Buffer.from(session.secretHash);
  if (providedHash.length !== storedHash.length || !timingSafeEqual(providedHash, storedHash)) {
    return { valid: false, reason: "not-found" };
  }

  if (session.revokedAt) return { valid: false, reason: "revoked" };
  if (new Date(session.expiresAt).getTime() <= Date.now()) return { valid: false, reason: "expired" };

  return { valid: true, session };
}

export function validateRefreshToken(rawToken: string): RefreshValidation {
  return checkRefreshToken(rawToken);
}

export function revokeAuthSession(sessionId: string, replacedBySessionId?: string): void {
  const session = sessionsById.get(sessionId);
  if (!session || session.revokedAt) return;
  session.revokedAt = new Date().toISOString();
  if (replacedBySessionId) session.replacedBySessionId = replacedBySessionId;
}

/** Revoke every session for this account — used for logout-all, password reset/change, and
 * refresh-token reuse detection (a replayed, already-rotated token is treated as a possible
 * theft signal, so every session for the account is cut off, not just the one being replayed). */
export function revokeAllAuthSessions(accountId: string): void {
  const ids = sessionIdsByAccount.get(accountId);
  if (!ids) return;
  for (const id of ids) revokeAuthSession(id);
}

/** Revoke every other session for this account — used after a password change while signed in,
 * so the current tab/device stays authenticated. */
export function revokeOtherAuthSessions(accountId: string, keepSessionId?: string): void {
  const ids = sessionIdsByAccount.get(accountId);
  if (!ids) return;
  for (const id of ids) {
    if (id !== keepSessionId) revokeAuthSession(id);
  }
}

/**
 * Validates and rotates a refresh token in one step: the old session is revoked (recording what
 * replaced it) and a new session + refresh token is issued. Reuse of an already-revoked token is
 * reported distinctly so the caller can treat it as a compromise signal and revoke everything.
 */
export type RotateResult =
  | { outcome: "rotated"; accountId: string; session: AuthSession; refreshToken: string }
  | { outcome: "reuse-detected"; accountId: string }
  | { outcome: "rejected"; reason: "not-found" | "malformed" | "expired" | "revoked" };

export function rotateAuthSession(rawToken: string): RotateResult {
  const result = checkRefreshToken(rawToken);

  if (!result.valid) {
    if (result.reason === "revoked") {
      // The session record for a *malformed/not-found* token is unknown, so there's nothing to
      // attribute reuse to. A "revoked" result means we found a real, previously-issued session
      // that has already been rotated away — that's the replay case.
      const parsed = parseRefreshToken(rawToken);
      const session = parsed ? sessionsById.get(parsed.sessionId) : undefined;
      if (session) {
        revokeAllAuthSessions(session.accountId);
        return { outcome: "reuse-detected", accountId: session.accountId };
      }
    }
    return { outcome: "rejected", reason: result.reason };
  }

  const { session } = result;
  session.lastUsedAt = new Date().toISOString();
  const { session: nextSession, secret } = newSessionRecord(session.accountId);
  indexSession(nextSession);
  revokeAuthSession(session.id, nextSession.id);

  return {
    outcome: "rotated",
    accountId: session.accountId,
    session: nextSession,
    refreshToken: formatRefreshToken(nextSession.id, secret),
  };
}
