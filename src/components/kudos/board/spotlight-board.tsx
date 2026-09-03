import { useTranslations } from "next-intl";
import { SpotlightSearch } from "./spotlight-search";
import { SpotlightCloudCanvas } from "./spotlight-cloud-canvas";
import type { SpotlightNode, SpotlightTickerItem } from "./kudos-board-types";

export interface SpotlightBoardProps {
  nodes: SpotlightNode[];
  totalKudos: number;
  onNodeClick: (kudosId: string) => void;
  ticker?: SpotlightTickerItem[];
}

/**
 * B.6_Header Giải thưởng (2940:13476) + B.7_Spotlight (2940:14174). B.6 is a
 * SIBLING of B.7 in the design (both children of Frame 552, 2940:14170), not
 * a parent/child pair -- rendered together here because both map to the
 * Spotlight section per the task's file ownership. Content column width
 * 1152px sourced from 2940:13477/2940:13479's own `width` styles (matches
 * B.7's 1157px card almost exactly); `px-4 md:px-0` is the established
 * "already-capped column, mobile-only gutter" pattern (docs/code-standards.md),
 * not a fresh choice.
 *
 * `nodes`/`totalKudos`/`onNodeClick` are Phase 04's integration contract,
 * sourced from Figma design content by page.tsx (SPOTLIGHT_NODES /
 * SPOTLIGHT_TOTAL_KUDOS) -- never invented here.
 *
 * `ticker` (3004:15999 character, frame discovery per clarifications.md
 * 2026-08-31 "Ticker trong Spotlight") -- shows only the most recent line
 * (decorative, restrained -- no rotation animation).
 */
export function SpotlightBoard({ nodes, totalKudos, onNodeClick, ticker }: SpotlightBoardProps) {
  const t = useTranslations("kudos");
  const latestTicker = ticker?.[0];

  return (
    <section
      aria-labelledby="spotlight-board-heading"
      className="mx-auto flex w-full max-w-[1152px] flex-col px-4 pt-4 pb-[35px] md:px-0"
    >
      {/* Frame 552 (2940:14170) insets its header 16px from the top and leaves 35px
          under the board before the next 120px Bìa gap -- hence pt-4 / pb-[35px]. */}
      {/* mm:2940:13476 */}
      <div data-testid="kudos-board-spotlight-header" className="flex flex-col gap-4">
        {/* mm:2940:13477 */}
        <p className="font-body text-2xl leading-8 font-bold text-white">{t("spotlight.caption")}</p>
        {/* mm:2940:13478 */}
        <div className="h-px w-full bg-divider" />
        {/* mm:2940:13479 */}
        <div className="flex items-center gap-8">
          {/* mm:2940:13480 */}
          <h2
            id="spotlight-board-heading"
            className="font-body text-[40px] leading-[48px] font-bold tracking-[-0.25px] text-gold md:text-[57px] md:leading-[64px]"
          >
            {t("spotlight.heading")}
          </h2>
        </div>
      </div>

      {/* mm:2940:14174 -- 1157x548 box 63px under the header, radius 47.14,
          1px #998C5F stroke; it overhangs the 1152 column by 2px left / 3px
          right (x142-1299). "388 KUDOS" (3007:17482) is centred 14px from
          the top, the search pill (2940:14833) sits at (25,26); the cloud
          fills the middle and the ticker hugs the bottom-left. The card's own
          background textures ("image 24"/"image 25"/"Root further mo rong 1")
          carry no mm_media_* name, so only their 70% black overlay is kept. */}
      <div
        data-testid="spotlight-root"
        className="relative mt-[63px] h-[548px] w-full overflow-hidden rounded-[47.14px] border border-border-gold md:-ml-[2px] md:w-[1157px]"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/70" />

        {/* mm:2940:14833 */}
        <div className="absolute top-[26px] left-[25px] z-[1]">
          <SpotlightSearch />
        </div>
        {/* mm:3007:17482 */}
        <p
          data-testid="spotlight-total-label"
          className="absolute top-[14px] left-1/2 z-[1] -translate-x-1/2 font-body text-4xl leading-[44px] font-bold text-white"
        >
          {totalKudos} {t("spotlight.totalSuffix")}
        </p>

        <SpotlightCloudCanvas nodes={nodes} onNodeClick={onNodeClick} />

        {latestTicker ? (
          // mm:3004:15999
          <p className="absolute bottom-4 left-10 z-[1] max-w-[60%] truncate font-body text-sm leading-5 font-bold tracking-[0.1px] text-white/70">
            {latestTicker.time} {latestTicker.recipientName} {t("spotlight.tickerSuffix")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
