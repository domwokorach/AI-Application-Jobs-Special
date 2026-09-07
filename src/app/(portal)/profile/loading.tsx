import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-5 py-10">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-28 w-full" />
    </main>
  );
}
