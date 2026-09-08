import "server-only";
import { headers } from "next/headers";

/** Best-effort caller identifier for rate limiting. Trusts the platform's edge/proxy to set
 * x-forwarded-for correctly (Vercel and most reverse proxies do); falls back to a constant so
 * rate limiting still applies (conservatively, shared across all callers) if it's absent. */
export async function getRequestIdentifier(): Promise<string> {
  const store = await headers();
  const forwardedFor = store.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return "unknown";
}
