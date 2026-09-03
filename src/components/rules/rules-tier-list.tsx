import { useTranslations } from "next-intl";
import type { HeroTier } from "@/components/kudos/board/kudos-board-types";
import { HeroTierBadge } from "@/components/kudos/card/hero-tier-badge";

const TIERS: HeroTier[] = ["new", "rising", "super", "legend"];

/**
 * The four "content" rows of 3204:6131 (3204:6161/6170/6179/6188): each is
 * 72px tall (fixed -- the 2-line description box is 44px, 4px more than its
 * text, so the row height is pinned), 16px apart, inset 20px from the column -- the 126x22 Hero pill
 * (MM_MEDIA_New/Rising/Super/Legend Hero, drawn by the shared
 * `HeroTierBadge` at its `md` size) with the 16px/700/24px range text 8px
 * to its right, then 4px below, the 14px/700/20px 0.1px description on two
 * lines (the Super Hero copy keeps the canvas's manual line break).
 */
export function RulesTierList() {
  const t = useTranslations("rules");
  return (
    <ul className="flex flex-col gap-4">
      {TIERS.map((tier) => (
        // mm:3204:6161
        <li key={tier} data-testid="rules-tier" className="flex h-[72px] flex-col gap-1 pl-5">
          {/* pill and range text share their top edge on the canvas (both at the row's y) */}
          <div className="flex items-start gap-2">
            <HeroTierBadge tier={tier} size="md" tooltip={false} />
            {/* mm:3204:6162 */}
            <span className="font-body text-base leading-6 font-bold tracking-[0.5px] text-white">
              {t(`receiver.tiers.${tier}.range`)}
            </span>
          </div>
          {/* mm:3204:6168 */}
          <p className="whitespace-pre-line text-justify font-body text-sm leading-5 font-bold tracking-[0.1px] text-white">
            {t(`receiver.tiers.${tier}.description`)}
          </p>
        </li>
      ))}
    </ul>
  );
}
