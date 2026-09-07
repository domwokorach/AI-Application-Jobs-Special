"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const PRIVACY_ACKNOWLEDGEMENT_CHANGED = "privacy-acknowledgement-changed";

export function SensitiveDocumentGate({
  applicationId,
  actorId,
  children,
}: {
  applicationId: string;
  actorId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const storageKey = `privacy-acknowledged:${actorId}:${applicationId}`;
  const acknowledged = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(PRIVACY_ACKNOWLEDGEMENT_CHANGED, onStoreChange);
      return () => window.removeEventListener(PRIVACY_ACKNOWLEDGEMENT_CHANGED, onStoreChange);
    },
    () => window.sessionStorage.getItem(storageKey) === "true",
    () => false,
  );

  return (
    <>
      {acknowledged && children}
      <AlertDialog open={!acknowledged}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Candidate information</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>This page contains confidential candidate information.</p>
                <p>Please handle this information securely and in accordance with your organisation&apos;s privacy and data-protection policies.</p>
                <p>Do not share screenshots, photographs or copies with unauthorised people.</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => router.back()}>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              window.sessionStorage.setItem(storageKey, "true");
              window.dispatchEvent(new Event(PRIVACY_ACKNOWLEDGEMENT_CHANGED));
            }}>
              Continue Securely
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
