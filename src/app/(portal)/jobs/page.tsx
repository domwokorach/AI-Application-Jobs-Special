import { listJobs } from "@/features/jobs/services/jobs.service";
import { JobList } from "@/features/jobs/components/job-list";

export default async function JobsPage() {
  const jobs = await listJobs();
  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <h1 className="font-serif text-4xl">Find a role</h1>
      <JobList jobs={jobs} />
    </main>
  );
}
