import { useTranslations } from "next-intl";
import type { HeroTier } from "@/components/kudos/board/kudos-board-types";

// Tooltip pill = the same MM_MEDIA_* export drawn at 2x (109x19 -> 218x38, radius 96,
// 1px gold stroke); the text fallback (tier without an asset) carries the canvas's label sizes.
const PILL_ASSET: Partial<Record<HeroTier, string>> = {
  new: "/kudos-board/hero-new.png",
  rising: "/kudos-board/hero-rising.png",
  super: "/kudos-board/hero-super.png",
  legend: "/kudos-board/hero-legend.png",
};
const PILL_TEXT: Record<HeroTier, string> = {
  new: "text-[22.808px] leading-[32.583px] tracking-[0.163px]",
  rising: "text-[22.729px] leading-[32.471px] tracking-[0.162px]",
  super: "text-[23.277px] leading-[33.253px] tracking-[0.166px]",
  legend: "text-[25.642px] leading-[34px] tracking-[0.183px]",
};

/**
 * "Hover danh hiệu {tier}" (MoMorph twC9br89ra / IjeDnHmzou / d6zEZ9ccoX /
 * XI0QKVv1qZ, frames 3241:14991…15003): a 304x192 card on
 * var(--Details-Container-2, #00070C), radius 16, padding 16, holding an
 * "Infor" column (gap 11) of the 218x38 pill and one 14px/700/20px 0.1px
 * text. MoMorph reports that text node as var(--Details-Text-Secondary-2,
 * #999), while the canvas paints its first sentence -- the kudos range --
 * white and only the description grey (per-range fills MoMorph flattens), so
 * the copy is stored as two strings (`kudos.heroTooltip.*`, canvas
 * wording: en-dash ranges) and the range gets its own white line. Shown via
 * the parent's `group-hover`, centred below the pill. Placement is not on the
 * canvas; below (not above) because the HIGHLIGHT KUDOS track is an
 * `overflow-x-auto` scroller inside an `overflow-hidden` stage, and a card
 * opening upward from the pill row ran past the track's top edge and was
 * clipped -- downward it stays inside the 480px slide.
 */
export function HeroTierTooltip({ tier, label }: { tier: HeroTier; label: string }) {
  const t = useTranslations("kudos");
  const asset = PILL_ASSET[tier];
  return (
    // mm:3241:14991
    <span
      role="tooltip"
      className="pointer-events-none absolute top-full left-1/2 z-10 mt-1 flex w-[304px] min-h-[192px] -translate-x-1/2 flex-col items-center justify-center rounded-2xl bg-panel p-4 text-left opacity-0 transition-opacity group-hover:opacity-100"
    >
      {/* mm:3241:14992 */}
      <span className="flex w-full flex-col items-start gap-[11px]">
        {/* mm:3241:14993 */}
        {asset ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={asset} alt="" aria-hidden="true" width={218} height={38} style={{ width: 218, height: 38 }} />
        ) : (
          <span
            className={`inline-flex h-[38px] w-[218px] items-center justify-center whitespace-nowrap rounded-[96px] border border-gold bg-[rgba(9,36,50,0.5)] font-body font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] ${PILL_TEXT[tier]}`}
          >
            {label}
          </span>
        )}
        {/* mm:3241:14994 */}
        <span className="w-full font-body text-sm leading-5 font-bold tracking-[0.1px] text-[#999999]">
          <span className="block text-white">{t(`heroTooltip.${tier}.range`)}</span>
          {t(`heroTooltip.${tier}.description`)}
        </span>
      </span>
    </span>
  );
}
