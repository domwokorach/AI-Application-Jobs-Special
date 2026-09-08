import "server-only";
import {
  createAccount,
  checkAccountCredentials,
  findAccountByEmail,
  findAccountById,
  toPublicAccount,
  updateAccountStatus,
} from "@/features/auth/services/accounts.service";
import {
  createAuthSession,
  revokeAuthSession,
  revokeAllAuthSessions,
  rotateAuthSession,
} from "@/features/auth/services/sessions.service";
import { signAccessToken } from "@/lib/auth/jwt";
import { recordAuditEvent } from "@/features/auth/services/audit.service";
import { verifyPassword } from "@/lib/password";
import type { CreateAccountInput } from "@/features/auth/services/accounts.service";
import type { PublicAccount } from "@/types";

export type AuthTokens = { accessToken: string; refreshToken: string };

async function issueTokens(accountId: string, role: PublicAccount["role"]): Promise<AuthTokens> {
  const { session, refreshToken } = await createAuthSession(accountId);
  const accessToken = await signAccessToken({ accountId, role, sessionId: session.id });
  return { accessToken, refreshToken };
}

export type RegisterOutcome =
  | { outcome: "created"; account: PublicAccount; tokens: AuthTokens }
  | { outcome: "email-taken" };

export async function registerAccount(
  input: Omit<CreateAccountInput, "role">,
): Promise<RegisterOutcome> {
  const existing = await findAccountByEmail(input.email);
  if (existing) return { outcome: "email-taken" };

  // role is deliberately not accepted from `input` — registration always creates a CANDIDATE.
  const account = await createAccount(input);
  const tokens = await issueTokens(account.id, account.role);
  recordAuditEvent("ACCOUNT_CREATED", account.id, { emailVerificationRequired: !input.emailVerified });

  return { outcome: "created", account: toPublicAccount(account), tokens };
}

export type LoginOutcome =
  | { outcome: "success"; account: PublicAccount; tokens: AuthTokens }
  | { outcome: "invalid-credentials" }
  | { outcome: "account-inactive" };

export async function loginWithPassword(email: string, password: string): Promise<LoginOutcome> {
  const result = await checkAccountCredentials(email, password);

  if (result.outcome === "invalid-credentials") {
    recordAuditEvent("LOGIN_FAILED", undefined, { emailAttempted: email.toLowerCase() });
    return { outcome: "invalid-credentials" };
  }

  if (result.outcome === "account-inactive") {
    recordAuditEvent("LOGIN_FAILED", result.account.id, { reason: "account-inactive" });
    return { outcome: "account-inactive" };
  }

  const tokens = await issueTokens(result.account.id, result.account.role);
  recordAuditEvent("LOGIN_SUCCEEDED", result.account.id);
  return { outcome: "success", account: toPublicAccount(result.account), tokens };
}

export type RefreshOutcome =
  | { outcome: "success"; account: PublicAccount; tokens: AuthTokens }
  | { outcome: "reuse-detected" }
  | { outcome: "rejected" };

/** Refresh-token rotation. A replayed, already-rotated token revokes every session for the
 * account (see sessions.service.rotateAuthSession) — that's reported back as "reuse-detected"
 * so the caller can clear cookies and force re-login, distinct from a plain invalid/expired
 * token. */
export async function refreshSession(rawRefreshToken: string): Promise<RefreshOutcome> {
  const result = rotateAuthSession(rawRefreshToken);

  if (result.outcome === "reuse-detected") {
    recordAuditEvent("REFRESH_TOKEN_REUSE_DETECTED", result.accountId);
    return { outcome: "reuse-detected" };
  }
  if (result.outcome === "rejected") {
    return { outcome: "rejected" };
  }

  const account = await findAccountById(result.accountId);
  if (!account || account.status !== "ACTIVE") {
    revokeAuthSession(result.session.id);
    return { outcome: "rejected" };
  }

  const accessToken = await signAccessToken({ accountId: account.id, role: account.role, sessionId: result.session.id });
  recordAuditEvent("TOKEN_REFRESHED", account.id);
  return { outcome: "success", account: toPublicAccount(account), tokens: { accessToken, refreshToken: result.refreshToken } };
}

export function logout(sessionId: string, accountId?: string): void {
  revokeAuthSession(sessionId);
  if (accountId) recordAuditEvent("LOGOUT", accountId);
}

export function logoutAllSessions(accountId: string): void {
  revokeAllAuthSessions(accountId);
  recordAuditEvent("ALL_SESSIONS_REVOKED", accountId);
}

export type DeleteAccountOutcome = { outcome: "deleted" } | { outcome: "incorrect-password" } | { outcome: "not-found" };

/**
 * Soft-deletes the portal account (status -> DELETED) and revokes every session. This is scoped
 * to the authentication account only — it intentionally does not attempt to delete or anonymise
 * any submitted recruitment records, because this codebase has no submitted-application
 * persistence to reconcile against yet (POST /api/applications is still a 501 stub). A real
 * deployment must define that retention/anonymisation policy separately (see AGENTS.md §38-42)
 * before this can safely cascade beyond the account record.
 */
export async function deleteAccount(accountId: string, password: string): Promise<DeleteAccountOutcome> {
  const account = await findAccountById(accountId);
  if (!account) return { outcome: "not-found" };

  const verified = await verifyPassword(password, account.passwordHash);
  if (!verified) return { outcome: "incorrect-password" };

  recordAuditEvent("ACCOUNT_DELETION_REQUESTED", accountId);
  await updateAccountStatus(accountId, "DELETED");
  revokeAllAuthSessions(accountId);
  recordAuditEvent("ACCOUNT_DELETED", accountId);

  return { outcome: "deleted" };
}
