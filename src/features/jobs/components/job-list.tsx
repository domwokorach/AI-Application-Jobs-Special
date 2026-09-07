import { Briefcase } from "lucide-react";
import { JobCard } from "@/features/jobs/components/job-card";
import { EmptyState } from "@/components/application/empty-state";
import type { Job } from "@/types";

export function JobList({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="mt-7">
        <EmptyState description="There are no open roles right now. Check back soon." icon={Briefcase} title="No roles available" />
      </div>
    );
  }
  return (
    <div className="mt-7 grid gap-4">
      {jobs.map((job) => (
        <JobCard job={job} key={job.id} />
      ))}
    </div>
  );
}
