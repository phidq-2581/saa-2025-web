import { CardAuthorBlock } from "@/components/kudos/card/card-author-block";
import { CopyLinkButton } from "@/components/kudos/card/copy-link-button";
import { formatKudosTime } from "@/components/kudos/card/format-kudos-time";
import { HashtagChip } from "@/components/kudos/card/hashtag-chip";
import { HeartButton } from "@/components/kudos/card/heart-button";
import { IconSend } from "@/components/kudos/card/icon-send";
import type { KudosCardSample } from "@/components/kudos/board/kudos-board-types";
import { KudosContentRenderer } from "@/components/kudos/content/kudos-content-renderer";
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
 */
export function KudosDetailView({ view, truncate }: KudosDetailViewProps) {
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
        {/* Behavior (toggle heart) is out of scope this phase -- BR-001
            heart/copy-link wiring lands in Phase 07. `canHeart={false}`
            renders the structural button the RED spec asserts on. */}
        <HeartButton heartCount={view.heartCount} canHeart={false} />
        <CopyLinkButton kudosId={view.id} />
      </div>
    </article>
  );
}
