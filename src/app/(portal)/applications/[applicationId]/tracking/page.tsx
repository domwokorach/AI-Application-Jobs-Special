import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApplicationTimeline } from "@/components/application/application-timeline";
import { getCandidateSessionId } from "@/lib/candidate-session";
import { getSubmission } from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";
import { buildApplicationTimelineSteps, getNextStepMessage } from "@/features/applications/utils/application-timeline.utils";
import { getCandidateApplicationStatus } from "@/features/applications/utils/tracking-mapping.utils";

export default async function ApplicationTrackingPage({ params }: PageProps<"/applications/[applicationId]/tracking">) {
  await connection();
  const { applicationId } = await params;

  const [candidateId, submission] = await Promise.all([getCandidateSessionId(), getSubmission(applicationId)]);
  if (!submission) redirect(`/applications/${applicationId}/review`);
  if (submission.ownerId !== candidateId) redirect("/dashboard");

  const tracking = await getApplicationTracking(applicationId);
  if (!tracking) redirect(`/applications/${applicationId}/review`);

  const steps = buildApplicationTimelineSteps(tracking);
  const nextStepMessage = getNextStepMessage(tracking.currentStage);
  const status = getCandidateApplicationStatus(tracking.currentStage);

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/applications">Your Applications</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/applications/${applicationId}/review`}>{tracking.jobTitle}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tracking</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Application Tracking</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {tracking.jobTitle} · {tracking.reference}
        </p>
      </div>

      <Card>
        <CardHeader>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current status</p>
          <CardTitle className="font-serif text-2xl">{status.label}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Application reference</p>
            <p className="mt-1 font-mono font-medium text-foreground">{tracking.reference}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Job title</p>
            <p className="mt-1 font-medium text-foreground">{tracking.jobTitle}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Application timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationTimeline currentStage={tracking.currentStage} steps={steps} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-border bg-muted">
              <Info />
              <AlertTitle>You do not need to submit another application</AlertTitle>
              <AlertDescription>{nextStepMessage}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
