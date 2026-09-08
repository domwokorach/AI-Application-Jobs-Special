import Link from "next/link";
import { MapPin, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatApplicationActivityDate } from "@/lib/format-application-activity-date";
import { getCandidateApplicationStatus } from "@/features/applications/utils/tracking-mapping.utils";
import type { ApplicationListItem } from "@/features/applications/types/application-list.types";
import type { TrackingStage } from "@/features/applications/types/tracking.types";

export function ApplicationCard({ item }: { item: ApplicationListItem }) {
  return (
    <Card>
      <CardContent className="space-y-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-medium tracking-tight">{item.jobTitle}</h3>
            {item.location && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" />
                {item.location}
              </p>
            )}
          </div>
          {item.kind === "draft" ? (
            <Badge variant="secondary">Draft</Badge>
          ) : (
            <StageBadge stage={item.stage} />
          )}
        </div>

        {item.kind === "draft" ? <DraftDetails item={item} /> : <SubmittedDetails item={item} />}

        <div className="flex flex-col gap-3 sm:flex-row">
          {item.kind === "draft" ? (
            <Button asChild className="w-full sm:w-auto">
              <Link href={`/applications/${item.id}/personal-details`}>Continue Application</Link>
            </Button>
          ) : (
            <>
              <Button asChild className="w-full sm:w-auto">
                <Link href={`/applications/${item.id}/tracking`}>
                  <Route className="size-4 shrink-0" />
                  Track Application
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto" variant="outline">
                <Link href={`/applications/${item.id}/review`}>View Application</Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StageBadge({ stage }: { stage: TrackingStage }) {
  const { label, variant } = getCandidateApplicationStatus(stage);
  return <Badge variant={variant}>{label}</Badge>;
}

function DraftDetails({ item }: { item: Extract<ApplicationListItem, { kind: "draft" }> }) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-xs text-muted-foreground">Last saved</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{formatApplicationActivityDate(item.lastSavedAt)}</p>
      </div>
      <div className="flex items-center gap-3">
        <Progress className="h-1.5 w-32" value={item.percentComplete} />
        <span className="text-xs text-muted-foreground">{item.percentComplete}% complete</span>
      </div>
    </div>
  );
}

function SubmittedDetails({ item }: { item: Extract<ApplicationListItem, { kind: "submitted" }> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <p className="text-xs text-muted-foreground">Application reference</p>
        <p className="mt-0.5 font-mono text-sm font-medium text-foreground">{item.reference}</p>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Submitted</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">{formatApplicationActivityDate(item.submittedAt)}</p>
      </div>
    </div>
  );
}
