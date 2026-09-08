export const authConfig = {
  /**
   * When true, newly-registered accounts are flagged unverified and the dashboard shows a
   * "verify your email" prompt until they follow the emailed link. When false, the full
   * verification token/email plumbing still runs (so it's exercised and ready to flip on) but
   * never blocks access. Configurable per the organisation's onboarding policy.
   */
  requireEmailVerification: false,
  emailVerificationTokenTtlHours: 24,
  passwordResetTokenTtlMinutes: 60,
  /** Kept for reference/back-compat with the previous single-cookie session model; refresh
   * sessions now use `refreshTokenTtlDays` below. */
  sessionTtlDays: 30,

  /** Every JWT/session expiration lives here — never inline a TTL number elsewhere. */
  accessTokenTtlMinutes: 15,
  refreshTokenTtlDays: 30,
} as const;
