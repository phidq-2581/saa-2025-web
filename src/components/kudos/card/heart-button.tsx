"use client";

import { IconHeart } from "./icon-heart";

export interface HeartButtonProps {
  heartCount: number;
  canHeart: boolean;
  onToggleHeart?: () => void;
  /** Phase 07: whether the current viewer has an active heart on this
   * kudos, tracked client-side per session (no persisted per-viewer read
   * exists yet -- toggled optimistically, reconciled from the toggle
   * action's own returned `liked` flag). Exposed as `aria-pressed` +
   * `data-active` (both, for test-selector robustness) and the design's
   * red `#D4271D` fill so the active state is genuinely visible. */
  liked?: boolean;
}

/**
 * B.4.4/C.4.1 "Hearts" -- count text (rgba(0,16,26,1) == --color-canvas)
 * plus the heart icon. Disabled when the viewer is the kudos's own sender
 * (spec B.3.2/C.4.1 "Người gửi kudos sẽ bị disable nút tim"; the sender/
 * viewer comparison itself is the caller's job -- `canHeart` prop).
 */
export function HeartButton({ heartCount, canHeart, onToggleHeart, liked = false }: HeartButtonProps) {
  return (
    // mm:I2940:13465;335:9462
    <button
      type="button"
      data-testid="kudos-card-heart-btn"
      disabled={!canHeart}
      aria-pressed={liked}
      data-active={liked}
      onClick={() => onToggleHeart?.()}
      className="flex items-center gap-1 font-body text-2xl font-bold text-canvas disabled:cursor-not-allowed disabled:opacity-60"
    >
      {heartCount}
      <IconHeart className={`h-8 w-8 ${liked ? "text-badge" : "text-[#999999]"}`} />
    </button>
  );
}
