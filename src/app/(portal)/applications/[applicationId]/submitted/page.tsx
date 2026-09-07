import { redirect } from "next/navigation";
import { ApplicationPortal } from "@/components/application/application-portal";
import { getEmailDeliveryStatus, getSubmission } from "@/features/applications/services/applications.service";

export default async function SubmittedPage({ params }: PageProps<"/applications/[applicationId]/submitted">) {
  const { applicationId } = await params;
  const submission = await getSubmission(applicationId);
  if (!submission) redirect(`/applications/${applicationId}/review`);

  const emailDelivered = await getEmailDeliveryStatus(applicationId);
  return <ApplicationPortal initialScreen="form" initialSubmission={{ ...submission, emailDelivered: emailDelivered === true }} />;
}
