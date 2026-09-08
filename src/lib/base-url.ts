import "server-only";
import { headers } from "next/headers";

/** Best-effort absolute origin for building links inside emails (verification, password reset). */
export async function getBaseUrl(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const store = await headers();
  const host = store.get("x-forwarded-host") ?? store.get("host") ?? "localhost:3000";
  const protocol = store.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}
