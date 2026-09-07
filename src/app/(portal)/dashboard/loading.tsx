import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-7xl space-y-9 px-5 py-10 sm:py-14">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    </main>
  );
}
