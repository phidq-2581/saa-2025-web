"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CardAuthorBlock } from "@/components/kudos/card/card-author-block";
import { CopyLinkButton } from "@/components/kudos/card/copy-link-button";
import { formatKudosTime } from "@/components/kudos/card/format-kudos-time";
import { HashtagChip } from "@/components/kudos/card/hashtag-chip";
import { HeartButton } from "@/components/kudos/card/heart-button";
import { IconSend } from "@/components/kudos/card/icon-send";
import type { KudosCardSample } from "@/components/kudos/board/kudos-board-types";
import { KudosContentRenderer } from "@/components/kudos/content/kudos-content-renderer";
import { useHeartToggle } from "@/components/kudos/containers/use-heart-toggle";
import { DetailGallery } from "./detail-gallery";

export interface KudosDetailViewProps {
  /** `KudosCardSample` (not the bare `KudosCardView` the integration
   * contract names) -- `CardAuthorBlock` needs the `senderMeta`/
   * `receiverMeta` presentation fields Phase 04 added on top of the shared
   * type, so the richer sample shape is what this phase actually has
   * available. Phase 07's real `getKudosById` result shape is that
   * phase's own decision. */
  view: KudosCardSample;
  /** Always `false` this phase (full, untruncated card is the whole point
   * of `/kudos/[id]`) -- kept as a real prop per the integration contract
   * so Phase 07 can reuse this component for a possible truncated variant
   * without a signature change. */
  truncate: boolean;
  /** Phase 07 (reviewer REWORK): the signed-in Sunner's own id, so the
   * heart button can disable itself on the viewer's own kudos (BR-005),
   * same `currentViewerId ? sender.id !== currentViewerId : true` pattern
   * `kudos-feed.tsx`/`highlight-carousel-track.tsx` already use. */
  currentViewerId?: string;
}

/**
 * `/kudos/[id]` full card (decision-sourced, clarifications.md 2026-08-31
 * "render 1 card đầy đủ (không truncate, full ảnh) tái dùng component
 * card"). Composed from Phase 04's own building blocks -- `CardAuthorBlock`,
 * `HashtagChip`, `HeartButton`, `CopyLinkButton`, `KudosContentRenderer`
 * -- rather than `KudosCard` itself, since that component always
 * line-clamps its content (B.3/C.3) and caps its image row at 88px
 * thumbnails; this view needs neither. Visual language (colors, radii,
 * spacing) mirrors `KudosCard`'s own `feed` variant 1:1, just laid out
 * without a clamp.
 *
 * Phase 07 (reviewer REWORK): heart toggle and copy-link were left
 * disabled/inert by Phase 06 ("heart/copy-link wiring lands in Phase 07").
 * Wired here using the same `useHeartToggle` hook (in-flight guard +
 * optimistic count) and the same verbatim toast copy the board uses.
 */
export function KudosDetailView({ view, truncate, currentViewerId }: KudosDetailViewProps) {
  const t = useTranslations("kudos");
  const { handleToggleHeart, heartCountOf, isLiked } = useHeartToggle();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const canHeart = currentViewerId ? view.sender.id !== currentViewerId : true;

  useEffect(() => {
    if (!toastMessage) return;
    const id = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(id);
  }, [toastMessage]);

  return (
    <article
      data-testid="kudos-detail-view"
      className="flex w-full max-w-[680px] flex-col items-start gap-4 rounded-[24px] bg-[#FFF8E1] px-10 pt-10 pb-6"
    >
      <div className="flex w-full items-start justify-between gap-6">
        <CardAuthorBlock author={view.sender} meta={view.senderMeta} nameTestId="kudos-card-sender-name" />
        <span className="flex h-8 w-8 shrink-0 self-center text-[#999999]">
          <IconSend className="h-8 w-8" />
        </span>
        <CardAuthorBlock author={view.receiver} meta={view.receiverMeta} nameTestId="kudos-card-receiver-name" />
      </div>

      <span aria-hidden="true" className="h-px w-full bg-gold" />

      <div className="flex w-full flex-col gap-4">
        <span
          data-testid="kudos-card-time"
          className="w-full font-body text-base font-bold leading-6 tracking-[0.5px] text-[#999999]"
        >
          {formatKudosTime(view.createdAt)}
        </span>

        <div
          data-testid="kudos-detail-content"
          className={`w-full text-justify rounded-[12px] border border-gold bg-[rgba(255,234,158,0.40)] px-6 py-4 font-body text-xl font-bold leading-8 text-canvas ${truncate ? "line-clamp-5" : ""}`}
        >
          <KudosContentRenderer content={view.content} />
        </div>

        <DetailGallery imagePaths={view.imagePaths} />

        <div
          data-testid="kudos-card-hashtags"
          className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 font-body text-base font-bold leading-6 tracking-[0.5px] text-badge"
        >
          {view.hashtags.map((hashtag) => (
            <HashtagChip key={hashtag.id} hashtag={hashtag} />
          ))}
        </div>
      </div>

      <span aria-hidden="true" className="h-px w-full bg-gold" />

      <div className="flex w-full items-center justify-between gap-6">
        <HeartButton
          heartCount={heartCountOf(view.id, view.heartCount)}
          canHeart={canHeart}
          liked={isLiked(view.id)}
          onToggleHeart={() => handleToggleHeart(view.id)}
        />
        <CopyLinkButton kudosId={view.id} onCopyLink={() => setToastMessage(t("card.copyLinkToast"))} />
      </div>

      {toastMessage ? (
        <div
          data-testid="toast"
          role="status"
          className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-chip border border-border-gold bg-panel px-4 py-2 font-body text-sm font-bold text-white"
        >
          {toastMessage}
        </div>
      ) : null}
    </article>
  );
}
