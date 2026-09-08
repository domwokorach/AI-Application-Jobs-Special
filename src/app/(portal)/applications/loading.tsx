import { Skeleton } from "@/components/ui/skeleton";
import { ApplicationCardSkeleton } from "@/components/application/application-card-skeleton";

export default function ApplicationsLoading() {
  return (
    <main className="mx-auto max-w-4xl space-y-8 px-5 py-10">
      <div className="space-y-3">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="space-y-4">
        <ApplicationCardSkeleton />
        <ApplicationCardSkeleton />
      </div>
    </main>
  );
}
