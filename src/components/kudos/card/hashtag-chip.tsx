import type { HashtagRef } from "@/lib/kudos/types";

/**
 * One tag inside B.4.3/C.3.7 "#Dedicated #Inspring ..." -- the design
 * renders the whole line as one run of `#Tag` tokens (single TEXT node,
 * `character` verbatim), not individual chip elements, so this stays a
 * plain inline `#name` fragment that the parent (`kudos-card.tsx`) joins
 * with spaces inside one `line-clamp-1` red-text container.
 */
export function HashtagChip({ hashtag }: { hashtag: HashtagRef }) {
  // mm:I2940:13465;335:9459
  return <span>#{hashtag.name}</span>;
}
