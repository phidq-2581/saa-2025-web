"use client";

import { KudosCard } from "@/components/kudos/card/kudos-card";
import type { KudosCardSample } from "./kudos-board-types";

const CARD_WIDTH = 600;
const CARD_GAP = 24;
export const SLIDE_STEP = CARD_WIDTH + CARD_GAP;
// B.2.3 (2940:13463) is a 1440-wide strip; the active card sits at x552 with
// the previous one fully visible at x0 and the next cut at the strip's edge.
const STAGE_WIDTH = 1440;
const ACTIVE_SLOT_LEFT = 410;
const ACTIVE_SLOT_RIGHT = STAGE_WIDTH - ACTIVE_SLOT_LEFT - CARD_WIDTH;

export type HighlightCarouselTrackProps = {
  items: KudosCardSample[];
  activeIndex: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  currentViewerId?: string;
  onToggleHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  likedIds?: ReadonlySet<string>;
};

/**
 * The canvas row is exactly 1440 wide -- the frame width -- with cards at
 * x0 / 552 / 1104 (528 + 24 gap) and 400px edge fades (B.2.1/B.2.2). That
 * composition is kept as a 1440px stage centred on the page: identical to
 * the canvas at 1440, and on wider viewports the stage (fades included)
 * stays aligned with the centred content column instead of hugging the
 * viewport's left edge. Inside the stage the scroller pads the active slot
 * (552 left, 360 right) so `scrollTo(index * SLIDE_STEP)` lands card
 * `index` at x552 with its predecessor at x0 -- the "2/5" state the frame
 * captures.
 */
export function HighlightCarouselTrack({
  items,
  activeIndex,
  scrollRef,
  currentViewerId,
  onToggleHeart,
  onCopyLink,
  onHashtagClick,
  likedIds,
}: HighlightCarouselTrackProps) {
  return (
    // mm:2940:13461
    <div className="relative mx-auto w-full max-w-[1440px] overflow-hidden">
      {/* mm:2940:13469 -- left edge fade (decorative, matches the B.2.1/B.2.2
          overlay gradients; see highlight-carousel-nav.tsx for why the
          duplicate nav icons inside those gradients aren't re-rendered).
          `z-[1]` only: the slides are static so any positive z paints over
          them, while the header filter menus (z-10, earlier in the DOM) must
          stay above these fades instead of being dimmed by them. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-100 bg-linear-to-r from-canvas to-transparent"
      />
      {/* mm:2940:13467 -- right edge fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-100 bg-linear-to-l from-canvas to-transparent"
      />
      {/* mm:2940:13463 */}
      <div
        ref={scrollRef}
        data-testid="kudos-board-highlight-carousel"
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scrollbar-none"
        style={{
          paddingLeft: ACTIVE_SLOT_LEFT,
          paddingRight: ACTIVE_SLOT_RIGHT,
          scrollPaddingLeft: ACTIVE_SLOT_LEFT,
        }}
      >
        {items.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            // mm:2940:13464 -- dimming is the edge-fade gradients above
            // (verified 400px, matches 2940:13469/13467); no scale/opacity
            // on the card itself, matching the real design.
            <div
              key={slide.id}
              data-testid="kudos-board-carousel-slide"
              className={`shrink-0 snap-start transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-90"
              }`}
              style={{ width: CARD_WIDTH }}
            >
              <KudosCard
                view={slide}
                variant="highlight"
                canHeart={
                  currentViewerId ? slide.sender.id !== currentViewerId : true
                }
                liked={likedIds?.has(slide.id)}
                onToggleHeart={onToggleHeart}
                onCopyLink={onCopyLink}
                onHashtagClick={onHashtagClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
