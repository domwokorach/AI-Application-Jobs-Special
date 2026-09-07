"use client";

import { useCallback } from "react";
import { cn } from "cn";
import { PrivacyWatermark } from "@/components/privacy/privacy-watermark";

const COPY_PLACEHOLDER = "This content is confidential and cannot be copied outside authorised recruitment processes.";

type ProtectedContentProps = {
  children: React.ReactNode;
  className?: string;
  /** Renders a repeating CONFIDENTIAL watermark over the content. Purely visual — see PrivacyWatermark. */
  watermark?: boolean;
  watermarkLabel?: string;
  watermarkUserLabel?: string;
  watermarkTimestamp?: string;
  watermarkDensity?: "low" | "medium" | "high";
  /**
   * Intercepts the browser's `copy` event and replaces the clipboard payload with a warning
   * instead of the selected candidate text. This works because the Clipboard/`copy` event is a
   * real, script-observable browser API — unlike an OS-level screenshot, which this component
   * makes no attempt to detect or block.
   */
  copyProtection?: boolean;
  onCopyAttempt?: () => void;
};

export function ProtectedContent({
  children,
  className,
  watermark = true,
  watermarkLabel,
  watermarkUserLabel,
  watermarkTimestamp,
  watermarkDensity,
  copyProtection = false,
  onCopyAttempt,
}: ProtectedContentProps) {
  const handleCopy = useCallback(
    (event: React.ClipboardEvent<HTMLDivElement>) => {
      if (!copyProtection) return;
      event.preventDefault();
      event.clipboardData.setData("text/plain", COPY_PLACEHOLDER);
      onCopyAttempt?.();
    },
    [copyProtection, onCopyAttempt],
  );

  return (
    // The watermark is a *positioned* element (absolute + z-index), so per normal CSS stacking
    // rules it paints above these plain, unpositioned children regardless of DOM order or of
    // whether a child (e.g. a Card) has its own opaque background — no extra z-index wrapper
    // needed around children. `pointer-events-none` on the watermark is what keeps it from
    // blocking clicks, text selection, or keyboard interaction with the content underneath.
    <div className={cn("relative isolate", className)} onCopy={handleCopy}>
      {children}
      {watermark && (
        <PrivacyWatermark
          density={watermarkDensity}
          label={watermarkLabel}
          timestamp={watermarkTimestamp}
          userLabel={watermarkUserLabel}
        />
      )}
    </div>
  );
}
