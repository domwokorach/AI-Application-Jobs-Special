"use client";

import { FileText, LockKeyhole, Printer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProtectedDocument } from "@/components/privacy/protected-document";
import type { SubmissionRecord } from "@/features/applications/services/applications.service";
import type { SensitiveDocumentType } from "@/lib/auth";

const documentTitles: Record<SensitiveDocumentType, string> = {
  APPLICATION: "Candidate application",
  CV: "Candidate CV / Resume",
  COVER_LETTER: "Candidate cover letter",
};

export function SensitiveDocumentViewer({
  applicationId,
  documentType,
  submission,
  watermarkTimestamp,
}: {
  applicationId: string;
  documentType: SensitiveDocumentType;
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

      <ProtectedDocument applicationId={applicationId} copyProtection documentType={documentType} watermarkTimestamp={watermarkTimestamp}>
        <Card className="min-h-136 overflow-hidden">
          <CardHeader className="border-b bg-card/90 backdrop-blur-sm">
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
          <CardContent className="space-y-6 py-6">
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
                <section aria-labelledby="about-you">
                  <h2 className="text-base font-semibold" id="about-you">About you</h2>
                  <dl className="mt-3 grid gap-4 text-sm">
                    <LongAnswer label="Personal Profile" value={summary.aboutYou.personalProfile} />
                    <LongAnswer label="Why are you interested in this role?" value={summary.aboutYou.roleInterest} />
                  </dl>
                </section>
                <section aria-labelledby="languages">
                  <h2 className="text-base font-semibold" id="languages">Languages</h2>
                  {summary.languages.length === 0 ? (
                    <p className="mt-3 text-sm text-muted-foreground">Not provided</p>
                  ) : (
                    <dl className="mt-3 grid gap-3 text-sm">
                      {summary.languages.map((language) => (
                        <div key={language.code}>
                          <dt className="font-medium">{language.name}</dt>
                          <dd className="text-muted-foreground">{formatLanguageProficiency(language.proficiency)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
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
      </ProtectedDocument>
    </main>
  );
}

function formatLanguageProficiency(proficiency?: string) {
  return proficiency
    ? proficiency.replace("PROFESSIONAL", "Professional working proficiency").replaceAll("_", " ")
    : "Proficiency not provided";
}

function LongAnswer({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap break-words font-medium">{value || "Not provided"}</dd>
    </div>
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
