"use client";

/**
 * A tiny client-side registry that autosaving forms (e.g. the application review step) can
 * register a "flush" function into on mount. Logout calls `flushPendingSaves()` before
 * invalidating the session, so an in-flight autosave gets a chance to complete first instead of
 * being silently lost. If a flush fails or times out, logout still proceeds (per spec: never
 * create an indefinite logout lock) — the caller is responsible for warning the candidate.
 */
type FlushFn = () => Promise<boolean>;

const flushers = new Set<FlushFn>();

export function registerPendingSaveFlush(flush: FlushFn): () => void {
  flushers.add(flush);
  return () => flushers.delete(flush);
}

const FLUSH_TIMEOUT_MS = 4000;

function withTimeout(promise: Promise<boolean>): Promise<boolean> {
  return Promise.race([
    promise,
    new Promise<boolean>((resolve) => setTimeout(() => resolve(false), FLUSH_TIMEOUT_MS)),
  ]);
}

/** Returns false if any registered flush failed or timed out — callers should warn the
 * candidate but still proceed with logout rather than blocking it indefinitely. */
export async function flushPendingSaves(): Promise<boolean> {
  if (flushers.size === 0) return true;
  const results = await Promise.all([...flushers].map((flush) => withTimeout(flush().catch(() => false))));
  return results.every(Boolean);
}
