import { connection } from "next/server";
import { ApplicationPortal } from "@/components/application/application-portal";
import { PortalShell } from "@/components/layout/portal-shell";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getEmailDeliveryStatus, getPdfStatus, getSubmission } from "@/features/applications/services/applications.service";

export default async function Home() {
  await connection();
  const candidateId = await getCandidateSessionId();
  const submission = await getSubmission("demo-application");
  const owned = submission && submission.ownerId === candidateId ? submission : undefined;
  if (!owned) return <PortalShell><ApplicationPortal /></PortalShell>;

  const [emailDelivered, pdfStatus] = await Promise.all([
    getEmailDeliveryStatus("demo-application"),
    getPdfStatus("demo-application"),
  ]);
  return (
    <PortalShell>
      <ApplicationPortal initialSubmission={{ ...owned, emailDelivered: emailDelivered === true, pdfStatus }} />
    </PortalShell>
  );
}
