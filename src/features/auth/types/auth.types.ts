import type { PublicAccount } from "@/types";

export type AuthSession = { accountId: string; email: string };

export type AuthActionResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

export type RegisterResult =
  | { success: true; emailVerificationRequired: boolean }
  | { success: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

export type LoginResult =
  | { success: true; account: PublicAccount }
  | { success: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

/** Forgot-password intentionally never reveals whether the account existed. */
export type ForgotPasswordResult =
  | { success: true }
  | { success: false; message: string; fieldErrors?: Record<string, string[] | undefined> };

export type ResetTokenValidation =
  | { valid: true; accountId: string }
  | { valid: false; reason: "not-found" | "expired" | "used" };
