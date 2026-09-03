import { useTranslations } from "next-intl";

/**
 * mms_D1_Sunkudos (335:12023) as placed on the Hệ thống giải frame: the
 * SunKudos group is the full 1152x500 column width here (on the Homepage
 * the same component is a 1120 card inside a 1224 column), radius 16 over
 * its own #0F0F0F fill with MM_MEDIA_Kudos Background (exported at that
 * 1152x500 crop) as the cover. Content (mms_D2_Content, 470 wide) starts
 * 65px in from the card's left edge and is vertically centred; inside it
 * eyebrow/title/description are 16px apart and the button 32px below
 * (313:8420 gap 16, 313:8419 gap 32). Title is Montserrat 57px/700/64px
 * -0.25px (`font-body`, not the Alternates face); description is
 * 16px/700/24px, 0.5px tracking, justified, and keeps the canvas line
 * break after "ĐIỂM MỚI CỦA SAA 2025". Button 313:8426: padding 16, 8px
 * gap between the 16px/700/24px 0.15px label (canvas colour text) and the
 * 24px arrow. The 383px "KUDOS" lockup (329:2948) sits at the node's own
 * offset: 78px from the card's right edge, 215px from its top.
 */
export function AwardKudosBanner() {
  const t = useTranslations("awards");
  return (
    // mm:I335:12023;313:8415
    <section
      data-testid="award-kudos-banner"
      className="relative flex h-[500px] w-full items-center overflow-hidden rounded-2xl bg-[#0F0F0F] pl-4 md:pl-[65px]"
    >
      {/* mm:I335:12023;313:8416 */}
      <img
        src="/awards/kudos-background.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* mm:I335:12023;313:8419 */}
      <div className="relative z-1 flex w-full max-w-[470px] flex-col gap-8">
        {/* mm:I335:12023;313:8420 */}
        <div className="flex flex-col gap-4">
          {/* mm:I335:12023;313:8421 */}
          <p className="font-body text-2xl leading-8 font-bold text-white">{t("kudos.eyebrow")}</p>
          {/* mm:I335:12023;313:8422 */}
          <h2 className="font-body text-[40px] leading-[48px] font-bold tracking-[-0.25px] text-gold md:text-[57px] md:leading-[64px]">
            {t("kudos.title")}
          </h2>
          {/* mm:I335:12023;313:8423 */}
          <p className="max-w-[457px] text-justify font-body text-base leading-6 font-bold tracking-[0.5px] whitespace-pre-line text-white">
            {t("kudos.description")}
          </p>
        </div>
        {/* mm:I335:12023;313:8426 */}
        <button
          type="button"
          data-testid="award-kudos-detail"
          aria-disabled="true"
          tabIndex={-1}
          className="inline-flex w-fit cursor-default items-center gap-2 rounded-chip bg-gold p-4 font-body text-base leading-6 font-bold tracking-[0.15px] text-canvas"
        >
          {t("kudos.detailLabel")}
          <img src="/awards/kudos-detail-icon.svg" alt="" width={24} height={24} />
        </button>
      </div>
      {/* mm:I335:12023;329:2948 */}
      <img
        src="/awards/kudos-logo.svg"
        alt={t("kudos.logoAlt")}
        className="absolute top-[215px] right-[78px] hidden h-auto w-[383px] lg:block"
      />
    </section>
  );
}
