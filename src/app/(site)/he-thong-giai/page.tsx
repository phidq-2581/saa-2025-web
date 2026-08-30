import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AWARD_CATEGORIES } from "@/lib/awards/award-categories";
import { AwardHero } from "@/components/awards/award-hero";
import { AwardSectionTitle } from "@/components/awards/award-section-title";
import { AwardCategoryNav } from "@/components/awards/award-category-nav";
import { AwardInfoCard } from "@/components/awards/award-info-card";
import { AwardKudosBanner } from "@/components/awards/award-kudos-banner";

/**
 * Per-page title + description, localised from design content only
 * (clarifications.md § SEO). A separate `generateMetadata` export, not
 * rendered by `__tests__/award-page-sections.test.tsx` (which only renders
 * the default `AwardSystemPage` export) -- `async` is safe here even
 * though the page component itself must stay synchronous; see
 * `hero-section.tsx`'s docblock for why.
 */
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("awards");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

/**
 * `/he-thong-giai` (MoMorph "Hệ thống giải", zFYDgyj_pD). Route is guarded
 * by Phase 03's `proxy.ts` -- not re-implemented here. `(site)/layout.tsx`
 * renders no `<main>`, so this page's root carries
 * `data-testid="award-system-main"` directly. Order per item stacking
 * (hero -> section title -> nav+cards two-column region -> Kudos banner)
 * mirrors `mms_3_Keyvisual` -> `mms_A_Title` -> `mms_B_Hệ thống giải
 * thưởng` (`mms_C_Menu list` + D.1-D.6) -> `mms_D1_Sunkudos` in the frame
 * tree. `pt-20` offsets the fixed 80px header from `SiteHeader`.
 */
export default function AwardSystemPage() {
  return (
    <main data-testid="award-system-main" className="flex flex-col pt-20">
      <AwardHero />
      <AwardSectionTitle />
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-4 py-10 md:flex-row md:px-36">
        <div className="md:sticky md:top-24 md:h-fit">
          <AwardCategoryNav categories={AWARD_CATEGORIES} />
        </div>
        <div className="flex flex-1 flex-col divide-y divide-white/10">
          {AWARD_CATEGORIES.map((category, index) => (
            <AwardInfoCard key={category.slug} slug={category.slug} index={index} />
          ))}
        </div>
      </div>
      <div className="px-4 pb-16 md:px-9 lg:px-16">
        <AwardKudosBanner />
      </div>
    </main>
  );
}
