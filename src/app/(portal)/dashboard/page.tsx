import { connection } from "next/server";
import { ApplicationPortal } from "@/components/application/application-portal";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getEmailDeliveryStatus, getPdfStatus, getSubmission } from "@/features/applications/services/applications.service";

export default async function DashboardPage() {
  await connection();
  const candidateId = await getCandidateSessionId();
  const submission = await getSubmission("demo-application");
  const owned = submission && submission.ownerId === candidateId ? submission : undefined;
  if (!owned) return <ApplicationPortal />;

  const [emailDelivered, pdfStatus] = await Promise.all([
    getEmailDeliveryStatus("demo-application"),
    getPdfStatus("demo-application"),
  ]);
  return <ApplicationPortal initialSubmission={{ ...owned, emailDelivered: emailDelivered === true, pdfStatus }} />;
}
