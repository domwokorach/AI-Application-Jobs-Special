import { connection } from "next/server";
import { ApplicationPortal } from "@/components/application/application-portal";
import { PortalShell } from "@/components/layout/portal-shell";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getCandidateUser } from "@/lib/auth-session";
import { getEmailDeliveryStatus, getPdfStatus, getSubmission } from "@/features/applications/services/applications.service";

export default async function Home() {
  await connection();
  const [candidateId, account] = await Promise.all([getCandidateSessionId(), getCandidateUser()]);
  const submission = await getSubmission("demo-application");
  const owned = submission && submission.ownerId === candidateId ? submission : undefined;
  if (!owned) return <PortalShell><ApplicationPortal account={account} /></PortalShell>;

  const [emailDelivered, pdfStatus] = await Promise.all([
    getEmailDeliveryStatus("demo-application"),
    getPdfStatus("demo-application"),
  ]);
  return (
    <PortalShell>
      <ApplicationPortal
        account={account}
        initialSubmission={{ ...owned, emailDelivered: emailDelivered === true, pdfStatus }}
      />
    </PortalShell>
  );
}
