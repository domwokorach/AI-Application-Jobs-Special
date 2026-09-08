/**
 * Just the cookie name constant, in its own edge-safe module (no node:crypto imports) so
 * middleware.ts — which runs in the Edge runtime — can check for the cookie's presence without
 * pulling in the full auth-session/accounts/sessions service graph.
 */
export const AUTH_SESSION_COOKIE_NAME = "auth_session_id";
