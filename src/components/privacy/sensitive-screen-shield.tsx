"use client";

import { useCallback } from "react";
import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSensitiveScreen } from "@/hooks/use-sensitive-screen";
import { recordSensitiveScreenHiddenAction, recordSensitiveScreenReauthenticatedAction } from "@/features/privacy/actions/privacy-audit.actions";
import type { SensitiveDocumentType } from "@/lib/auth";

type SensitiveScreenShieldProps = {
  children: React.ReactNode;
  enabled?: boolean;
  shieldWhenHidden?: boolean;
  shieldWhenWindowBlurred?: boolean;
  /** When provided, hide/reveal transitions are recorded against this candidate document. */
  auditContext?: { applicationId: string; documentType: SensitiveDocumentType };
  onShielded?: () => void;
  onRevealed?: () => void;
};

/**
 * Covers sensitive internal content with an opaque privacy shield after the tab/window loses
 * visibility (or, optionally, focus), and requires an explicit "Continue" click to reveal it
 * again. This is a shoulder-surfing / shared-screen courtesy for internal staff screens — it does
 * not detect, and must never be described as preventing, an operating-system screenshot.
 */
export function SensitiveScreenShield({
  children,
  enabled = true,
  shieldWhenHidden = true,
  shieldWhenWindowBlurred = false,
  auditContext,
  onShielded,
  onRevealed,
}: SensitiveScreenShieldProps) {
  const handleShielded = useCallback(() => {
    if (auditContext) void recordSensitiveScreenHiddenAction(auditContext.applicationId, auditContext.documentType);
    onShielded?.();
  }, [auditContext, onShielded]);

  const handleRevealed = useCallback(() => {
    if (auditContext) void recordSensitiveScreenReauthenticatedAction(auditContext.applicationId, auditContext.documentType);
    onRevealed?.();
  }, [auditContext, onRevealed]);

  const { shielded, reveal } = useSensitiveScreen({
    enabled,
    onRevealed: handleRevealed,
    onShielded: handleShielded,
    shieldWhenHidden,
    shieldWhenWindowBlurred,
  });

  return (
    <div className="relative">
      {children}
      {shielded && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/98 p-5 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-labelledby="sensitive-screen-shield-title">
          <div className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 text-center shadow-lg">
            <span className="mx-auto grid size-11 place-items-center rounded-full bg-secondary text-secondary-foreground">
              <EyeOff className="size-5" />
            </span>
            <div className="space-y-1.5">
              <h2 className="font-heading text-base font-medium" id="sensitive-screen-shield-title">Privacy protected</h2>
              <p className="text-sm text-muted-foreground">
                Candidate information was hidden while this page was inactive.
              </p>
            </div>
            <Button autoFocus className="w-full" onClick={reveal}>
              Continue
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
