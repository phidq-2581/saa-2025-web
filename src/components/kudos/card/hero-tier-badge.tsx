import { useTranslations } from "next-intl";
import type { HeroTier } from "@/components/kudos/board/kudos-board-types";
import { HeroTierTooltip } from "./hero-tier-tooltip";

const LABEL_KEY: Record<HeroTier, string> = {
  new: "heroTier.new",
  rising: "heroTier.rising",
  super: "heroTier.super",
  legend: "heroTier.legend",
};

// MM_MEDIA_New/Rising/Super/Legend Hero exports (componentSet 3007:17505,
// master 109x19 -- the same file is instanced on the Kudos board cards and,
// scaled to 126x22, in the Thể lệ panel). New Hero came from a manual Figma
// export (MoMorph has no file for it), 2x like the rest, drawn at the fixed
// design size. The text pill below stays as the fallback for a tier without
// an asset.
const PILL_ASSET: Partial<Record<HeroTier, string>> = {
  new: "/kudos-board/hero-new.png",
  rising: "/kudos-board/hero-rising.png",
  super: "/kudos-board/hero-super.png",
  legend: "/kudos-board/hero-legend.png",
};

// sm: the card instance (I2940:13465;335:9443;3106:17694), 109x19.
// md: the Thể lệ panel instances (3204:6163…6190), 126x22, with per-tier label
// sizes for the text fallback (13.205 / 13.159 / 13.476 / 14.845px).
const PILL_SIZE = { sm: { width: 109, height: 19 }, md: { width: 126, height: 22 } } as const;
const TEXT_SM = "h-[19px] px-2 text-[11px] leading-[16px]";
const TEXT_MD: Record<HeroTier, string> = {
  new: "h-[22px] w-[126px] text-[13.205px] leading-[18.864px] tracking-[0.094px]",
  rising: "h-[22px] w-[126px] text-[13.159px] leading-[18.799px] tracking-[0.094px]",
  super: "h-[22px] w-[126px] text-[13.476px] leading-[19.252px] tracking-[0.096px]",
  legend: "h-[22px] w-[126px] text-[14.845px] leading-[19.684px] tracking-[0.106px]",
};

export type HeroTierBadgeProps = {
  tier: HeroTier;
  size?: keyof typeof PILL_SIZE;
  /** Hover card per the "Hover danh hiệu {tier}" frames (hero-tier-tooltip.tsx).
   *  Off inside the Thể lệ panel, where the rule already sits beside the pill. */
  tooltip?: boolean;
};

export function HeroTierBadge({ tier, size = "sm", tooltip = true }: HeroTierBadgeProps) {
  const t = useTranslations("kudos");
  const label = t(LABEL_KEY[tier]);
  const asset = PILL_ASSET[tier];
  const { width, height } = PILL_SIZE[size];

  return (
    <span data-testid="kudos-card-hero-badge" className="group relative inline-flex items-center">
      {asset ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset} alt={label} width={width} height={height} style={{ width, height }} />
      ) : (
        <span
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-[48px] border-[0.5px] border-gold bg-[rgba(9,36,50,0.5)] font-body font-bold text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.5)] ${
            size === "md" ? TEXT_MD[tier] : TEXT_SM
          }`}
        >
          {label}
        </span>
      )}
      {tooltip ? <HeroTierTooltip tier={tier} label={label} /> : null}
    </span>
  );
}
