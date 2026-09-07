"use server";

import { submitApplication } from "@/features/applications/services/applications.service";
import type { SaveStepResult } from "@/features/applications/types/application.types";

export async function submitApplicationAction(applicationId: string): Promise<SaveStepResult> {
  await submitApplication(applicationId);
  return { success: true };
}
