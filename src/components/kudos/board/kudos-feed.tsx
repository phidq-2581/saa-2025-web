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
   * disable nút tim"). Omit it and every card's heart stays enabled.
   */
  currentViewerId?: string;
  /** Phase 07: real action wiring, threaded straight through to every
   * `KudosCard` -- omit any of these and that card's affordance is a
   * visual no-op, same as Track A shipped it. */
  onToggleHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  onHashtagClick?: (hashtagId: string) => void;
  /** Ids the current viewer has an active (session-local) heart on --
   * see `heart-button.tsx`'s own doc for why this isn't a persisted read. */
  likedIds?: ReadonlySet<string>;
}

/**
 * C.1/C.2 "ALL KUDOS" section (2940:14221 header pattern -- caption/divider
 * /heading identical to the Highlight/Spotlight headers -- + 2940:13482
 * card list). Renders the empty state (spec C.2 "Hiện tại chưa có Kudos
 * nào.") when every page is empty.
 */
export function KudosFeed({
  pages,
  hasMore,
  onLoadMore,
  loading,
  currentViewerId,
  onToggleHeart,
  onCopyLink,
  onHashtagClick,
  likedIds,
}: KudosFeedProps) {
  const t = useTranslations("kudos");
  const items = pages.flatMap((page) => page.items) as KudosCardSample[];

  return (
    // mm:2940:13482 -- C.2 list column only; the C.1 header (caption / rule /
    // "ALL KUDOS") spans the full 1152 column above both this list and the
    // sidebar, so the feed container renders it (kudos-feed-container.tsx).
    <section className="flex w-full flex-col items-start gap-6">

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
              liked={likedIds?.has(item.id)}
              onToggleHeart={onToggleHeart}
              onCopyLink={onCopyLink}
              onHashtagClick={onHashtagClick}
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
