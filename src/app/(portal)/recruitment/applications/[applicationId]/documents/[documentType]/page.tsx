import { connection } from "next/server";
import { notFound } from "next/navigation";
import { AccessDenied, SecureSessionExpired } from "@/components/privacy/privacy-access-state";
import { ScreenshotProtectedContent } from "@/components/privacy/screenshot-protected-content";
import { SensitiveDocumentViewer } from "@/components/privacy/sensitive-document-viewer";
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

  // HR sees the strongest policy tier (mandatory acknowledgement, applied automatically by
  // ScreenshotProtectedContent for HIGHLY_CONFIDENTIAL); Recruitment and Hiring Manager get the
  // standard confidentiality tier.
  const sensitivity = access.actor.role === "hr" ? "HIGHLY_CONFIDENTIAL" : "CONFIDENTIAL";

  return (
    <div className="min-h-screen bg-muted/30">
      <ScreenshotProtectedContent
        applicationId={applicationId}
        className="mx-auto w-full max-w-6xl px-4 sm:px-6"
        // SensitiveDocumentViewer already wraps its content in <ProtectedDocument>, so the
        // watermark/copy-deterrence layer is applied there, not duplicated here.
        watermark={false}
        privacyShield
        resourceType={documentType as SensitiveDocumentType}
        sensitivity={sensitivity}
      >
        <SensitiveDocumentViewer
          applicationId={applicationId}
          documentType={documentType as SensitiveDocumentType}
          submission={access.submission}
          watermarkDensity={sensitivity === "HIGHLY_CONFIDENTIAL" ? "high" : "medium"}
          watermarkTimestamp={new Date().toISOString()}
        />
      </ScreenshotProtectedContent>
    </div>
  );
}
