"use client";

import { useCallback, useSyncExternalStore } from "react";

const ACKNOWLEDGEMENT_CHANGED_EVENT = "confidentiality-acknowledgement-changed";

/**
 * Tracks whether the user has already acknowledged a confidentiality warning for the given scope
 * (typically keyed by actor + application + resource + sensitivity) within this browser session.
 * This is what stops the warning from reappearing on every click, scroll, or tab switch — see
 * ConfidentialityWarningDialog — while still requiring a fresh acknowledgement in a new tab/session
 * (sessionStorage, not localStorage) or for a different, more sensitive resource (a different key).
 */
export function useConfidentialityAcknowledgement(storageKey: string) {
  const acknowledged = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener(ACKNOWLEDGEMENT_CHANGED_EVENT, onStoreChange);
      return () => window.removeEventListener(ACKNOWLEDGEMENT_CHANGED_EVENT, onStoreChange);
    },
    () => window.sessionStorage.getItem(storageKey) === "true",
    () => false,
  );

  const acknowledge = useCallback(() => {
    window.sessionStorage.setItem(storageKey, "true");
    window.dispatchEvent(new Event(ACKNOWLEDGEMENT_CHANGED_EVENT));
  }, [storageKey]);

  return { acknowledged, acknowledge };
}
