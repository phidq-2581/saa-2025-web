import { useTranslations } from "next-intl";
import type { AsteriskTier } from "@/components/kudos/board/kudos-board-types";

const TIER_KEY: Record<Exclude<AsteriskTier, 0>, string> = {
  1: "asterisk.tier1",
  2: "asterisk.tier2",
  3: "asterisk.tier3",
};

function StarGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5L14.85 8.44L21.39 9.39L16.7 13.96L17.81 20.47L12 17.42L6.19 20.47L7.3 13.96L2.61 9.39L9.15 8.44L12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * B.3.2/B.3.6/C.3.1/C.3.3 "Huy hiệu + Sao" -- the per-person "hoa thị"
 * (asterisk) milestone shown next to the hero-tier badge (kudos-board-types
 * `AuthorPresentation.asteriskTier`, clarifications.md "Suy từ mốc hoa thị"
 * 10/20/50 kudos received). No MoMorph star asset was found on this frame
 * (`list_media_nodes` has no star/asterisk entry) -- rendered as a generic
 * gold star glyph, repeated 0-3 times per tier; flagged as a design-fidelity
 * gap in the delivery report. Hover reveals the verbatim tier copy from
 * messages/vi/kudos.json (spec B.3.2/B.3.6).
 */
export function AsteriskBadge({ tier }: { tier: AsteriskTier }) {
  const t = useTranslations("kudos");
  const tooltip = tier > 0 ? t(TIER_KEY[tier as Exclude<AsteriskTier, 0>]) : null;

  return (
    // mm:I2940:13465;335:9443;256:4741 (asterisk sub-slot of "Huy hiệu + Sao")
    <span data-testid="kudos-card-asterisk-badge" className="group relative inline-flex items-center gap-0.5 text-gold">
      {Array.from({ length: tier }, (_, index) => (
        <StarGlyph key={index} />
      ))}
      {tooltip ? (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 w-max max-w-[240px] -translate-x-1/2 rounded-panel border border-border-gold bg-panel p-2 text-center font-body text-xs font-normal text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {tooltip}
        </span>
      ) : null}
    </span>
  );
}
