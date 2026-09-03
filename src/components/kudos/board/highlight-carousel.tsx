"use client";

import { useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { HighlightCarouselNav } from "./highlight-carousel-nav";
import { HighlightCarouselTrack, SLIDE_STEP } from "./highlight-carousel-track";
import type { KudosCardSample } from "./kudos-board-types";

export type HighlightCarouselProps = {
  items: KudosCardSample[];
  activeSlide?: number;
  onSlideChange?: (index: number) => void;
  currentViewerId?: string;
  onToggleHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  likedIds?: ReadonlySet<string>;
  /** Buttons frame (2940:13458) -- the hashtag/department filters the design
   *  places on the heading row, right-aligned. Owned by the feed container. */
  filters?: ReactNode;
};

/**
 * B_Highlight (2940:13451): a column with `gap: 40px` -- B.1 header
 * (2940:13453: 24px caption, 1px rule, then Frame 488 `justify-content:
 * space-between` with the 57px/700/64px heading on the left and the filter
 * buttons on the right), the card track, then the "n/total" nav.
 */
export function HighlightCarousel({
  items,
  activeSlide,
  onSlideChange,
  currentViewerId,
  onToggleHeart,
  onCopyLink,
  onHashtagClick,
  likedIds,
  filters,
}: HighlightCarouselProps) {
  const t = useTranslations("kudos");
  const [internalIndex, setInternalIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const index = activeSlide ?? internalIndex;
  const setIndex = onSlideChange ?? setInternalIndex;

  function goTo(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setIndex(nextIndex);
    scrollRef.current?.scrollTo({ left: nextIndex * SLIDE_STEP, behavior: "smooth" });
  }

  return (
    // mm:2940:13451
    <section className="flex w-full flex-col gap-10">
      {/* mm:2940:13453 */}
      <div
        data-testid="kudos-board-highlight-header"
        className="mx-auto flex w-full max-w-[1152px] flex-col gap-4 px-4 md:px-0"
      >
        {/* mm:2940:13454 */}
        <p className="font-body text-2xl font-bold leading-[32px] text-white">{t("highlight.caption")}</p>
        {/* mm:2940:13455 */}
        <div className="h-px w-full bg-divider" />
        {/* mm:2940:13456 */}
        <div className="flex flex-wrap items-center justify-between gap-8">
          {/* mm:2940:13457 */}
          <h2 className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
            {t("highlight.heading")}
          </h2>
          {/* mm:2940:13458 */}
          {filters}
        </div>
      </div>

      <HighlightCarouselTrack
        items={items}
        activeIndex={index}
        scrollRef={scrollRef}
        currentViewerId={currentViewerId}
        onToggleHeart={onToggleHeart}
        onCopyLink={onCopyLink}
        onHashtagClick={onHashtagClick}
        likedIds={likedIds}
      />

      {/* mm:2940:13473 */}
      <HighlightCarouselNav
        current={index + 1}
        total={items.length}
        onPrev={() => goTo(index - 1)}
        onNext={() => goTo(index + 1)}
      />
    </section>
  );
}
