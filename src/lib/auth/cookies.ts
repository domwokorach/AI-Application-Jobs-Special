import "server-only";
import type { NextResponse } from "next/server";
import { authConfig } from "@/config/auth";

/** Edge-safe name constants only — no crypto/service imports — so `src/proxy.ts` can check for
 * cookie presence without pulling in the full auth graph. */
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const isProduction = process.env.NODE_ENV === "production";

type CookieJar = {
  set(name: string, value: string, options: Record<string, unknown>): void;
  delete(options: { name: string; path?: string }): void;
};

export function setAccessTokenCookie(jar: CookieJar | NextResponse["cookies"], token: string): void {
  jar.set(ACCESS_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: authConfig.accessTokenTtlMinutes * 60,
  });
}

export function setRefreshTokenCookie(jar: CookieJar | NextResponse["cookies"], token: string): void {
  jar.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: isProduction,
    // Scoped to the auth API only — the refresh token never needs to leave this path, which
    // keeps it out of every ordinary page/asset request.
    sameSite: "lax",
    path: "/api/auth",
    maxAge: authConfig.refreshTokenTtlDays * 24 * 60 * 60,
  });
}

export function clearAuthCookies(jar: CookieJar | NextResponse["cookies"]): void {
  jar.delete({ name: ACCESS_TOKEN_COOKIE, path: "/" });
  jar.delete({ name: REFRESH_TOKEN_COOKIE, path: "/api/auth" });
}
