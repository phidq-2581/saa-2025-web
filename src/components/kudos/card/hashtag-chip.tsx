import type { HashtagRef } from "@/lib/kudos/types";

export interface HashtagChipProps {
  hashtag: HashtagRef;
  /** Phase 07 (spec D.4 "Click: Lọc danh sách để chỉ hiển thị Kudos thuộc
   * [tag này]"). Optional: `kudos-detail-view.tsx` renders this chip
   * read-only (no filtering context on the detail page), so the click
   * affordance only appears where a handler is actually supplied. */
  onClick?: (hashtagId: string) => void;
}

/**
 * One tag inside B.4.3/C.3.7 "#Dedicated #Inspring ..." -- the design
 * renders the whole line as one run of `#Tag` tokens (single TEXT node,
 * `character` verbatim), not individual chip elements, so this stays a
 * plain inline `#name` fragment that the parent (`kudos-card.tsx`) joins
 * with spaces inside one `line-clamp-1` red-text container. Renders as a
 * `<button>` (not a `<span>`) so it stays clickable/keyboard-reachable when
 * `onClick` is supplied -- Tailwind's Preflight already resets `button` to
 * `font: inherit; color: inherit`, so no extra class is needed to keep it
 * visually identical to the plain-text original (there is no
 * `font-inherit` Tailwind utility; `font-*` maps to family/weight, not the
 * CSS `inherit` keyword).
 */
export function HashtagChip({ hashtag, onClick }: HashtagChipProps) {
  // mm:I2940:13465;335:9459
  if (!onClick) {
    return <span>#{hashtag.name}</span>;
  }

  return (
    <button
      type="button"
      data-testid="hashtag-chip"
      onClick={() => onClick(hashtag.id)}
      className="bg-transparent p-0"
    >
      #{hashtag.name}
    </button>
  );
}
