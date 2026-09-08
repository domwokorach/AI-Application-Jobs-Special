import "server-only";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { AuthError } from "@/lib/auth/errors";

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
  };
  meta: {
    requestId: string;
    timestamp: string;
  };
};

function meta() {
  return { requestId: randomUUID(), timestamp: new Date().toISOString() };
}

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, meta: meta() }, { status });
}

export function fail(
  code: string,
  message: string,
  status: number,
  fieldErrors?: Record<string, string[] | undefined>,
): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error: { code, message, fieldErrors }, meta: meta() }, { status });
}

export function rateLimited(retryAfterSeconds: number): NextResponse<ApiResponse<never>> {
  const response = fail("RATE_LIMITED", "Too many attempts. Please wait a few minutes and try again.", 429);
  response.headers.set("Retry-After", String(retryAfterSeconds));
  return response;
}

/** Maps thrown errors from a route handler body to a safe envelope. Never leaks internal
 * verification detail (jose error types, stack traces) into the response. */
export function failFromError(error: unknown): NextResponse<ApiResponse<never>> {
  if (error instanceof AuthError) {
    return fail(error.code, error.message, error.status);
  }
  console.error("[api] unhandled error", error);
  return fail("INTERNAL_ERROR", "Something went wrong. Please try again.", 500);
}
