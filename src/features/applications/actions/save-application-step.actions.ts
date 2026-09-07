"use server";

import { applicationSchema } from "@/features/applications/schemas/application.schema";
import { saveApplicationStep } from "@/features/applications/services/applications.service";
import type { ApplicationStepId } from "@/types";
import type { SaveStepResult } from "@/features/applications/types/application.types";

export async function saveApplicationStepAction(
  applicationId: string,
  step: ApplicationStepId,
  values: Record<string, unknown>,
): Promise<SaveStepResult> {
  const parsed = applicationSchema.partial().safeParse(values);
  if (!parsed.success) {
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await saveApplicationStep(applicationId, step, parsed.data);
  return { success: true };
}
