"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconLinkArrow } from "@/components/homepage/icon-link-arrow";
import type { KudosCardSample } from "@/components/kudos/board/kudos-board-types";
import { KudosContentRenderer } from "@/components/kudos/content/kudos-content-renderer";
import { CardAttachedImages } from "./card-attached-images";
import { CardAuthorBlock } from "./card-author-block";
import { CopyLinkButton } from "./copy-link-button";
import { formatKudosTime } from "./format-kudos-time";
import { HashtagChip } from "./hashtag-chip";
import { HeartButton } from "./heart-button";
import { IconPen } from "./icon-pen";
import { IconSend } from "./icon-send";

export interface KudosCardProps {
  view: KudosCardSample;
  variant: "feed" | "highlight";
  canHeart: boolean;
  onToggleHeart?: (id: string) => void;
  onCopyLink?: (id: string) => void;
  /** Phase 07: whether the current viewer already has an active heart on
   * this specific kudos (see `heart-button.tsx`'s own doc for why this is
   * session-local state, not a persisted read). */
  liked?: boolean;
  /** Spec D.4 "Click: Lọc danh sách để chỉ hiển thị Kudos thuộc [tag này]"
   * -- the card's headline hashtag band (below). Optional: filter re-query
   * is out of this phase's scope, so this is wired but has no default
   * side effect. */
  onHashtagClick?: (hashtagId: string) => void;
}

/** B.3_KUDO - Highlight (2940:13465, 528px) vs C.3_KUDO Post (3127:21871,
 * 680px) -- same pattern, different card width/padding/radius/border and
 * content line-clamp (3 lines vs 5, spec B.3/C.3). */
const VARIANT_STYLES = {
  highlight: {
    root: "w-full max-w-[528px] gap-4 rounded-[16px] border-4 border-gold bg-[#FFF8E1] px-6 pt-6 pb-4",
    content: "line-clamp-3",
  },
  feed: {
    root: "w-full max-w-[680px] gap-4 rounded-[24px] bg-[#FFF8E1] px-10 pt-10 pb-4",
    content: "line-clamp-5",
  },
} as const;

/**
 * THE shared kudos card (B.3/C.3 node evidence, both variants query-verified
 * -- see phase brief). Consumed by the Highlight carousel (`variant="highlight"`)
 * and this phase's own `kudos-feed.tsx` (`variant="feed"`).
 *
 * Design gap (RED-spec corrected, see delivery report): the feed card's
 * actual Figma action bar (C.4, node `I3127:21871;256:5194`) has ONLY
 * "Copy Link" + heart count -- no "Xem chi tiết" button, unlike the
 * highlight card (B.4.4). `variant === "highlight"` gates the button
 * below accordingly; feed satisfies spec C.3/C.3.5 "Click thẻ mở chi tiết"
 * via the content region itself navigating instead (below) -- only that
 * region, not the whole `<article>`, so the author links and the heart/
 * copy-link action bar (separate regions) keep their own click targets.
 */
