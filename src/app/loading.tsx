import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return <main className="mx-auto max-w-5xl space-y-6 p-8"><Skeleton className="h-10 w-64" /><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></main>;
}
