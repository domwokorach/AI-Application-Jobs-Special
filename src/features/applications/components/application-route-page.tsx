import { notFound } from "next/navigation";
import { ApplicationPortal } from "@/components/application/application-portal";
import { applicationSteps } from "@/constants/application-steps";
import { getEmailDeliveryStatus, getSubmission } from "@/features/applications/services/applications.service";
import type { ApplicationStepId } from "@/types";

export async function ApplicationRoutePage({ step }: { step: ApplicationStepId }) {
  const stepIndex = applicationSteps.findIndex((item) => item.id === step);
  if (stepIndex < 0) notFound();

  const submission = await getSubmission("demo-application");
  if (submission) {
    const emailDelivered = await getEmailDeliveryStatus("demo-application");
    return <ApplicationPortal initialScreen="form" initialSubmission={{ ...submission, emailDelivered: emailDelivered === true }} />;
  }

  return <ApplicationPortal initialScreen="form" initialStep={stepIndex} />;
}
