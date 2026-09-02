"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { HighlightCarouselNav } from "./highlight-carousel-nav";
import { HighlightCarouselTrack, SLIDE_STEP } from "./highlight-carousel-track";
import type { KudosCardSample } from "./kudos-board-types";

/**
 * B_Highlight (2940:13451) -- section header + 5-card carousel + nav.
 * `items` is a prop per the phase's integration contract (page.tsx passes
 * `HIGHLIGHT_SLIDES`; this component never imports the sample-data module
 * directly). `activeSlide`/`onSlideChange` are optional controlled props
 * with an internal-state fallback so this component also works
 * self-contained if the page doesn't manage carousel state itself.
 */
export type HighlightCarouselProps = {
  items: KudosCardSample[];
  activeSlide?: number;
  onSlideChange?: (index: number) => void;
  /** Optional signed-in viewer id, threaded straight through to
   * `HighlightCarouselTrack` (mirrors `kudos-feed.tsx`'s `currentViewerId`
   * -- disables the heart button on the viewer's own kudos, spec
   * B.3.2/C.4.1). Omit and every heart stays enabled. */
  currentViewerId?: string;
  /** Phase 07: real action wiring, threaded straight through to
   * `HighlightCarouselTrack` -- mirrors `kudos-feed.tsx`'s own props. */
  onToggleHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  likedIds?: ReadonlySet<string>;
};

export function HighlightCarousel({
  items,
  activeSlide,
  onSlideChange,
  currentViewerId,
  onToggleHeart,
  onCopyLink,
  onHashtagClick,
  likedIds,
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
    <section className="flex w-full flex-col gap-16">
      {/* mm:2940:13453 -- caption + heading only; the sibling FilterBar
          (Buttons frame 2940:13458) is composed by page.tsx, not here */}
      <div data-testid="kudos-board-highlight-header" className="mx-auto flex w-full max-w-[1152px] flex-col gap-4 px-4">
        {/* mm:2940:13454 */}
        <p className="font-body text-2xl font-bold leading-[32px] text-white">{t("highlight.caption")}</p>
        {/* mm:2940:13455 */}
        <div className="h-px w-full bg-divider" />
        {/* mm:2940:13457 */}
        <h2 className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
          {t("highlight.heading")}
        </h2>
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
