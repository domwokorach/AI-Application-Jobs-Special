"use client";

import { useCallback } from "react";
import { ProtectedContent } from "@/components/privacy/protected-content";
import { recordProtectedCopyAttemptAction } from "@/features/privacy/actions/privacy-audit.actions";
import type { SensitiveDocumentType } from "@/lib/auth";

type ProtectedDocumentProps = {
  applicationId: string;
  documentType: SensitiveDocumentType;
  children: React.ReactNode;
  className?: string;
  /** Shows the repeating CONFIDENTIAL watermark over the document. Defaults to on. */
  watermark?: boolean;
  watermarkUserLabel?: string;
  watermarkTimestamp?: string;
  /** "high" for highly confidential material — more tiles per screen, harder to crop out of a capture. */
  watermarkDensity?: "low" | "medium" | "high";
  /** Intercepts the `copy` event so a copied selection carries a warning instead of candidate text. */
  copyProtection?: boolean;
};

/**
 * Feature-level wrapper for a single piece of sensitive recruitment content (a CV, cover letter,
 * submitted application, or a review screen). It composes the generic ProtectedContent primitive
 * with this app's audit trail. It intentionally does nothing to detect or block OS-level screen
 * capture (e.g. macOS Shift+Cmd+4) — see PrivacyWatermark for why that's the right model here.
 */
export function ProtectedDocument({
  applicationId,
  documentType,
  children,
  className,
  watermark = true,
  watermarkUserLabel = "Authorised Recruitment User",
  watermarkTimestamp,
  watermarkDensity,
  copyProtection = false,
}: ProtectedDocumentProps) {
  const handleCopyAttempt = useCallback(() => {
    void recordProtectedCopyAttemptAction(applicationId, documentType);
  }, [applicationId, documentType]);

  return (
    <ProtectedContent
      className={className}
      copyProtection={copyProtection}
      onCopyAttempt={handleCopyAttempt}
      watermark={watermark}
      watermarkDensity={watermarkDensity}
      watermarkLabel="CONFIDENTIAL"
      watermarkTimestamp={watermarkTimestamp}
      watermarkUserLabel={watermarkUserLabel}
    >
      {children}
    </ProtectedContent>
  );
}
