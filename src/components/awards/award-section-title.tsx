import { useTranslations } from "next-intl";

/**
 * mms_A_Title hệ thống giải thưởng (313:8453): 1152px column, gap 16 --
 * a centred 24px/700/32px eyebrow (313:8454, `text-align: center`), the
 * 1px var(--Details-Divider, #2E3940) rule (313:8455), then Frame 488
 * (313:8456, `justify-content: center`) holding the 57px/700/64px
 * -0.25px gold heading (313:8457). The heading's own family is Montserrat
 * (`font-body`), not Montserrat Alternates, and it is centred as a block
 * inside the row rather than left-aligned to the column.
 */
export function AwardSectionTitle() {
  const t = useTranslations("awards");
  return (
    // mm:313:8453
    <div data-testid="award-section-title" className="flex w-full flex-col gap-4">
      {/* mm:313:8454 */}
      <p className="text-center font-body text-2xl leading-8 font-bold text-white">
        {t("sectionTitle.eyebrow")}
      </p>
      {/* mm:313:8455 */}
      <hr className="w-full border-t border-divider" />
      {/* mm:313:8456 */}
      <div className="flex w-full items-center justify-center gap-8">
        {/* mm:313:8457 */}
        <h2 className="font-body text-[40px] leading-12 font-bold tracking-[-0.25px] text-gold md:text-[57px] md:leading-16">
          {t("sectionTitle.heading")}
        </h2>
      </div>
    </div>
  );
}
