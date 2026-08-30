import { useTranslations } from "next-intl";

/**
 * Sun* Kudos promo block (MoMorph D1/`mms_D1_Sunkudos`, 335:12023).
 * Background `MM_MEDIA_Kudos Background` (1152x500, radius 16px, fallback
 * #0F0F0F). Title "Sun* Kudos" fontSize 57/weight 700/color
 * rgba(255,234,158,1) = --color-gold. "Chi tiết" button
 * (`mms_D2.1_Button-IC`) bg rgba(255,234,158,1) = --color-gold, radius
 * 4px = --radius-chip. Per clarifications.md ("Kudos detail page ...
 * out of scope ... keep the affordances visible, do not navigate, mark
 * deferred"), the button is rendered inert: no `href`, no click handler,
 * removed from the tab order, `aria-disabled` -- the RED test only
 * requires that IF an inner `<a>` exists its `href` is falsy, satisfied
 * trivially here since there is no anchor at all.
 */
export function AwardKudosBanner() {
  const t = useTranslations("awards");
  return (
    <section
      data-testid="award-kudos-banner"
      className="relative mx-auto flex max-w-[1152px] flex-col items-start gap-8 overflow-hidden rounded-2xl bg-[#0F0F0F] px-4 py-10 md:mx-4 md:flex-row md:items-center md:justify-between md:px-12 lg:mx-auto"
    >
      <img
        src="/awards/kudos-background.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-1 flex max-w-[457px] flex-col gap-8">
        <div className="flex flex-col gap-4">
          <p className="text-2xl leading-8 font-bold text-white">{t("kudos.eyebrow")}</p>
          <h2 className="font-heading text-[40px] leading-[48px] font-bold tracking-[-0.25px] text-gold md:text-[57px] md:leading-[64px]">
            {t("kudos.title")}
          </h2>
          <p className="text-base leading-6 tracking-[0.5px] whitespace-pre-line text-white">
            {t("kudos.description")}
          </p>
        </div>
        <button
          type="button"
          data-testid="award-kudos-detail"
          aria-disabled="true"
          tabIndex={-1}
          className="inline-flex w-fit cursor-default items-center gap-2 rounded-chip bg-gold p-4 font-body text-sm font-bold text-[#0F0F0F]"
        >
          {t("kudos.detailLabel")}
          <img src="/awards/kudos-detail-icon.svg" alt="" width={24} height={24} />
        </button>
      </div>
      <img
        src="/awards/kudos-logo.svg"
        alt={t("kudos.logoAlt")}
        className="relative z-1 h-auto w-[220px] md:w-[383px]"
      />
    </section>
  );
}
