import { useTranslations } from "next-intl";
import type { HeroTier } from "@/components/kudos/board/kudos-board-types";

const LABEL_KEY: Record<HeroTier, string> = {
  new: "heroTier.new",
  rising: "heroTier.rising",
  super: "heroTier.super",
  legend: "heroTier.legend",
};

/**
 * B.3.2/C.3.1 "danh hiệu" pill next to a sender/receiver name -- a frame
 * discovery, not in specs.csv (clarifications.md 2026-08-31 "Phát hiện từ
 * frame: badge danh hiệu 4 bậc New/Rising/Super/Legend Hero cạnh tên").
 * The MoMorph instance (componentSet 3007:17505) paints each tier as a
 * textured background image baked per-tier with no exportable asset
 * (`get_media_files` returns tier-specific PNGs with no shared source) --
 * simplified here to a flat pill using only queried values (border
 * 0.5px solid #FFEA9E / --color-gold, radius 48px, and the darker overlay
 * fill `rgba(9, 36, 50, 0.5)` seen on every tier's gradient rectangle) per
 * the phase brief's explicit allowance to keep this presentational.
 */
export function HeroTierBadge({ tier }: { tier: HeroTier }) {
  const t = useTranslations("kudos");
  return (
    // mm:I2940:13465;335:9443;3106:17694 (componentSet 3007:17505)
    <span
      className="inline-flex h-[19px] items-center justify-center whitespace-nowrap rounded-[48px] border-[0.5px] border-gold bg-[rgba(9,36,50,0.5)] px-2 font-body text-[11px] font-bold leading-[16px] text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)]"
    >
      {t(LABEL_KEY[tier])}
    </span>
  );
}
