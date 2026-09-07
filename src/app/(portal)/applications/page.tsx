import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/application/page-header";
import { StatusBadge } from "@/components/application/status-badge";

export default function ApplicationsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-10">
      <PageHeader title="Applications" />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Customer Experience Associate</CardTitle>
            <StatusBadge status="draft" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">London · Hybrid · Last updated today</p>
          <Button asChild>
            <Link href="/applications/demo-application/personal-details">Continue application</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
