import "server-only";

/**
 * In-memory fixed-window rate limiter for sensitive auth endpoints (login, register,
 * forgot-password, reset-password, resend-verification). A production deployment must move
 * this to a shared store (Redis, Upstash, the auth provider's own limiter, etc.) since an
 * in-memory Map only limits a single server instance and is reset on restart — this is
 * intentionally a mock-API-grade placeholder, not a production control.
 */
type Bucket = { count: number; windowStartMs: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function checkRateLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStartMs >= windowMs) {
    buckets.set(key, { count: 1, windowStartMs: now });
    return { allowed: true };
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((existing.windowStartMs + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true };
}
