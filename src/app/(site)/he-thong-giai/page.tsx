import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardKeyvisual } from "@/components/awards/award-keyvisual";
import { AwardHero } from "@/components/awards/award-hero";
import { AwardSectionTitle } from "@/components/awards/award-section-title";
import { AwardCategoryNav } from "@/components/awards/award-category-nav";
import { AwardInfoCard } from "@/components/awards/award-info-card";
import { AwardKudosBanner } from "@/components/awards/award-kudos-banner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("awards");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * Hệ thống giải (MoMorph zFYDgyj_pD, frame 313:8436, 1440 canvas). The
 * frame is one Bìa column (313:8449): 1152px wide at x144, first child at
 * y184 (88px header offset + 96px padding), `gap: 120px` between KV
 * wordmark → title block → mms_B (nav + cards) → Sun* Kudos banner, then
 * 96px padding + a 14px gap to the footer (110px). The keyvisual artwork
 * and its cover are absolute layers behind the column
 * (`award-keyvisual.tsx`), which is why the title block sits over the art
 * instead of under a hero band. mms_B (313:8458) is `justify-content:
 * space-between` over the 178px menu list (313:8459) and the 853px D
 * column (313:8466, cards 80px apart). No `overflow-hidden` on `<main>`: an
 * overflow-clipping ancestor turns into the scroll container and kills the
 * nav's `position: sticky`; nothing here overflows horizontally anyway.
 */
export default function AwardSystemPage() {
  return (
    <main data-testid="award-system-main" className="relative flex w-full flex-col">
      <AwardKeyvisual />
      {/* mm:313:8449 */}
      <div className="relative z-1 mx-auto flex w-full max-w-[1152px] flex-col gap-[120px] px-4 pt-[184px] pb-[110px] md:px-0">
        <AwardHero />
        <AwardSectionTitle />
        {/* mm:313:8458 */}
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-0">
          <div className="md:sticky md:top-24 md:h-fit">
            <AwardCategoryNav categories={AWARD_CATEGORIES} />
          </div>
          {/* mm:313:8466 */}
          <div className="flex w-full flex-col gap-20 md:w-[853px]">
            {AWARD_CATEGORIES.map((category, index) => (
              <AwardInfoCard
                key={category.slug}
                slug={category.slug}
                index={index}
                isLast={index === AWARD_CATEGORIES.length - 1}
              />
            ))}
          </div>
        </div>
        <AwardKudosBanner />
      </div>
    </main>
  );
}
