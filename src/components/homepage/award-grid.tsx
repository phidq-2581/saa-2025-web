import { useTranslations } from "next-intl";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
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
 * standard column as Hero and Kudos, header-aligned -- with `gap: 80px`
 * between the header block and the card list and no padding of its own;
 * the 120px above/below it belong to Bìa's auto-layout and are carried by
 * the neighbouring blocks (RootFurtherBlock's bottom, KudosPromo's top).
 * Header (gap 16): 24px caption, 1px #2E3940 rule, 57px/700/64px heading.
 * List: two rows (Frame 491/493) 80px apart, each `justify-content:
 * space-between` over three 336px cards -- i.e. 108px between cards
 * ((1224 - 3*336) / 2). The lg grid encodes exactly that; the narrower
 * breakpoints are layout values, not Figma values (no mobile frame).
 * The spec CSV row C1 also lists a sub-description line under the heading;
 * the canvas has no such TEXT layer and clarifications.md 2026-09-03 makes
 * the canvas authoritative, so it is not rendered (the key stays for
 * page metadata).
 */
export function AwardGrid() {
  const t = useTranslations("home");
  return (
    // mm:2167:9068
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-[1224px] flex-col gap-20 px-4 md:px-0">
        {/* mm:2167:9069 */}
        <header className="flex flex-col gap-4">
          {/* mm:2167:9070 */}
          <p className="font-body text-2xl font-bold leading-8 text-white">{t("awards.caption")}</p>
          {/* mm:2167:9071 */}
          <hr className="w-full border-t border-divider" />
          {/* mm:2167:9073 */}
          <h2 className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
            {t("awards.heading")}
          </h2>
        </header>

        {/* mm:5005:14974 */}
        <div
          data-testid="award-grid"
          className="grid grid-cols-2 gap-x-6 gap-y-14 sm:gap-x-10 lg:grid-cols-3 lg:gap-x-[108px] lg:gap-y-20"
        >
          {AWARD_CATEGORIES.map((category) => {
            const cardKey = `awards.cards.${category.slug}`;
            const title = t.has(`${cardKey}.title`) ? t(`${cardKey}.title`) : category.name;
            const description = t.has(`${cardKey}.description`)
              ? t(`${cardKey}.description`)
              : undefined;
            const badge = CARD_BADGES[category.slug];
            return (
              <AwardCard
                key={category.slug}
                slug={category.slug}
                title={title}
                description={description}
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
