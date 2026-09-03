import { useTranslations } from "next-intl";

type Badge = { key: string; asset: string; labelSize: string };

// Label sizes are the canvas's own auto-fitted values: 12px for the single-line
// names, 11px for the ones that wrap (I3204:6082;737:20342 … 737:20392).
const BADGES: Badge[] = [
  // Export pending: MoMorph returns no file for MM_MEDIA_ Badge REVIVAL (3204:6082);
  // until the user exports it the circle shows its 2px white ring only.
  { key: "revival", asset: "/rules/badge-revival.png", labelSize: "text-[12px]" },
  { key: "touchOfLight", asset: "/rules/badge-touch-of-light.png", labelSize: "text-[11px]" },
  { key: "stayGold", asset: "/rules/badge-stay-gold.png", labelSize: "text-[12px]" },
  { key: "flowToHorizon", asset: "/rules/badge-flow-to-horizon.png", labelSize: "text-[11px]" },
  { key: "beyondTheBoundary", asset: "/rules/badge-beyond-the-boundary.png", labelSize: "text-[11px]" },
  { key: "rootFurther", asset: "/rules/badge-root-further.png", labelSize: "text-[11px]" },
];

/**
 * Danh sách huy hiệu (3204:6079 → 6080): two 24px side insets bring the 473
 * column down to 377px rows (Frame 511/513, `justify-content: space-between`,
 * 16px apart). Each badge (MM_MEDIA_ Badge *, 80 wide) is a 64px circle with
 * a 2px white ring over a name label 8px below, centred, 16px line-height,
 * 0.5px tracking. The exports are the whole 80xN badge renders with the
 * label baked in, so each is cropped to its circle (which sits at x8, y0 of
 * the export) and the label is real text -- exact typography and wrapping.
 */
export function RulesBadgeGrid() {
  const t = useTranslations("rules");
  const rows = [BADGES.slice(0, 3), BADGES.slice(3)];
  return (
    // mm:3204:6079
    <div className="px-6">
      {/* mm:3204:6080 */}
      <div className="flex flex-col gap-4 px-6">
        {rows.map((row, index) => (
          // mm:3204:6081 / 3204:6085
          <div key={index} className="flex items-start justify-between gap-4">
            {row.map((badge) => (
              <div key={badge.key} data-testid="rules-badge" className="flex w-20 flex-col items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-16 w-16 rounded-full border-2 border-white bg-[length:80px_auto] bg-[position:-8px_0] bg-no-repeat bg-origin-border"
                  style={{ backgroundImage: `url(${badge.asset})` }}
                />
                <span className={`w-20 text-center font-body leading-4 font-bold tracking-[0.5px] text-white ${badge.labelSize}`}>
                  {t(`sender.badges.${badge.key}`)}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
