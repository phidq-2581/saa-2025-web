"use client";

import { useTranslations } from "next-intl";
import type { FeedPage } from "@/lib/kudos/types";
import { KudosCard } from "@/components/kudos/card/kudos-card";
import type { KudosCardSample } from "./kudos-board-types";

export interface KudosFeedProps {
  pages: FeedPage[];
  hasMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
  /**
   * Optional signed-in viewer id, used only to disable the heart button on
   * the viewer's own kudos (spec B.3.2/C.4.1 "Người gửi kudos sẽ bị
   * disable nút tim"). `design-sample-data.ts` documents that only
   * `page.tsx` may import the sample/session id family, so this stays an
   * additive optional prop here rather than an internal import -- omit it
   * and every card's heart stays enabled (design-gap note in the delivery
   * report: `page.tsx` should pass `CURRENT_VIEWER_ID` to get the full
   * spec-compliant behavior).
   */
  currentViewerId?: string;
}

/**
 * C.1/C.2 "ALL KUDOS" section (2940:14221 header pattern -- caption/divider
 * /heading identical to the Highlight/Spotlight headers -- + 2940:13482
 * card list). Renders the empty state (spec C.2 "Hiện tại chưa có Kudos
 * nào.") when every page is empty.
 */
export function KudosFeed({ pages, hasMore, onLoadMore, loading, currentViewerId }: KudosFeedProps) {
  const t = useTranslations("kudos");
  const items = pages.flatMap((page) => page.items) as KudosCardSample[];

  return (
    <section className="flex w-full flex-col items-start gap-4">
      {/* mm:2940:14221 */}
      {/* mm:2940:14222 */}
      <span className="font-body text-2xl font-bold leading-8 text-white">{t("allKudos.caption")}</span>
      {/* mm:2940:14223 */}
      <span aria-hidden="true" className="h-px w-full bg-divider" />
      {/* mm:2940:14225 */}
      <h2 data-testid="kudos-board-all-header" className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
        {t("allKudos.heading")}
      </h2>

      {items.length === 0 ? (
        // mm:2940:13482 (C.2 empty state)
        <p data-testid="kudos-feed-empty" className="font-body text-base text-white">
          {t("allKudos.emptyFeed")}
        </p>
      ) : (
        // mm:2940:13482
        <div data-testid="kudos-feed" className="flex w-full flex-col items-center gap-6">
          {items.map((item) => (
            <KudosCard
              key={item.id}
              view={item}
              variant="feed"
              canHeart={currentViewerId ? item.sender.id !== currentViewerId : true}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <button
          type="button"
          onClick={() => onLoadMore?.()}
          disabled={loading}
          className="mx-auto rounded-chip border border-border-gold px-6 py-3 font-body text-base font-bold text-white disabled:opacity-60"
        >
          {loading ? t("allKudos.loading") : t("allKudos.loadMore")}
        </button>
      ) : null}
    </section>
  );
}
