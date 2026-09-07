import { Skeleton } from "@/components/ui/skeleton";

export default function JobsLoading() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-6xl space-y-7 px-5 py-10">
        <Skeleton className="h-10 w-56" />
        <div className="grid gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      </div>
    </main>
  );
}
