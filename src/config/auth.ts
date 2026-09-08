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
  sessionTtlDays: 30,
} as const;
