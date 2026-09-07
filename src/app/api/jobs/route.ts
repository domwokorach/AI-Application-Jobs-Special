import { NextResponse } from "next/server";
import { listJobs } from "@/features/jobs/services/jobs.service";

export async function GET() {
  return NextResponse.json(await listJobs());
}
