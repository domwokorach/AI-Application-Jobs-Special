import "server-only";
import { randomBytes, createHash } from "node:crypto";

/**
 * Single-use security tokens (email verification, password reset). The raw token is what's
 * emailed to the candidate and put in the URL; only its SHA-256 hash is ever stored server-side,
 * so a leaked datastore (or log line) can't be used to derive working tokens. Never log the raw
 * token.
 */
export function generateSecureToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
