"use server";

import { registerSchema } from "@/features/auth/schemas/register.schema";
import type { AuthActionResult } from "@/features/auth/types/auth.types";

export async function registerAction(values: unknown): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false, message: "Check the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  return { success: false, message: "Account creation is not configured. Add an auth provider before enabling registration." };
}
