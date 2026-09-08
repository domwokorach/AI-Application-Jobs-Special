import "server-only";
import { siteConfig } from "@/config/site";

/**
 * Mirrors the mock email pattern used for application confirmations
 * (src/features/applications/services/applications.service.ts): a pure content builder,
 * separate from a "sender" that simulates a flaky provider on the first attempt and always
 * succeeds on retry so resend UI can be exercised deterministically. Swap `deliver()` for a
 * real provider (Resend, SES, etc.) without touching callers — they only see { delivered }.
 *
 * Reset/verification emails intentionally never include the account's password, application
 * data, or any sensitive personal information — only the single-purpose link.
 */
export type MockEmail = { subject: string; text: string };

export function buildVerificationEmail(details: { verifyUrl: string }): MockEmail {
  return {
    subject: "Verify your email address",
    text: `Welcome to ${siteConfig.name}.

Please verify your email address to finish setting up your account.

${details.verifyUrl}

This link will expire after the configured security period. If you didn't create this account, you can ignore this email.`,
  };
}

export function buildPasswordResetEmail(details: { resetUrl: string }): MockEmail {
  return {
    subject: "Reset your password",
    text: `We received a request to reset the password for your ${siteConfig.name} account.

${details.resetUrl}

This link will expire after the configured security period.

If you didn't request a password reset, you can ignore this email — your password will not be changed.`,
  };
}

const deliveryStatusByKey = new Map<string, boolean>();

async function deliver(key: string, _email: MockEmail): Promise<{ delivered: boolean }> {
  void _email;
  await new Promise((resolve) => setTimeout(resolve, 350));
  const attempted = deliveryStatusByKey.has(key);
  const delivered = attempted ? true : Math.random() > 0.15;
  deliveryStatusByKey.set(key, delivered);
  return { delivered };
}

export async function sendVerificationEmail(accountId: string, details: { verifyUrl: string }): Promise<{ delivered: boolean }> {
  return deliver(`verify:${accountId}`, buildVerificationEmail(details));
}

export async function sendPasswordResetEmail(accountId: string, details: { resetUrl: string }): Promise<{ delivered: boolean }> {
  return deliver(`reset:${accountId}`, buildPasswordResetEmail(details));
}
