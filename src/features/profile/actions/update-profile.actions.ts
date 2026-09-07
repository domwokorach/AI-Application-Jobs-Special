"use server";

import { profileSchema } from "@/features/profile/schemas/profile.schema";

export async function updateProfileAction(values: unknown) {
  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  throw new Error("Profile persistence has not been configured. Connect a database in src/lib/db.ts.");
}
