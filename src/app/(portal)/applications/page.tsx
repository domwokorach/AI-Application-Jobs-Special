import Link from "next/link";
import { Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/application/page-header";
import { ApplicationCard } from "@/components/application/application-card";
import { getCandidateSessionId } from "@/lib/candidate-session";
import {
  ensureIllustrativeApplicationsSeeded,
  getDraftSummariesForOwner,
  getSubmissionsForOwner,
} from "@/features/applications/services/applications.service";
import { getApplicationTracking } from "@/features/applications/services/tracking.service";
import { sortApplicationListItems, type ApplicationListItem } from "@/features/applications/types/application-list.types";

export default async function ApplicationsPage() {
  const candidateId = await getCandidateSessionId();

  let items: ApplicationListItem[] = [];
  if (candidateId) {
    await ensureIllustrativeApplicationsSeeded(candidateId);

    const [drafts, submissions] = await Promise.all([
      getDraftSummariesForOwner(candidateId),
      getSubmissionsForOwner(candidateId),
    ]);

    const submitted = await Promise.all(
      submissions.map(async (submission): Promise<ApplicationListItem | undefined> => {
        const tracking = await getApplicationTracking(submission.id);
        if (!tracking) return undefined;
        return {
          kind: "submitted",
          id: submission.id,
          jobTitle: submission.jobTitle,
          location: submission.location,
          reference: submission.reference,
          submittedAt: submission.submittedAt,
          stage: tracking.currentStage,
        };
      }),
    );

    items = sortApplicationListItems([
      ...drafts.map((draft): ApplicationListItem => ({
        kind: "draft",
        id: draft.id,
        jobTitle: draft.jobTitle,
        location: draft.location,
        lastSavedAt: draft.lastSavedAt,
        percentComplete: draft.percentComplete,
      })),
      ...submitted.filter((entry): entry is ApplicationListItem => entry !== undefined),
    ]);
  }

  return (
    <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
      <PageHeader
        description="View your applications and track their progress through the recruitment process."
        title="Your Applications"
      />

      {items.length === 0 ? (
        <div className="grid place-items-center rounded-lg border border-dashed py-16 text-center">
          <Briefcase className="size-8 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">You haven&apos;t started any applications yet.</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Explore current vacancies and start an application when you find a role that&apos;s right for you.
          </p>
          <Button asChild className="mt-5">
            <Link href="/jobs">View Jobs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <ApplicationCard item={item} key={item.id} />
          ))}
        </div>
      )}
    </main>
  );
}
