import { notFound } from "next/navigation";
import { ApplicationPortal } from "@/components/application/application-portal";
import { applicationSteps } from "@/constants/application-steps";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getEmailDeliveryStatus, getPdfStatus, getSubmission } from "@/features/applications/services/applications.service";
import type { ApplicationStepId } from "@/types";

export async function ApplicationRoutePage({ step }: { step: ApplicationStepId }) {
  const stepIndex = applicationSteps.findIndex((item) => item.id === step);
  if (stepIndex < 0) notFound();

  const candidateId = await getCandidateSessionId();
  const submission = await getSubmission("demo-application");
  const owned = submission && submission.ownerId === candidateId ? submission : undefined;
  if (owned) {
    const [emailDelivered, pdfStatus] = await Promise.all([
      getEmailDeliveryStatus("demo-application"),
      getPdfStatus("demo-application"),
    ]);
    return (
      <ApplicationPortal
        initialScreen="form"
        initialSubmission={{ ...owned, emailDelivered: emailDelivered === true, pdfStatus }}
      />
    );
  }

  return <ApplicationPortal initialScreen="form" initialStep={stepIndex} />;
}
