import { Skeleton } from "@/components/ui/skeleton";

export default function ApplicationStepLoading() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-10 sm:px-8 sm:py-16">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-72" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </main>
  );
}
