import { redirect } from "next/navigation";
import { ApplicationPortal } from "@/components/application/application-portal";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getEmailDeliveryStatus, getPdfStatus, getSubmission } from "@/features/applications/services/applications.service";

export default async function SubmittedPage({ params }: PageProps<"/applications/[applicationId]/submitted">) {
  const { applicationId } = await params;
  const submission = await getSubmission(applicationId);
  if (!submission) redirect(`/applications/${applicationId}/review`);

  const candidateId = await getCandidateSessionId();
  if (submission.ownerId !== candidateId) redirect("/dashboard");

  const [emailDelivered, pdfStatus] = await Promise.all([getEmailDeliveryStatus(applicationId), getPdfStatus(applicationId)]);
  return (
    <ApplicationPortal
      initialScreen="form"
      initialSubmission={{ ...submission, emailDelivered: emailDelivered === true, pdfStatus }}
    />
  );
}
