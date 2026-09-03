import { Fragment } from "react";
import { useTranslations } from "next-intl";

type AwardInfoCardProps = {
  slug: string;
  index: number;
  /** The D column's last card (D.6) ends on its content -- no trailing rule. */
  isLast?: boolean;
};

// Canvas description boxes taller than their text: the Figma TEXT nodes for
// Signature (313:8479, 480x360) and MVP (I313:8510;214:2623, 480x408) are fixed
// boxes with slack under the copy (the other four are auto-height), so the
// rows below them start where the canvas puts them, not where the text ends.
const DESCRIPTION_MIN_HEIGHT: Record<string, string> = {
  "signature-2025-creator": "md:min-h-[360px]",
  mvp: "md:min-h-[408px]",
};

type CardPrize = { amount: string; qualifier: string | null };
type CardContent = {
  title: string;
  description: string;
  quantityValue: string;
  quantityUnit: string;
  prizes: CardPrize[];
};

/**
 * mms_D.1–D.6 award detail (313:8467…8510, 856 wide in the 853px D column):
 * Frame 506 (row, gap 40) = 336x336 Picture-Award + 480px Content, then
 * 80px below it the 853x1 var(--Details-Divider, #2E3940) rule (Rectangle
 * 14) that closes every card but the last. Even cards flip picture and content
 * with `order`, not `flex-row-reverse`: the 856px row overhangs the 853px
 * column by 3px and the canvas keeps that overhang on the right either way -- the D column itself adds
 * another 80 before the next card, and the Sun* Kudos banner follows D.6's
 * content directly (120px, from Bìa's gap). Odd cards put the picture first, even cards the content.
 *
 * Content (214:2526, radius 16, backdrop blur 32) is a column with `gap:
 * 32px` whose items are: [title row (24px icon, 16px gap, 24px/700/32px
 * gold title) + 24px + justified 16px/700/24px 0.5px description] · 1px
 * rule · [quantity row: diamond, 16px, gold label, 16px, 36px/700/44px
 * number, 8px, 14px/700/20px unit in a 60px box -- the canvas wraps "Cá
 * nhân" onto two lines and "Cá nhân hoặc tập thể" onto four] · 1px rule ·
 * one prize block per prize (label row, 16px, amount, 16px, qualifier),
 * with the Signature card's two prizes separated by Frame 524: "Hoặc" in
 * the divider colour + a 1px rule filling the rest of the row (313:8499/8500).
 */
export function AwardInfoCard({ slug, index, isLast = false }: AwardInfoCardProps) {
  const t = useTranslations("awards");
  const contentKey = `cardContent.${slug}`;
  if (!t.has(contentKey)) return null;

  // `t.raw()` returns the catalog value untyped (next-intl does not narrow
  // nested message shapes); CardContent documents the real JSON shape it is
  // cast to below.
  const content: CardContent = {
    title: t(`${contentKey}.title`),
    description: t(`${contentKey}.description`),
    quantityValue: t(`${contentKey}.quantityValue`),
    quantityUnit: t(`${contentKey}.quantityUnit`),
    prizes: t.raw(`${contentKey}.prizes`) as CardPrize[],
  };

  const imageOnRight = index % 2 === 1;
  const labelClassName = "font-body text-2xl leading-8 font-bold text-gold";
  const smallClassName = "font-body text-sm leading-5 font-bold tracking-[0.1px] text-white";
  const bigClassName = "font-body text-4xl leading-11 font-bold text-white";

  return (
    // mm:313:8467
    <section
      id={slug}
      data-testid="award-info-card"
      data-slug={slug}
      className="scroll-mt-24 flex w-full flex-col gap-20"
    >
      {/* mm:I313:8467;214:2803 */}
      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        {/* mm:I313:8467;214:2525 */}
        <div
          className={`relative flex h-55 w-55 shrink-0 items-center justify-center self-center overflow-hidden rounded-3xl border border-gold shadow-(--shadow-glow-gold) md:h-84 md:w-84 md:self-start ${imageOnRight ? "md:order-2" : ""}`}
        >
          <img src="/awards/award-thumb-bg.png" alt="" width={336} height={336} className="absolute inset-0 h-full w-full object-cover" />
          <img src={`/home/award-badge-${slug}.png`} alt="" className="relative z-1 max-w-[70%]" />
        </div>

        {/* mm:I313:8467;214:2526 */}
        <div className="flex w-full shrink-0 flex-col gap-8 rounded-2xl backdrop-blur-[32px] md:w-120">
          {/* mm:I313:8467;214:2527 */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <img src="/awards/target-icon.svg" alt="" width={24} height={24} />
              <h3 className={labelClassName}>{content.title}</h3>
            </div>
            <p
              className={`w-full text-justify font-body text-base leading-6 font-bold tracking-[0.5px] text-white ${DESCRIPTION_MIN_HEIGHT[slug] ?? ""}`}
            >
              {content.description}
            </p>
          </div>
          {/* mm:I313:8467;214:2532 */}
          <hr className="w-full border-t border-divider" />
          {/* mm:I313:8467;214:2534 */}
          <div className="flex items-center gap-4">
            <img src="/awards/diamond-icon.svg" alt="" width={24} height={24} />
            <span className={labelClassName}>{t("card.quantityLabel")}</span>
            <div className="flex items-center gap-2">
              <span className={bigClassName}>{content.quantityValue}</span>
              <span className={`w-[60px] ${smallClassName}`}>{content.quantityUnit}</span>
            </div>
          </div>
          {/* mm:I313:8467;214:2539 */}
          <hr className="w-full border-t border-divider" />
          {/* mm:I313:8467;214:2540 */}
          <div className="flex flex-col gap-8">
            {content.prizes.map((prize, prizeIndex) => (
              <Fragment key={prize.amount}>
                {prizeIndex > 0 && (
                  // mm:313:8498
                  <div className="flex items-center gap-2">
                    <span className="font-body text-sm leading-5 font-bold tracking-[0.1px] text-divider">
                      {t("card.orConnector")}
                    </span>
                    <hr className="flex-1 border-t border-divider" />
                  </div>
                )}
                {/* mm:I313:8467;214:2541 */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <img src="/awards/license-icon.svg" alt="" width={24} height={24} />
                    <span className={labelClassName}>{t("card.prizeLabel")}</span>
                  </div>
                  <span className={bigClassName}>{prize.amount}</span>
                  {prize.qualifier && <span className={smallClassName}>{prize.qualifier}</span>}
                </div>
              </Fragment>
            ))}
          </div>
        </div>
      </div>
      {/* mm:I313:8467;214:2771 -- absent on D.6 (313:8510), which ends on its content */}
      {isLast ? null : <hr className="w-full border-t border-divider" />}
    </section>
  );
}
