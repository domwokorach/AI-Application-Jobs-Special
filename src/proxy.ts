import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE_NAME } from "@/lib/auth-session-cookie";

const PROTECTED_PREFIXES = ["/profile", "/account"];

/**
 * A UX convenience only: it just checks whether the auth session cookie is present, which is
 * enough to redirect a clearly-signed-out visitor to /login without a page flash. It is NOT the
 * security boundary — the cookie could be stale/expired/tampered, so every protected
 * page/action still calls requireCandidateUser() itself (see src/lib/auth-session.ts), which
 * validates the session server-side against the session store. Never rely on this proxy
 * (or hiding UI) as the actual access control.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();

  const hasSessionCookie = request.cookies.has(AUTH_SESSION_COOKIE_NAME);
  if (hasSessionCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile/:path*", "/account/:path*"],
};
