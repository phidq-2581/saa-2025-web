"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { computeRemaining, type RemainingTime } from "./compute-remaining";

// Minute-granularity display only needs ~30s tick resolution.
const TICK_MS = 30_000;

const SERVER_SNAPSHOT: RemainingTime = {
  days: "00",
  hours: "00",
  minutes: "00",
  reached: false,
};

// BR-004: a null target (missing/malformed env value) is the safe fallback
// -- render as already-reached rather than throwing or showing a bogus
// countdown.
const REACHED_FALLBACK: RemainingTime = {
  days: "00",
  hours: "00",
  minutes: "00",
  reached: true,
};

function subscribe(callback: () => void): () => void {
  const id = setInterval(callback, TICK_MS);
  return () => clearInterval(id);
}

/**
 * BR-005_CountdownClientOnlyHydration: `getServerSnapshot` always returns
 * the `00/00/00` placeholder so first paint and hydration never disagree;
 * the client swaps in the real value after mount via `useSyncExternalStore`.
 */
export function useCountdown(targetMs: number | null): RemainingTime {
  const cacheRef = useRef<{ minuteBucket: number; value: RemainingTime } | null>(null);

  const getSnapshot = useCallback((): RemainingTime => {
    if (targetMs === null) {
      return REACHED_FALLBACK;
    }

    const now = Date.now();
    const minuteBucket = Math.floor(now / 60_000);
    if (!cacheRef.current || cacheRef.current.minuteBucket !== minuteBucket) {
      cacheRef.current = { minuteBucket, value: computeRemaining(now, targetMs) };
    }
    return cacheRef.current.value;
  }, [targetMs]);

  const getServerSnapshot = useCallback(() => SERVER_SNAPSHOT, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
