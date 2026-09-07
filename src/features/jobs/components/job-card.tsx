import Link from "next/link";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Job } from "@/types";

export function JobCard({ job }: { job: Job }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="size-4" />
          {job.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild variant="outline">
          <Link href={`/jobs/${job.id}`}>View role</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
