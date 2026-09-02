/**
 * B.5_prev/next/pagination (2940:13471, raw MCP evidence supplied in the
 * phase brief) -- the carousel's functional nav bar: prev button, "n/5"
 * label, next button.
 *
 * DESIGN GAP: the Figma frame ALSO shows a second prev/next pair
 * overlaid on the carousel track's own edge-fade gradients (B.2.1_Button
 * lùi 2940:13470 / B.2.2_Button tiến 2940:13468, same component
 * 186:1425/186:1426, same MM_MEDIA_Left/Right icons). The RED contract
 * only defines one `kudos-board-carousel-prev`/`-next` pair, so this B.5
 * bar is wired as the single functional control; the B.2 overlay pair is
 * a duplicate mockup artifact of the same nav affordance and is not
 * re-rendered as a second interactive control.
 */
export type HighlightCarouselNavProps = {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

export function HighlightCarouselNav({ current, total, onPrev, onNext }: HighlightCarouselNavProps) {
  return (
    // mm:2940:13471
    <div className="flex w-full items-center justify-center gap-8 py-3">
      {/* mm:2940:13472 */}
      <button
        type="button"
        data-testid="kudos-board-carousel-prev"
        aria-label="Previous slide"
        onClick={onPrev}
        disabled={current <= 1}
        className="flex h-12 w-12 items-center justify-center gap-2 rounded-chip p-2.5 text-white disabled:opacity-40"
      >
        <ChevronIcon direction="left" aria-hidden="true" className="h-7 w-7" />
      </button>
      {/* mm:2940:13473 */}
      <span
        data-testid="kudos-board-carousel-pagination"
        className="font-body text-[28px] font-bold leading-9 text-[#999]"
      >
        {current}/{total}
      </span>
      {/* mm:2940:13474 */}
      <button
        type="button"
        data-testid="kudos-board-carousel-next"
        aria-label="Next slide"
        onClick={onNext}
        disabled={current >= total}
        className="flex h-12 w-12 items-center justify-center gap-2 rounded-chip p-2.5 text-white disabled:opacity-40"
      >
        <ChevronIcon direction="right" aria-hidden="true" className="h-7 w-7" />
      </button>
    </div>
  );
}

/** MM_MEDIA_Left / MM_MEDIA_Right (I2940:13472;186:1420 /
 * I2940:13474;186:1420) -- mono icons, `fill="white"` swapped for
 * `currentColor` per code-rules 2a. */
function ChevronIcon({
  direction,
  ...props
}: { direction: "left" | "right" } & React.SVGProps<SVGSVGElement>) {
  const path =
    direction === "left"
      ? "M15.41 16.58L10.83 12L15.41 7.41L14 6L8 12L14 18L15.41 16.58Z"
      : "M8.57959 16.4777L13.1596 11.8977L8.57959 7.3077L9.98959 5.89771L15.9896 11.8977L9.98959 17.8977L8.57959 16.4777Z";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path d={path} fill="currentColor" />
    </svg>
  );
}
