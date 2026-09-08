"use client";

import { useEffect, useId, useState } from "react";
import { ShieldAlert, TriangleAlert } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { recordConfidentialityWarningShownAction } from "@/features/privacy/actions/privacy-audit.actions";
import type { ConfidentialResourceType, ConfidentialitySensitivity } from "@/features/privacy/types/confidentiality.types";

export type ConfidentialityWarningDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  resourceType: ConfidentialResourceType;
  sensitivity: ConfidentialitySensitivity;

  onCancel: () => void;
  onContinue: () => void;

  requireAcknowledgement?: boolean;

  /** Included in the CONFIDENTIALITY_WARNING_SHOWN / CONFIDENTIALITY_ACKNOWLEDGED audit metadata. */
  applicationId?: string;
};

const RESOURCE_CONTEXT: Record<ConfidentialResourceType, string> = {
  CV: "This document contains a candidate's CV or resume, including personal information.",
  COVER_LETTER: "This document contains a candidate's cover letter, including personal information.",
  APPLICATION: "This application contains personal and confidential candidate information.",
  RECRUITMENT_REVIEW: "This page contains personal candidate information for recruitment review.",
  HIRING_MANAGER_REVIEW: "This candidate application has been shared with you for an authorised recruitment review.",
  HR_REVIEW: "This page contains highly confidential candidate and recruitment information.",
  DOCUMENT: "This document contains personal and confidential candidate information.",
};

const SENSITIVITY_COPY: Record<ConfidentialitySensitivity, { title: string; instruction: string }> = {
  CONFIDENTIAL: {
    title: "Confidential candidate information",
    instruction: "Do not take screenshots, photographs, copy, download or share this information outside authorised recruitment processes.",
  },
  HIGHLY_CONFIDENTIAL: {
    title: "Highly confidential candidate information",
    instruction:
      "Do not take screenshots, photographs, copy, download or share this information outside authorised recruitment processes. This information is classified as highly confidential and access is audited.",
  },
};

/**
 * Confidentiality warning shown before a user enters particularly sensitive candidate material.
 * This — along with the persistent Alert, watermark and privacy shield it precedes — is a
 * defence-in-depth UX/privacy control. It never replaces server-side authorization, and it never
 * claims the website can prevent an OS-level screenshot.
 */
export function ConfidentialityWarningDialog({
  open,
  onOpenChange,
  resourceType,
  sensitivity,
  onCancel,
  onContinue,
  requireAcknowledgement = false,
  applicationId,
}: ConfidentialityWarningDialogProps) {
  const checkboxId = useId();
  const [acknowledgedCheckbox, setAcknowledgedCheckbox] = useState(false);
  const { title, instruction } = SENSITIVITY_COPY[sensitivity];
  const Icon = sensitivity === "HIGHLY_CONFIDENTIAL" ? ShieldAlert : TriangleAlert;

  // Reset the checkbox whenever the dialog transitions to open, following React's pattern for
  // adjusting state during render on a prop change (not an effect, so it can't cascade renders).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setAcknowledgedCheckbox(false);
  }

  useEffect(() => {
    if (!open) return;
    void recordConfidentialityWarningShownAction(resourceType, sensitivity, applicationId);
    // Only re-fire when the dialog transitions to open for this resource/sensitivity — not on
    // every render, and not when applicationId is a fresh literal on each parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, resourceType, sensitivity]);

  const continueDisabled = requireAcknowledgement && !acknowledgedCheckbox;

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia aria-hidden>
            <Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              <p>{RESOURCE_CONTEXT[resourceType]}</p>
              <p>{instruction}</p>
              <p className="font-medium text-foreground">
                Screen capture may not be preventable by this website on your device.
              </p>
              {requireAcknowledgement ? (
                <div className="flex items-start gap-2.5 pt-1">
                  <Checkbox
                    checked={acknowledgedCheckbox}
                    className="mt-0.5"
                    id={checkboxId}
                    onCheckedChange={(checked) => setAcknowledgedCheckbox(checked === true)}
                  />
                  <Label className="text-sm leading-5 font-normal text-foreground" htmlFor={checkboxId}>
                    I confirm that I am accessing this information for an authorised recruitment purpose.
                  </Label>
                </div>
              ) : (
                <p>By continuing, you confirm that you are accessing this information for an authorised recruitment purpose.</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Go Back</AlertDialogCancel>
          <AlertDialogAction disabled={continueDisabled} onClick={onContinue}>
            Continue Securely
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
