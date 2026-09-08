import "server-only";

/**
 * Lightweight CSRF mitigation for cookie-authenticated, state-changing routes. The app and its
 * API share a single origin (no separate frontend domain — see src/lib/api/client.ts), so an
 * Origin/Referer host comparison is sufficient without a token-based CSRF scheme. SameSite=Lax
 * on the auth cookies already blocks most cross-site form/script submissions; this is defence
 * in depth for the rest (e.g. browsers/proxies that drop SameSite).
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!host) return false;
  if (!origin) {
    // Same-origin navigations/fetches from same-origin pages always send Origin for
    // state-changing methods in modern browsers; a missing Origin on POST/DELETE is suspicious
    // enough to reject rather than fall back to trusting Referer alone.
    return false;
  }
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
