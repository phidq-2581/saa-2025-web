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
      className="mx-auto flex w-full max-w-[1152px] flex-col px-4 md:px-0"
    >
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

      {/* mm:2940:14174 */}
      <div
        data-testid="spotlight-root"
        className="relative mt-6 overflow-hidden rounded-[47px] border border-border-gold p-6 md:p-10"
      >
        {/* mm:2940:14173 -- dark overlay over the card's background art;
            "image 24"/"image 25"/"Root further mo rong 1" carry no mm_media_*
            name so no asset was fetchable per code-rules.md rule 2 (design
            gap: decorative background texture omitted, overlay kept). */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/70" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <SpotlightSearch />
          {/* mm:3007:17482 */}
          <p
            data-testid="spotlight-total-label"
            className="font-body text-4xl leading-[44px] font-bold text-white"
          >
            {totalKudos} {t("spotlight.totalSuffix")}
          </p>
        </div>

        <SpotlightCloudCanvas nodes={nodes} onNodeClick={onNodeClick} />

        {latestTicker ? (
          // mm:3004:15999
          <p className="mt-4 truncate font-body text-sm leading-5 font-bold tracking-[0.1px] text-white/70">
            {latestTicker.time} {latestTicker.recipientName} {t("spotlight.tickerSuffix")}
          </p>
        ) : null}
      </div>
    </section>
  );
}
