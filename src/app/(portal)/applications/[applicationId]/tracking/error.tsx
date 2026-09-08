"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApplicationTrackingError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10">
      <Card>
        <CardHeader className="items-center text-center">
          <span className="grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
            <AlertTriangle className="size-5" />
          </span>
          <CardTitle className="mt-3">We couldn&apos;t load your application progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-center">
          <p className="text-sm text-muted-foreground">Your application has not been changed.</p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button onClick={reset}>Try Again</Button>
            <Button asChild variant="outline">
              <Link href="/applications">Return to Your Applications</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
