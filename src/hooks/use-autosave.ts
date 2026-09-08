"use client";

import { useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutosave<T>(
  value: T,
  onSave: (value: T) => Promise<void>,
  delayMs = 1000,
  enabled = true,
) {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initial = useRef(true);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timeout.current);
      return;
    }
    if (initial.current) {
      initial.current = false;
      return;
    }
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSave(value);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, delayMs);
    return () => clearTimeout(timeout.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs, enabled]);

  return status;
}
