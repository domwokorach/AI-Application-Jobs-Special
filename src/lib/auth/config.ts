import "server-only";

/**
 * Signing secret and JWT identity claims, loaded once from environment configuration. Never
 * imported by client code and never re-exported through anything that reaches the browser.
 *
 * In production, a missing `JWT_ACCESS_SECRET` fails fast at import time — the app must not
 * silently start with a guessable/default signing key. In development we fall back to a fixed,
 * clearly-insecure default (logged once) so `pnpm dev` keeps working without extra setup, the
 * same way the rest of this mock-backed app behaves.
 */

const INSECURE_DEV_SECRET = "dev-only-insecure-jwt-access-secret-do-not-use-in-production";

function resolveAccessSecret(): string {
  const configured = process.env.JWT_ACCESS_SECRET;
  if (configured && configured.length >= 32) return configured;

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_ACCESS_SECRET is missing or too short. Set a random secret of at least 32 characters before starting in production.",
    );
  }

  if (!configured) {
    console.warn(
      "[auth] JWT_ACCESS_SECRET is not set — using an insecure development default. Set JWT_ACCESS_SECRET in .env before deploying.",
    );
  }
  return INSECURE_DEV_SECRET;
}

export const jwtConfig = {
  accessSecret: resolveAccessSecret(),
  issuer: process.env.JWT_ISSUER ?? "ai-application-special",
  audience: process.env.JWT_AUDIENCE ?? "ai-application-special-portal",
} as const;

export const encodedAccessSecret = new TextEncoder().encode(jwtConfig.accessSecret);
