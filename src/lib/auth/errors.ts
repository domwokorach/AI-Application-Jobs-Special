import "server-only";

/** Safe error codes returned to the client. Internal verification detail (which jose error,
 * which claim failed, stack traces) never leaves this module. */
export type AuthErrorCode =
  | "UNAUTHORIZED"
  | "TOKEN_EXPIRED"
  | "TOKEN_INVALID"
  | "SESSION_REVOKED"
  | "ACCOUNT_INACTIVE"
  | "FORBIDDEN";

export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly status: number;

  constructor(code: AuthErrorCode, message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
  }
}

export class UnauthorizedError extends AuthError {
  constructor(code: Exclude<AuthErrorCode, "FORBIDDEN"> = "UNAUTHORIZED", message = "Authentication is required.") {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "You do not have permission to do that.") {
    super("FORBIDDEN", message, 403);
  }
}
