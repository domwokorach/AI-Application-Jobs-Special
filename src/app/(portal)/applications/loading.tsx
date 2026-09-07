import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationsLoading() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    </main>
  );
}
