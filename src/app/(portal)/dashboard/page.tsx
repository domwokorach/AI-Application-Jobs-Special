import { connection } from "next/server";
import { ApplicationPortal } from "@/components/application/application-portal";
import { getEmailDeliveryStatus, getSubmission } from "@/features/applications/services/applications.service";

export default async function DashboardPage() {
  await connection();
  const submission = await getSubmission("demo-application");
  const emailDelivered = submission ? await getEmailDeliveryStatus("demo-application") : false;
  return submission ? <ApplicationPortal initialSubmission={{ ...submission, emailDelivered: emailDelivered === true }} /> : <ApplicationPortal />;
}
