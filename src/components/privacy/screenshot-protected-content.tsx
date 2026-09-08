"use client";

import { useRouter } from "next/navigation";
import { ConfidentialityNotice } from "@/components/privacy/confidentiality-notice";
import { ConfidentialityWarningDialog } from "@/components/privacy/confidentiality-warning-dialog";
import { ProtectedContent } from "@/components/privacy/protected-content";
import { ProtectedDocument } from "@/components/privacy/protected-document";
import { SensitiveScreenShield } from "@/components/privacy/sensitive-screen-shield";
import { useConfidentialityAcknowledgement } from "@/hooks/use-confidentiality-acknowledgement";
import { recordConfidentialityAcknowledgedAction } from "@/features/privacy/actions/privacy-audit.actions";
import type { ConfidentialResourceType, ConfidentialitySensitivity } from "@/features/privacy/types/confidentiality.types";
import type { SensitiveDocumentType } from "@/lib/auth";

const DOCUMENT_RESOURCE_TYPES: ReadonlySet<ConfidentialResourceType> = new Set(["CV", "COVER_LETTER", "APPLICATION"]);

function asDocumentType(resourceType: ConfidentialResourceType): SensitiveDocumentType | undefined {
  return DOCUMENT_RESOURCE_TYPES.has(resourceType) ? (resourceType as SensitiveDocumentType) : undefined;
}

export type ScreenshotProtectedContentProps = {
  children: React.ReactNode;

  enabled?: boolean;

  /** "STANDARD" content is not gated by the confidentiality warning — see section 1's scope note. */
  sensitivity?: "STANDARD" | ConfidentialitySensitivity;

  /**
   * Applies the ProtectedDocument/ProtectedContent watermark + copy-deterrence layer around the
   * children. Set to `false` when `children` already manages its own protection layer (e.g. a
   * viewer that already renders `<ProtectedDocument>` internally) to avoid stacking two
   * overlapping watermark implementations.
   */
  watermark?: boolean;
  warning?: boolean;
  persistentWarning?: boolean;
  privacyShield?: boolean;

  applicationId?: string;
  resourceType?: ConfidentialResourceType;

  className?: string;
};

/**
 * Top-level composer for a piece of protected candidate content. It wires together this app's
 * existing privacy primitives — the confidentiality warning, ProtectedDocument/ProtectedContent,
 * the persistent Alert, and the privacy shield — behind the single API described in the
 * cross-platform screenshot-deterrence spec. It intentionally composes those pieces rather than
 * reimplementing any of them, so there is exactly one warning gate and one watermark layer.
 *
 * This is a WEB_DETERRENCE-level control (see `@/lib/screenshot-protection`): it never detects or
 * blocks an OS-level screenshot on macOS, Windows, iOS, Android or a Pixel device. Server-side
 * authentication and authorization (already enforced before this component's children are ever
 * fetched) remain the actual security boundary.
 */
export function ScreenshotProtectedContent({
  children,
  enabled = true,
  sensitivity = "CONFIDENTIAL",
  watermark = true,
  warning = true,
  persistentWarning = true,
  privacyShield = false,
  applicationId,
  resourceType = "DOCUMENT",
  className,
}: ScreenshotProtectedContentProps) {
  const router = useRouter();
  const isGated = enabled && warning && sensitivity !== "STANDARD";
  const dialogSensitivity: ConfidentialitySensitivity = sensitivity === "STANDARD" ? "CONFIDENTIAL" : sensitivity;
  const requireAcknowledgement = sensitivity === "HIGHLY_CONFIDENTIAL";

  const storageKey = `confidentiality-acknowledged:${resourceType}:${applicationId ?? "global"}:${dialogSensitivity}`;
  const { acknowledged, acknowledge } = useConfidentialityAcknowledgement(storageKey);

  if (!enabled) return <div className={className}>{children}</div>;

  if (isGated && !acknowledged) {
    return (
      <ConfidentialityWarningDialog
        applicationId={applicationId}
        // Escape/outside-dismiss intentionally does nothing here: `open` is derived from whether
        // the user has acknowledged the warning, not from Radix's own close request, so the only
        // way past this gate is an explicit "Go Back" or "Continue Securely".
        onOpenChange={() => undefined}
        onCancel={() => router.back()}
        onContinue={() => {
          acknowledge();
          void recordConfidentialityAcknowledgedAction(resourceType, dialogSensitivity, applicationId);
        }}
        open
        requireAcknowledgement={requireAcknowledgement}
        resourceType={resourceType}
        sensitivity={dialogSensitivity}
      />
    );
  }

  const documentType = asDocumentType(resourceType);
  // HIGHLY_CONFIDENTIAL material gets denser watermark coverage — harder to crop a capture around.
  const watermarkDensity = sensitivity === "HIGHLY_CONFIDENTIAL" ? "high" : "medium";
  const protectedChildren = !watermark ? (
    children
  ) : documentType && applicationId ? (
    <ProtectedDocument applicationId={applicationId} documentType={documentType} watermarkDensity={watermarkDensity}>
      {children}
    </ProtectedDocument>
  ) : (
    <ProtectedContent watermarkDensity={watermarkDensity}>{children}</ProtectedContent>
  );

  return (
    <div className={className}>
      {persistentWarning && sensitivity !== "STANDARD" && <ConfidentialityNotice className="mt-4 mb-4 sm:mt-6" />}
      {privacyShield ? (
        <SensitiveScreenShield
          auditContext={documentType && applicationId ? { applicationId, documentType } : undefined}
          // HIGHLY_CONFIDENTIAL content also shields on window blur, not just tab-hide — a
          // stricter, more eager privacy courtesy for HR's shorter-inactivity policy. This still
          // isn't screenshot detection: blur has many benign causes (see useSensitiveScreen).
          shieldWhenWindowBlurred={sensitivity === "HIGHLY_CONFIDENTIAL"}
        >
          {protectedChildren}
        </SensitiveScreenShield>
      ) : (
        protectedChildren
      )}
    </div>
  );
}