export function KudosCard({
  view,
  variant,
  canHeart,
  onToggleHeart,
  onCopyLink,
  onHashtagClick,
  liked,
}: KudosCardProps) {
  const t = useTranslations("kudos");
  const router = useRouter();
  const styles = VARIANT_STYLES[variant];

  // Navigates only on a direct click, never a bubbled one from an embedded
  // link mark inside the rendered kudos content (content-schema.ts allows
  // "link" nodes) -- an anchor click already navigates on its own via
  // native browser behavior, and this handler must not fight that.
  function handleContentClick(event: MouseEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a")) return;
    router.push(`/kudos/${view.id}`);
  }

  function handleContentKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    if ((event.target as HTMLElement).closest("a")) return;
    event.preventDefault();
    router.push(`/kudos/${view.id}`);
  }

  return (
    // mm:2940:13465 (highlight) / mm:3127:21871 (feed)
    <article data-testid="kudos-card" className={`flex flex-col items-start ${styles.root}`}>
      {/* mm:I2940:13465;335:9442 */}
      <div className="flex w-full items-start justify-between gap-6">
        <CardAuthorBlock author={view.sender} meta={view.senderMeta} nameTestId="kudos-card-sender-name" />
        {/* mm:I2940:13465;335:9444 -- static, non-interactive "sent" direction icon */}
        <span className="flex h-8 w-8 shrink-0 self-center text-[#999999]">
          <IconSend className="h-8 w-8" />
        </span>
        <CardAuthorBlock author={view.receiver} meta={view.receiverMeta} nameTestId="kudos-card-receiver-name" />
      </div>

      {/* mm:I2940:13465;335:9447 */}
      <span aria-hidden="true" className="h-px w-full bg-gold" />

      {/* mm:I2940:13465;335:9448 */}
      <div className="flex w-full flex-col gap-4">
        {/* mm:I2940:13465;335:9449 */}
        <span data-testid="kudos-card-time" className="w-full font-body text-base font-bold leading-6 tracking-[0.5px] text-[#999999]">
          {formatKudosTime(view.createdAt)}
        </span>

        {/* mm:I3127:21871;2234:33038 (feed) / mm:I2940:13465;1810:19718
            (highlight) -- spec D.4: per-card headline hashtag band, click
            filters by this tag. Uses the card's first hashtag; the design's
            literal `character` ("IDOL GIỚI TRẺ") is display-only sample
            text, this renders the real first `view.hashtags` entry. */}
        {view.hashtags[0] ? (
          <button
            type="button"
            onClick={() => onHashtagClick?.(view.hashtags[0].id)}
            data-testid="kudos-card-headline-hashtag"
            className="flex w-full items-center justify-center gap-2 font-body text-base font-bold uppercase leading-6 tracking-[0.5px] text-canvas"
          >
            {view.hashtags[0].name}
            <IconPen className="h-8 w-8 shrink-0" />
          </button>
        ) : null}

        {/* mm:I2940:13465;335:9450 -- B.3/C.3: truncate with "…" past the line clamp.
            Feed only (spec C.2/C.3.5 "Click thẻ mở chi tiết"): this region alone
            navigates to /kudos/[id] -- highlight already has its own explicit
            "Xem chi tiết" button (below) and stays a plain, non-interactive div. */}
        <div
          data-testid="kudos-card-content"
          role={variant === "feed" ? "link" : undefined}
          tabIndex={variant === "feed" ? 0 : undefined}
          onClick={variant === "feed" ? handleContentClick : undefined}
          onKeyDown={variant === "feed" ? handleContentKeyDown : undefined}
          className={`w-full text-justify rounded-[12px] border border-gold bg-[rgba(255,234,158,0.40)] px-6 py-4 font-body text-xl font-bold leading-8 text-canvas ${styles.content} ${variant === "feed" ? "cursor-pointer" : ""}`}
        >
          <KudosContentRenderer content={view.content} />
        </div>

        {variant === "feed" ? <CardAttachedImages imagePaths={view.imagePaths} /> : null}

        {/* mm:I2940:13465;335:9458 */}
        <div data-testid="kudos-card-hashtags" className="line-clamp-1 w-full font-body text-base font-bold leading-6 tracking-[0.5px] text-badge">
          {view.hashtags.map((hashtag, index) => (
            <span key={hashtag.id}>
              {index > 0 ? " " : ""}
              <HashtagChip hashtag={hashtag} onClick={onHashtagClick} />
            </span>
          ))}
        </div>
      </div>

      {/* mm:I2940:13465;335:9460 */}
      <span aria-hidden="true" className="h-px w-full bg-gold" />

      {/* mm:I2940:13465;335:9461 */}
      <div className="flex w-full items-center justify-between gap-6">
        <HeartButton
          heartCount={view.heartCount}
          canHeart={canHeart}
          liked={liked}
          onToggleHeart={() => onToggleHeart?.(view.id)}
        />
        {/* mm:I2940:13465;335:9672 */}
        <div className="flex items-center gap-2">
          <CopyLinkButton kudosId={view.id} onCopyLink={onCopyLink} />
          {/* mm:I2940:13465;335:9663 -- highlight-only (spec B.4.4 vs C.4:
              the feed card's real action bar, node I3127:21871;256:5194,
              has no "Xem chi tiết" button -- feed navigates via clicking
              the card content instead). RED spec asserts it visible on the
              first carousel slide and `toHaveCount(0)` on a feed card. */}
          {variant === "highlight" ? (
            <Link
              href={`/kudos/${view.id}`}
              data-testid="kudos-card-view-detail-btn"
              className="flex items-center gap-1 rounded-chip p-4 font-body text-base font-bold text-canvas hover:bg-gold-10"
            >
              {t("card.viewDetail")}
              <IconLinkArrow className="h-6 w-6" />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
