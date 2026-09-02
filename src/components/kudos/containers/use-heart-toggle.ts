"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleHeart } from "@/lib/kudos/write/toggle-heart-action";

interface HeartOverride {
  count: number;
  liked: boolean;
}

/**
 * Phase 07 (reviewer REWORK, in-flight guard): heart-toggle state and the
 * click handler, shared by the board (`kudos-feed-container.tsx`, one
 * instance covers every feed/highlight card) and `/kudos/[id]`
 * (`kudos-detail-view.tsx`, a single card) -- one source of truth for the
 * optimistic-count + in-flight-guard behavior instead of two copies
 * drifting apart.
 *
 * `pendingRef` (not state) ignores a second click on the SAME kudos while
 * its round trip is still in flight -- a `Set`, not a single boolean, since
 * the board can have many cards toggling independently at once. `liked`/
 * `heartCount` still come from `toggleHeart`'s own response (never assumed
 * client-side), so the optimistic-UI semantics the board already had are
 * unchanged; this only blocks a double-click from firing two overlapping
 * requests for the same kudos.
 */
export function useHeartToggle() {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Map<string, HeartOverride>>(new Map());
  const pendingRef = useRef<Set<string>>(new Set());

  async function handleToggleHeart(kudosId: string) {
    if (pendingRef.current.has(kudosId)) return;
    pendingRef.current.add(kudosId);
    try {
      const result = await toggleHeart(kudosId);
      if (!result.ok) {
        console.error("useHeartToggle: toggleHeart failed", result.code);
        return;
      }
      setOverrides((current) => {
        const next = new Map(current);
        next.set(kudosId, { count: result.heartCount, liked: result.liked });
        return next;
      });
      router.refresh();
    } finally {
      pendingRef.current.delete(kudosId);
    }
  }

  function heartCountOf(kudosId: string, fallbackCount: number): number {
    return overrides.get(kudosId)?.count ?? fallbackCount;
  }

  function isLiked(kudosId: string): boolean {
    return overrides.get(kudosId)?.liked ?? false;
  }

  const likedIds = new Set(
    [...overrides.entries()].filter(([, value]) => value.liked).map(([id]) => id),
  );

  return { handleToggleHeart, heartCountOf, isLiked, likedIds };
}
