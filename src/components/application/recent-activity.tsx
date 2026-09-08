"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationTimeline } from "@/components/application/application-timeline";
import { buildApplicationTimelineSteps } from "@/features/applications/utils/application-timeline.utils";
import { getApplicationTrackingAction } from "@/features/applications/actions/tracking.actions";
import type { CandidateTracking } from "@/features/applications/types/tracking.types";

function RecentActivitySkeleton() {
  return (
    <div aria-hidden className="space-y-5">
      {[1, 2, 3].map((row) => (
        <div className="flex items-start gap-4" key={row}>
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
        </div>
      ))}
    </div>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; tracking: CandidateTracking };

export function RecentActivity({ applicationId }: { applicationId: string }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    getApplicationTrackingAction(applicationId)
      .then((tracking) => {
        if (cancelled) return;
        if (!tracking) {
          setState({ status: "error" });
          return;
        }
        setState({ status: "ready", tracking });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  if (state.status === "error") return null;

  return (
    <section aria-live="polite" className="mt-10">
      <h2 className="font-serif text-2xl">Recent activity</h2>
      <Card className="mt-4">
        {state.status === "loading" ? (
          <CardContent className="p-6">
            <RecentActivitySkeleton />
          </CardContent>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-base">{state.tracking.jobTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Application reference: <span className="font-mono text-foreground">{state.tracking.reference}</span>
              </p>
            </CardHeader>
            <CardContent>
              <ApplicationTimeline currentStage={state.tracking.currentStage} steps={buildApplicationTimelineSteps(state.tracking)} />
              <Button asChild className="mt-2" variant="outline">
                <Link href={`/applications/${applicationId}/tracking`}>Track Application</Link>
              </Button>
            </CardContent>
          </>
        )}
      </Card>
    </section>
  );
}
