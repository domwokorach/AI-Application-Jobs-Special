"use client";

import type { PublicAccount } from "@/types";
import type { ApiResponse } from "@/lib/api/response";

/**
 * The single client-side boundary for talking to the auth API. Every auth-related mutation the
 * UI performs goes through here, not through ad-hoc `fetch` calls scattered across pages — this
 * is also the one place that implements the 401 → refresh-once → retry-once pattern, so no
 * individual page has to reimplement token refresh.
 *
 * CORS is intentionally not configured anywhere in this client: the frontend and the API are
 * served from the same Next.js origin, so credentialed cross-origin requests never happen here.
 * If a separate frontend origin is introduced later, an explicit allow-list must be added
 * server-side (see AGENTS.md §48) — do not add `Access-Control-Allow-Origin: *`.
 */

export class AuthExpiredError extends Error {
  constructor() {
    super("Your session has expired. Please sign in again.");
    this.name = "AuthExpiredError";
  }
}

export type ApiFieldErrors = Record<string, string[] | undefined>;

export class ApiError extends Error {
  readonly code: string;
  readonly fieldErrors?: ApiFieldErrors;

  constructor(code: string, message: string, fieldErrors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

let refreshInFlight: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = fetch("/api/auth/refresh", { method: "POST" })
      .then((response) => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

type ApiFetchOptions = {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
  /** Skip the automatic refresh-and-retry — used by the refresh/login/register calls themselves
   * so a failed login doesn't trigger a pointless refresh attempt. */
  skipAuthRetry?: boolean;
};

async function rawFetch(path: string, options: ApiFetchOptions): Promise<Response> {
  return fetch(path, {
    method: options.method ?? "GET",
    headers: options.body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  let response = await rawFetch(path, options);

  if (response.status === 401 && !options.skipAuthRetry) {
    const refreshed = await attemptRefresh();
    if (!refreshed) throw new AuthExpiredError();
    response = await rawFetch(path, options);
    if (response.status === 401) throw new AuthExpiredError();
  }

  const envelope = (await response.json()) as ApiResponse<T>;
  if (!envelope.success || envelope.data === undefined) {
    throw new ApiError(envelope.error?.code ?? "UNKNOWN_ERROR", envelope.error?.message ?? "Something went wrong.", envelope.error?.fieldErrors);
  }
  return envelope.data;
}

export const authApi = {
  /** `input` is validated authoritatively server-side against `registerSchema` — the client
   * type here is deliberately loose (the RHF form already validates against the same schema). */
  register: (input: Record<string, unknown>) =>
    apiFetch<{ user: PublicAccount; emailVerificationRequired: boolean }>("/api/auth/register", {
      method: "POST",
      body: input,
      skipAuthRetry: true,
    }),

  login: (input: { email: string; password: string }) =>
    apiFetch<{ user: PublicAccount }>("/api/auth/login", { method: "POST", body: input, skipAuthRetry: true }),

  me: () => apiFetch<{ user: PublicAccount }>("/api/auth/me"),

  logout: () => apiFetch<Record<string, never>>("/api/auth/logout", { method: "POST", skipAuthRetry: true }),

  logoutAll: () => apiFetch<Record<string, never>>("/api/auth/logout-all", { method: "POST" }),

  deleteAccount: (input: { password: string; confirm: string }) =>
    apiFetch<Record<string, never>>("/api/account", { method: "DELETE", body: input }),

  changePassword: (input: { currentPassword: string; newPassword: string; confirmNewPassword: string }) =>
    apiFetch<Record<string, never>>("/api/account/change-password", { method: "POST", body: input }),

  forgotPassword: (input: { email: string }) =>
    apiFetch<Record<string, never>>("/api/auth/forgot-password", { method: "POST", body: input, skipAuthRetry: true }),

  resetPassword: (input: { token: string; password: string; confirmPassword: string }) =>
    apiFetch<Record<string, never>>("/api/auth/reset-password", { method: "POST", body: input, skipAuthRetry: true }),
};
