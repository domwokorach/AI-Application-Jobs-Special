import "server-only";
import { generateSecureToken, hashToken } from "@/lib/tokens";
import { authConfig } from "@/config/auth";
import type { ResetTokenValidation } from "@/features/auth/types/auth.types";

type StoredToken = { accountId: string; expiresAt: string; usedAt?: string };

// Keyed by the SHA-256 hash of the raw token, never the raw token itself.
const verificationTokens = new Map<string, StoredToken>();
const resetTokens = new Map<string, StoredToken>();

function issue(store: Map<string, StoredToken>, accountId: string, ttlMs: number): string {
  const rawToken = generateSecureToken();
  store.set(hashToken(rawToken), { accountId, expiresAt: new Date(Date.now() + ttlMs).toISOString() });
  return rawToken;
}

export function issueVerificationToken(accountId: string): string {
  return issue(verificationTokens, accountId, authConfig.emailVerificationTokenTtlHours * 60 * 60 * 1000);
}

export function issuePasswordResetToken(accountId: string): string {
  return issue(resetTokens, accountId, authConfig.passwordResetTokenTtlMinutes * 60 * 1000);
}

/** Invalidate any reset tokens still outstanding for this account — called before issuing a
 * fresh one so an old, un-clicked email link can never be replayed after a newer request. */
export function invalidateOutstandingResetTokens(accountId: string): void {
  for (const [hash, token] of resetTokens) {
    if (token.accountId === accountId && !token.usedAt) resetTokens.delete(hash);
  }
}

function validate(store: Map<string, StoredToken>, rawToken: string): ResetTokenValidation {
  const record = store.get(hashToken(rawToken));
  if (!record) return { valid: false, reason: "not-found" };
  if (record.usedAt) return { valid: false, reason: "used" };
  if (new Date(record.expiresAt).getTime() <= Date.now()) return { valid: false, reason: "expired" };
  return { valid: true, accountId: record.accountId };
}

export function validateVerificationToken(rawToken: string): ResetTokenValidation {
  return validate(verificationTokens, rawToken);
}

export function validatePasswordResetToken(rawToken: string): ResetTokenValidation {
  return validate(resetTokens, rawToken);
}

function consume(store: Map<string, StoredToken>, rawToken: string): ResetTokenValidation {
  const result = validate(store, rawToken);
  if (result.valid) {
    const record = store.get(hashToken(rawToken));
    if (record) record.usedAt = new Date().toISOString();
  }
  return result;
}

export function consumeVerificationToken(rawToken: string): ResetTokenValidation {
  return consume(verificationTokens, rawToken);
}

export function consumePasswordResetToken(rawToken: string): ResetTokenValidation {
  return consume(resetTokens, rawToken);
}
