/** Only allow same-origin, path-relative redirect targets (e.g. `?next=/applications/123`) —
 * never follow a scheme-relative ("//evil.com") or absolute URL, which would be an open
 * redirect. Returns the fallback for anything else. */
export function safeRedirectTarget(next: string | null | undefined, fallback = "/"): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("://")) return fallback;
  return next;
}
