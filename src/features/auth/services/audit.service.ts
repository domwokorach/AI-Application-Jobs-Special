import "server-only";

export type AuditEventType =
  | "ACCOUNT_CREATED"
  | "LOGIN_SUCCEEDED"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_RESET_REQUESTED"
  | "PASSWORD_RESET_COMPLETED"
  | "PASSWORD_CHANGED"
  | "EMAIL_VERIFIED"
  | "PROFILE_UPDATED"
  | "TOKEN_REFRESHED"
  | "REFRESH_TOKEN_REUSE_DETECTED"
  | "ALL_SESSIONS_REVOKED"
  | "ACCOUNT_DELETION_REQUESTED"
  | "ACCOUNT_DELETED";

export type AuditEvent = {
  type: AuditEventType;
  accountId?: string;
  occurredAt: string;
  /** Never put passwords, tokens, or full credentials in here. */
  metadata?: Record<string, string | number | boolean>;
};

const events: AuditEvent[] = [];

export function recordAuditEvent(type: AuditEventType, accountId: string | undefined, metadata?: AuditEvent["metadata"]): void {
  events.push({ type, accountId, occurredAt: new Date().toISOString(), metadata });
  // A real deployment would forward this to a durable, access-controlled audit log/SIEM rather
  // than an in-memory array.
}

export function listAuditEventsForAccount(accountId: string): AuditEvent[] {
  return events.filter((event) => event.accountId === accountId);
}
