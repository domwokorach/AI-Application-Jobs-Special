import type { Job } from "@/types";

const jobs: Job[] = [{
  id: "customer-experience-associate",
  title: "Customer Experience Associate",
  location: "London · Hybrid",
  employmentType: "full-time",
  description: "Help people get the most from Northstar through thoughtful customer support.",
}];

export async function listJobs(): Promise<Job[]> {
  return jobs;
}

export async function getJob(jobId: string): Promise<Job | undefined> {
  return jobs.find((job) => job.id === jobId);
}
