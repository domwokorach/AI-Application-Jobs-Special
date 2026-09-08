import "server-only";
import { randomUUID } from "node:crypto";
import { authConfig } from "@/config/auth";

export type AccountSession = {
  id: string;
  accountId: string;
  createdAt: string;
  expiresAt: string;
};

const sessionsById = new Map<string, AccountSession>();
const sessionIdsByAccount = new Map<string, Set<string>>();

export async function createAccountSession(accountId: string): Promise<AccountSession> {
  const now = Date.now();
  const session: AccountSession = {
    id: randomUUID(),
    accountId,
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + authConfig.sessionTtlDays * 24 * 60 * 60 * 1000).toISOString(),
  };
  sessionsById.set(session.id, session);
  const existing = sessionIdsByAccount.get(accountId) ?? new Set<string>();
  existing.add(session.id);
  sessionIdsByAccount.set(accountId, existing);
  return session;
}

export async function getAccountSession(sessionId: string): Promise<AccountSession | undefined> {
  const session = sessionsById.get(sessionId);
  if (!session) return undefined;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    revokeSession(sessionId);
    return undefined;
  }
  return session;
}

export function revokeSession(sessionId: string): void {
  const session = sessionsById.get(sessionId);
  if (!session) return;
  sessionsById.delete(sessionId);
  sessionIdsByAccount.get(session.accountId)?.delete(sessionId);
}

/** Revoke every other session for this account — used after a password reset/change so a
 * credential compromise on another device is cut off. */
export function revokeOtherSessions(accountId: string, keepSessionId?: string): void {
  const ids = sessionIdsByAccount.get(accountId);
  if (!ids) return;
  for (const id of [...ids]) {
    if (id !== keepSessionId) revokeSession(id);
  }
}
