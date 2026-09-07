"use server";

import { forgotPasswordSchema } from "@/features/auth/schemas/forgot-password.schema";
import type { AuthActionResult } from "@/features/auth/types/auth.types";

export async function forgotPasswordAction(values: unknown): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Enter a valid email address.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return { success: false, message: "Password reset delivery is not configured. Add an email provider to enable this." };
}
