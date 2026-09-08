import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookies";

const PROTECTED_PREFIXES = ["/profile", "/account"];

/**
 * A UX convenience only: it just checks whether an access-token cookie is present, which is
 * enough to redirect a clearly-signed-out visitor to /login without a page flash. It is NOT the
 * security boundary — the cookie could be stale/expired/tampered, so every protected
 * page/action still calls requireCandidateUser()/requireAuth() itself (see src/lib/auth-session.ts
 * and src/lib/auth/authorization.ts), which verifies the JWT and account status server-side.
 * Never rely on this proxy (or hiding UI) as the actual access control.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();

  const hasAccessTokenCookie = request.cookies.has(ACCESS_TOKEN_COOKIE);
  if (hasAccessTokenCookie) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/profile/:path*", "/account/:path*"],
};
