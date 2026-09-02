import { useTranslations } from "next-intl";

/**
 * A.1_Button ghi nhận (2940:13449, componentId 186:2757) -- the compose
 * trigger pill: pen icon + placeholder text field. Real click-to-open
 * compose dialog behavior is Phase 07 scope; this phase renders a real
 * `<input readOnly>` so the RED contract's
 * `toHaveAttribute("placeholder", ...)` on `kudos-board-compose-pill`
 * resolves against an actual form element.
 *
 * DESIGN GAP: a second, identically-styled instance "Tìm kiếm sunner"
 * (2940:13450, same componentId 186:2757) sits next to A.1 in the raw
 * Figma tree, but the spec CSV only documents A.1 -- per phase brief this
 * is a duplicate/decorative mockup artifact, not a second real search
 * feature, so it is intentionally not rendered here.
 */
export function ComposePill() {
  const t = useTranslations("kudos");
  return (
    // mm:2940:13449
    <div className="flex w-[738px] max-w-full items-center gap-2 rounded-pill border border-border-gold bg-gold-10 px-4 py-6">
      {/* mm:I2940:13449;186:2758 */}
      <div className="flex flex-1 items-center gap-4">
        {/* mm:I2940:13449;186:2759 */}
        <PenIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-white" />
        {/* mm:I2940:13449;186:2760 */}
        <input
          type="text"
          readOnly
          data-testid="kudos-board-compose-pill"
          placeholder={t("composePill.placeholder")}
          className="w-full flex-1 bg-transparent text-center font-body text-base font-bold tracking-[0.15px] text-white placeholder-white outline-none"
        />
      </div>
    </div>
  );
}

/** MM_MEDIA_Pen (I2940:13449;186:2759) -- mono icon, `fill="white"` swapped
 * for `currentColor` per code-rules 2a so the parent's `text-white`
 * controls it. */
function PenIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
        fill="currentColor"
      />
    </svg>
  );
}
