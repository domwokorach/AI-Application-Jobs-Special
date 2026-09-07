"use client";

import { FileText, LockKeyhole, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PrivacyWatermark } from "@/components/privacy/privacy-watermark";
import type { SubmissionRecord } from "@/features/applications/services/applications.service";
import type { SensitiveDocumentType } from "@/lib/auth";

const documentTitles: Record<SensitiveDocumentType, string> = {
  APPLICATION: "Candidate application",
  CV: "Candidate CV / Resume",
  COVER_LETTER: "Candidate cover letter",
};

export function SensitiveDocumentViewer({
  documentType,
  actorId,
  submission,
  watermarkTimestamp,
}: {
  documentType: SensitiveDocumentType;
  actorId: string;
  submission: SubmissionRecord;
  watermarkTimestamp: string;
}) {
  const [printWarning, setPrintWarning] = useState(false);
  const { summary } = submission;

  return (
    <main className="mx-auto w-full max-w-6xl space-y-5 px-4 py-6 sm:px-6 sm:py-10">
      <header className="space-y-2">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-destructive uppercase">
          <LockKeyhole className="size-4" />
          Confidential
        </p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{documentTitles[documentType]}</h1>
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{summary.personalDetails.fullName}</p>
          <p>{submission.jobTitle}</p>
          <p className="font-mono">{submission.reference}</p>
        </div>
      </header>

      <Card className="relative min-h-[34rem] overflow-hidden">
        <PrivacyWatermark actorId={actorId} timestamp={watermarkTimestamp} />
        <CardHeader className="relative z-20 border-b bg-card/90 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>{documentTitles[documentType]}</CardTitle>
            <Button onClick={() => setPrintWarning(true)} size="sm" variant="outline">
              <Printer />
              Print
            </Button>
          </div>
          {printWarning && (
            <p className="text-sm text-muted-foreground" role="status">
              Printing is restricted by organisational policy. This web application cannot prevent all browser or operating-system print methods.
            </p>
          )}
        </CardHeader>
        <CardContent className="relative z-20 space-y-6 py-6">
          {documentType === "APPLICATION" ? (
            <>
              <section aria-labelledby="candidate-contact">
                <h2 className="text-base font-semibold" id="candidate-contact">Candidate contact details</h2>
                <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
                  <Detail label="Email" value={summary.personalDetails.email} />
                  <Detail label="Mobile" value={summary.personalDetails.mobile} />
                  <Detail label="Address" value={summary.personalDetails.address} />
                  <Detail label="Postcode" value={summary.personalDetails.postcode} />
                </dl>
              </section>
              <section aria-labelledby="application-history">
                <h2 className="text-base font-semibold" id="application-history">Employment history</h2>
                <div className="mt-3 grid gap-3">
                  {summary.workExperience.map((entry, index) => (
                    <Card className="bg-card/90" key={`${entry.title}-${index}`} size="sm">
                      <CardContent className="py-4">
                        <p className="font-medium">{entry.title}</p>
                        <p className="text-sm text-muted-foreground">{entry.employer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <div className="grid min-h-80 place-items-center rounded-lg border border-dashed bg-card/75 p-6 text-center">
              <div className="max-w-sm space-y-2">
                <FileText className="mx-auto size-8 text-muted-foreground" />
                <h2 className="font-medium">Document unavailable</h2>
                <p className="text-sm text-muted-foreground">
                  No {documentType === "CV" ? "CV / resume" : "cover letter"} has been attached to this application.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  );
}
