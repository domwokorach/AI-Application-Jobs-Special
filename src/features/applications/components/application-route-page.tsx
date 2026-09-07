import { notFound } from "next/navigation";
import { ApplicationPortal } from "@/components/application/application-portal";
import { applicationSteps } from "@/constants/application-steps";
import type { ApplicationStepId } from "@/types";

export function ApplicationRoutePage({ step }: { step: ApplicationStepId }) {
  const stepIndex = applicationSteps.findIndex((item) => item.id === step);
  if (stepIndex < 0) notFound();
  return <ApplicationPortal initialScreen="form" initialStep={stepIndex} />;
}
