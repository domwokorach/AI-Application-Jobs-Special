import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ConfidentialityNotice } from "@/components/privacy/confidentiality-notice";
import { AccessDenied, SecureSessionExpired } from "@/components/privacy/privacy-access-state";
import { SensitiveDocumentGate } from "@/components/privacy/sensitive-document-gate";
import { SensitiveDocumentViewer } from "@/components/privacy/sensitive-document-viewer";
import { SensitiveScreenShield } from "@/components/privacy/sensitive-screen-shield";
import { authorizeSensitiveDocumentAccess } from "@/features/privacy/services/privacy.service";
import type { SensitiveDocumentType } from "@/lib/auth";

const sensitiveDocumentTypes = new Set<SensitiveDocumentType>(["APPLICATION", "CV", "COVER_LETTER"]);

export default async function SensitiveDocumentPage({
  params,
}: PageProps<"/recruitment/applications/[applicationId]/documents/[documentType]">) {
  await connection();
  const { applicationId, documentType } = await params;
  if (!sensitiveDocumentTypes.has(documentType as SensitiveDocumentType)) notFound();

  const access = await authorizeSensitiveDocumentAccess(applicationId, documentType as SensitiveDocumentType);
  if (access.outcome === "session-expired") return <SecureSessionExpired />;
  if (access.outcome !== "authorized") return <AccessDenied />;

  return (
    <SensitiveDocumentGate actorId={access.actor.id} applicationId={applicationId}>
      <SensitiveScreenShield
        auditContext={{ applicationId, documentType: documentType as SensitiveDocumentType }}
        shieldWhenHidden
        shieldWhenWindowBlurred={false}
      >
        <div className="min-h-screen bg-muted/30">
          <div className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
            <ConfidentialityNotice />
          </div>
          <SensitiveDocumentViewer
            applicationId={applicationId}
            documentType={documentType as SensitiveDocumentType}
            submission={access.submission}
            watermarkTimestamp={new Date().toISOString()}
          />
        </div>
      </SensitiveScreenShield>
    </SensitiveDocumentGate>
  );
}
