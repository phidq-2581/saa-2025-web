"use client";

import { KudosCard } from "@/components/kudos/card/kudos-card";
import type { KudosCardSample } from "./kudos-board-types";

/**
 * B.2.3_content Highlight KUDO (2940:13463) -- the 5-card slide track.
 * Cards are a fixed 528px (spec `KUDO - Highlight` instance width,
 * 2940:13464/65/66, re-verified against 2940:13462's 3-instance layout:
 * card1 0-528, gap 24, active card2 552-1080, gap 24, card3 1104-1440
 * clipped by the frame). Dimming comes ENTIRELY from the two 400px edge
 * fade overlays below (2940:13469/13467, `linear-gradient(canvas ->
 * transparent)`, verified 400px wide) -- neighbor cards keep their full
 * 528px size and are NOT scaled or separately opacity-reduced (an earlier
 * revision stacked `scale-[0.92] opacity-40` on top of the gradient,
 * compounding into near-invisible neighbors; removed). `px-[calc(50%-504px)]`
 * reveals ~240px of each neighbor at rest -- centered active card, readable
 * peeking neighbors, matching spec "Inactive: Mờ/che về 2 bên" (dimmed via
 * the covering gradient, not hidden). `scrollRef` is exposed so the parent
 * can drive prev/next via `scrollTo`.
 */
const CARD_WIDTH = 528;
const CARD_GAP = 24;
export const SLIDE_STEP = CARD_WIDTH + CARD_GAP;

export type HighlightCarouselTrackProps = {
  items: KudosCardSample[];
  activeIndex: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  /** Optional signed-in viewer id (mirrors `kudos-feed.tsx`'s
   * `currentViewerId`) -- disables the heart button on the viewer's own
   * kudos (spec B.3.2/C.4.1). Omit and every heart stays enabled. */
  currentViewerId?: string;
  /** Phase 07: real action wiring, mirrors `kudos-feed.tsx`'s own props. */
  onToggleHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  likedIds?: ReadonlySet<string>;
};

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
    <div className="relative w-full">
      {/* mm:2940:13469 -- left edge fade (decorative, matches the B.2.1/B.2.2
          overlay gradients; see highlight-carousel-nav.tsx for why the
          duplicate nav icons inside those gradients aren't re-rendered) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-100 bg-linear-to-r from-canvas to-transparent"
      />
      {/* mm:2940:13467 -- right edge fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-100 bg-linear-to-l from-canvas to-transparent"
      />
      {/* mm:2940:13463 */}
      <div
        ref={scrollRef}
        data-testid="kudos-board-highlight-carousel"
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-[calc(50%-504px)] scrollbar-none"
      >
        {items.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            // mm:2940:13464 -- dimming is the edge-fade gradients below
            // (verified 400px, matches 2940:13469/13467); no scale/opacity
            // on the card itself, matching the real design.
            <div
              key={slide.id}
              data-testid="kudos-board-carousel-slide"
              className={`shrink-0 snap-center transition-opacity duration-300 ${
                isActive ? "opacity-100" : "opacity-90"
              }`}
              style={{ width: CARD_WIDTH }}
            >
              <KudosCard
                view={slide}
                variant="highlight"
                canHeart={currentViewerId ? slide.sender.id !== currentViewerId : true}
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
