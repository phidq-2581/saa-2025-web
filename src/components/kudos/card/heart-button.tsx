"use client";

import { IconHeart } from "./icon-heart";

export interface HeartButtonProps {
  heartCount: number;
  canHeart: boolean;
  onToggleHeart?: () => void;
}

/**
 * B.4.4/C.4.1 "Hearts" -- count text (rgba(0,16,26,1) == --color-canvas)
 * plus the heart icon. Disabled when the viewer is the kudos's own sender
 * (spec B.3.2/C.4.1 "Người gửi kudos sẽ bị disable nút tim"; the sender/
 * viewer comparison itself is the caller's job -- `canHeart` prop). No
 * persisted "did I heart this" state exists yet, so this round always
 * renders the gray/inactive heart (design's red `#D4271D` fill is the
 * active state, out of scope this phase).
 */
export function HeartButton({ heartCount, canHeart, onToggleHeart }: HeartButtonProps) {
  return (
    // mm:I2940:13465;335:9462
    <button
      type="button"
      data-testid="kudos-card-heart-btn"
      disabled={!canHeart}
      onClick={() => onToggleHeart?.()}
      className="flex items-center gap-1 font-body text-2xl font-bold text-canvas disabled:cursor-not-allowed disabled:opacity-60"
    >
      {heartCount}
      <IconHeart className="h-8 w-8 text-[#999999]" />
    </button>
  );
}
