import { applicationSteps } from "@/constants/application-steps";
import type { ApplicationStepId } from "@/types";

export function stepIndexFor(stepId: ApplicationStepId): number {
  return applicationSteps.findIndex((step) => step.id === stepId);
}

export function nextStepId(stepId: ApplicationStepId): ApplicationStepId | undefined {
  const index = stepIndexFor(stepId);
  return applicationSteps[index + 1]?.id;
}

export function previousStepId(stepId: ApplicationStepId): ApplicationStepId | undefined {
  const index = stepIndexFor(stepId);
  return index > 0 ? applicationSteps[index - 1]?.id : undefined;
}

export function completionPercentage(stepId: ApplicationStepId): number {
  const index = stepIndexFor(stepId);
  return Math.round(((index + 1) / applicationSteps.length) * 100);
}
