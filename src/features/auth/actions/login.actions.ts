"use server";

import { loginSchema } from "@/features/auth/schemas/login.schema";
import type { AuthActionResult } from "@/features/auth/types/auth.types";

export async function loginAction(values: unknown): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return { success: false, message: "Authentication is not configured. Add an auth provider before enabling sign in." };
}
