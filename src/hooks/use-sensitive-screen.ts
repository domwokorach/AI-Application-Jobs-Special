"use client";

import { useCallback, useEffect, useState } from "react";

export type UseSensitiveScreenOptions = {
  enabled?: boolean;
  /** Shield the content once the browser tab/window is hidden (Page Visibility API). */
  shieldWhenHidden?: boolean;
  /**
   * Also shield on `window.blur`. Off by default: blur fires for many benign reasons (switching
   * apps, opening dev tools, system UI, accessibility software, clicking browser chrome) and is
   * not a reliable signal of anything sensitive happening — see the module doc below.
   */
  shieldWhenWindowBlurred?: boolean;
  onShielded?: () => void;
  onRevealed?: () => void;
};

/**
 * Tracks whether a sensitive screen should be covered by a privacy shield because the tab/window
 * lost visibility or focus. This is a courtesy against shoulder-surfing and idle exposure on a
 * shared screen — it is NOT screenshot detection. Neither `visibilitychange` nor `blur` fire
 * because a screenshot was taken (macOS screen capture doesn't blur or hide the source window),
 * so this hook must never be used to infer or report a screenshot event.
 */
export function useSensitiveScreen({
  enabled = true,
  shieldWhenHidden = true,
  shieldWhenWindowBlurred = false,
  onShielded,
  onRevealed,
}: UseSensitiveScreenOptions = {}) {
  const [shielded, setShielded] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    function shield() {
      setShielded((current) => {
        if (!current) onShielded?.();
        return true;
      });
    }

    function handleVisibilityChange() {
      if (shieldWhenHidden && document.hidden) shield();
    }

    function handleBlur() {
      if (shieldWhenWindowBlurred) shield();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    if (shieldWhenWindowBlurred) window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (shieldWhenWindowBlurred) window.removeEventListener("blur", handleBlur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, shieldWhenHidden, shieldWhenWindowBlurred]);

  const reveal = useCallback(() => {
    setShielded(false);
    onRevealed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { shielded, reveal };
}
