import Link from "next/link";
import type { KudosAuthor } from "@/lib/kudos/types";
import type { AuthorPresentation } from "@/components/kudos/board/kudos-board-types";
import { AsteriskBadge } from "./asterisk-badge";
import { HeroTierBadge } from "./hero-tier-badge";

export interface CardAuthorBlockProps {
  author: KudosAuthor;
  meta: AuthorPresentation;
  nameTestId: string;
}

function initialsOf(fullName: string | null) {
  const parts = (fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/**
 * B.3.1/B.3.2 "Avatar người gửi" + "Thông tin người gửi" (also reused for
 * "người nhận" -- both sides share one MoMorph component,
 * componentSetId 2009:13867). `avatarUrl: null` renders initials (same
 * fallback decision as `account-menu.tsx`'s AccountMenu, since none of the
 * MoMorph avatars are exportable Google-profile placeholders).
 *
 * Phase 07 (integration follow-up, spec B.3.1/B.3.2/B.3.5/B.3.6 "click
 * avatar or name opens profile"): the whole block is one `Link` to
 * `/profile?id={author.id}` -- avatar, name, department and badges all sit
 * inside the same hit area, same as clicking either one alone. `Link`
 * swaps the root `<div>` for an `<a>` but keeps every class/child
 * identical, so nothing about the rendered layout changes.
 */
export function CardAuthorBlock({ author, meta, nameTestId }: CardAuthorBlockProps) {
  return (
    // mm:I2940:13465;335:9443 (Infor instance)
    <Link
      href={`/profile?id=${author.id}`}
      className="flex w-[235px] flex-col items-center justify-center gap-[13px]"
    >
      {/* mm:I2940:13465;335:9443;256:4734 */}
      <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[1.869px] border-white bg-[#EEE]">
        {author.avatarUrl ? (
          <img src={author.avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="font-body text-sm font-bold text-canvas">{initialsOf(author.fullName)}</span>
        )}
      </span>

      {/* mm:I2940:13465;335:9443;256:4737 */}
      <div className="flex w-[235px] flex-col items-start gap-0.5">
        {/* mm:I2940:13465;335:9443;256:4735 */}
        <span
          data-testid={nameTestId}
          className="w-full text-center font-body text-base font-bold leading-6 tracking-[0.15px] text-canvas"
        >
          {author.fullName}
        </span>
        {/* mm:I2940:13465;335:9443;256:4741 */}
        <div className="flex w-[235px] items-center justify-center gap-2.5">
          {/* mm:I2940:13465;335:9443;256:4751 */}
          <span className="font-body text-sm font-bold leading-5 tracking-[0.1px] text-[#999999]">
            {meta.department}
          </span>
          {/* mm:I2940:13465;335:9443;256:4754 */}
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[#999999] opacity-40" />
          <HeroTierBadge tier={meta.heroTier} />
          <AsteriskBadge tier={meta.asteriskTier} />
        </div>
      </div>
    </Link>
  );
}
