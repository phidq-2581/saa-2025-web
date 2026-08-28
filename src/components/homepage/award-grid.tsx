import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import homeCopy from "../../../messages/vi/home.json";
import { AwardCard } from "./award-card";

const AWARDS_PAGE = "/he-thong-giai";

type CardBadge = { src: string; width: number; height: number };

/**
 * Category-specific wordmark badges (Awards-Name instances, 214:664
 * component set) -- centered over the shared card thumbnail. Native px
 * size per exported asset so each badge renders at its own aspect ratio
 * (code-rules 3, no per-card offset math needed since the parent flexes
 * center/center).
 */
const CARD_BADGES: Record<string, CardBadge> = {
  "top-talent": { src: "/home/award-badge-top-talent.png", width: 222, height: 36 },
  "top-project": { src: "/home/award-badge-top-project.png", width: 232, height: 35 },
  "top-project-leader": { src: "/home/award-badge-top-project-leader.png", width: 232, height: 64 },
  "best-manager": { src: "/home/award-badge-best-manager.png", width: 232, height: 30 },
  "signature-2025-creator": {
    src: "/home/award-badge-signature-2025-creator.png",
    width: 232,
    height: 54,
  },
  mvp: { src: "/home/award-badge-mvp.png", width: 116, height: 52 },
};

/**
 * mms_C1_Header Giải thưởng (2167:9069) + mms_C2_Award list (5005:14974).
 * Section node (2167:9068) is 1224px wide starting at x144 -- the same
 * standard column as Hero and Kudos, header-aligned. `padding: 0px` on
 * this node confirms 1224 is already the final content span; no extra
 * inset padding on top of the max-width (fixes a double-padding bug that
 * previously shrank rendered width to ~936px).
 * `subDescription` has no matching TEXT layer in the current Figma canvas
 * (Frame 488 holds only the heading) but is documented verbatim in
 * specs.csv row C1 -- same class of gap as EventInfo's stale-canvas case.
 */
export function AwardGrid() {
  return (
    // mm:2167:9068
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-[1224px] flex-col gap-8 px-4 py-20 md:px-0">
        {/* mm:2167:9069 */}
        <header className="flex flex-col gap-4">
          {/* mm:2167:9070 */}
          <p className="font-body text-2xl font-bold text-white">{homeCopy.awards.caption}</p>
          {/* mm:2167:9071 */}
          <hr className="w-full border-t border-divider" />
          {/* mm:2167:9073 */}
          <h2 className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
            {homeCopy.awards.heading}
          </h2>
          <p className="font-body text-base font-bold tracking-[0.5px] text-white">
            {homeCopy.awards.subDescription}
          </p>
        </header>

        {/* mm:5005:14974 */}
        <div
          data-testid="award-grid"
          className="grid grid-cols-2 gap-x-6 gap-y-14 sm:gap-x-10 lg:grid-cols-3"
        >
          {AWARD_CATEGORIES.map((category) => {
            const copy =
              homeCopy.awards.cards[category.slug as keyof typeof homeCopy.awards.cards];
            const badge = CARD_BADGES[category.slug];
            return (
              <AwardCard
                key={category.slug}
                slug={category.slug}
                title={copy?.title ?? category.name}
                description={copy?.description}
                badgeSrc={badge?.src ?? ""}
                badgeWidth={badge?.width ?? 0}
                badgeHeight={badge?.height ?? 0}
                href={category.slug ? `${AWARDS_PAGE}#${category.slug}` : AWARDS_PAGE}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
