import type { ApplicationStepId } from "@/types";

export type ApplicationWizardStepProps = {
  stepId: ApplicationStepId;
  onEdit?: (stepId: ApplicationStepId) => void;
};

export type SaveStepResult = { success: true } | { success: false; fieldErrors: Record<string, string[] | undefined> };
