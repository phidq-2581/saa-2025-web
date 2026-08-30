import { useTranslations } from "next-intl";

type AwardInfoCardProps = {
  slug: string;
  index: number;
};

/**
 * Shape of one `cardContent.<slug>` entry in `messages/<locale>/awards.json`.
 * `t.raw()` returns the raw catalog value untyped (next-intl does not
 * narrow nested message shapes), so this asserts the known JSON structure
 * rather than leaving it as an unchecked `any` at the call site below.
 */
type CardPrize = { amount: string; qualifier: string | null };
type CardContent = {
  title: string;
  description: string;
  quantityValue: string;
  quantityUnit: string;
  prizes: CardPrize[];
};

/**
 * Award card (MoMorph D.1-D.6, `mms_D.1_...` info_block instances,
 * `313:8467`/`313:8468`/`313:8469`/`313:8470`/`313:8471`/`313:8510`).
 *
 * All title/description/quantity/prize text below is each card's own
 * `character` field read via `get_node`/`query_section` -- NOT the
 * `itemName` layer label, which for a component instance stays whatever
 * the master component was last named (e.g. every D.2/D.3/D.4/D.6 layer
 * still reads "Top Talent") and does not reflect a per-instance text
 * override. `awards.cardContent[slug]` in `messages/vi/awards.json`
 * holds the verified `character` values; `AWARD_CATEGORIES` (Phase 02)
 * is used only for the slug/order this component is mapped over, never
 * for card copy.
 *
 * Image box 336x336 with 24px radius (`mm_media_Award-Thumb-Background`,
 * one shared texture across all six). Layered on top is a per-card name
 * badge -- confirmed via `get_node` on each instance's own image child
 * (`mm_media_Award-Name-Top-Project` / `-Top-Project-Leader` /
 * `-Best-Manager` / `-Signature-2025-Creator` / `-MVP`, each a distinct
 * componentId/child fill, so these are genuinely different per-card
 * assets, not a duplicate). `get_media_files` returns `null` for five of
 * the six on this screen (export settings missing on the instance
 * override), so this reuses the Homepage screen's badge exports
 * (`public/home/award-badge-{slug}.png`, same design system, already
 * pulled from MoMorph this session) rather than leaving five cards
 * badgeless.
 *
 * Zigzag: card index 0/2/4 (Top Talent, Top Project Leader, Signature)
 * use component `214:2554` / the plain D.5 frame with the image child
 * first (image left, content right); index 1/3/5 (Top Project, Best
 * Manager, MVP) use component `214:2646` with content first (content
 * left, image right) -- confirmed per-card by each instance's own child
 * order and x-position, alternates cleanly by index parity. Mobile
 * always stacks image above content.
 *
 * Typography/sizing pass (Phase 06 correction, values from `get_node` on
 * the Top Talent card): title 24/700/lh32 gold (`I313:8468;214:2622`);
 * description 16/700/lh24/ls0.5px/justify, width 480px, white
 * (`I313:8468;214:2623`); quantity label 24/700/lh32 gold + number
 * 36/700/lh44 white + unit 14/700/lh20/ls0.1px white on ONE row, icon to
 * label gap 16px, label to number-group gap 16px, number to unit gap 8px
 * (`I313:8467;214:2536/2538/3532`); prize label 24/700/lh32 gold on its
 * OWN row, amount 36/700/lh44 white on the next row (content-edge
 * aligned, no icon indent), qualifier 14/700/lh20/ls0.1px white on the
 * row below that, each row 16px apart (`I313:8467;214:2544/2546/2547`);
 * "Hoặc" connector between two prize blocks 14/700/lh20/ls0.1px,
 * `--color-divider` (`313:8499`), 32px above and below. Vertical rhythm
 * (description end -> quantity row -> prize label row, each 64px apart)
 * drives the card from ~400px tall to the ~700px the reference shows.
 */
export function AwardInfoCard({ slug, index }: AwardInfoCardProps) {
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

  return (
    <section
      id={slug}
      data-testid="award-info-card"
      data-slug={slug}
      className={`scroll-mt-24 flex flex-col gap-8 py-8 md:flex-row md:gap-10 ${
        imageOnRight ? "md:flex-row-reverse" : ""
      }`}
    >
      <div className="relative flex h-55 w-55 shrink-0 items-center justify-center self-center overflow-hidden rounded-3xl border border-gold shadow-(--shadow-glow-gold) md:h-84 md:w-84">
        <img
          src="/awards/award-thumb-bg.png"
          alt=""
          width={336}
          height={336}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <img
          src={`/home/award-badge-${slug}.png`}
          alt=""
          className="relative z-1 max-w-[70%]"
        />
      </div>
      <div className="flex flex-1 flex-col gap-16 rounded-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <img src="/awards/target-icon.svg" alt="" width={24} height={24} />
            <h3 className="text-2xl leading-8 font-bold text-gold">{content.title}</h3>
          </div>
          <p className="w-full text-justify text-base leading-6 font-bold tracking-[0.5px] text-white md:w-120">
            {content.description}
          </p>
        </div>
        <div className="flex flex-col gap-16">
          <div className="flex items-center gap-4">
            <img src="/awards/diamond-icon.svg" alt="" width={24} height={24} />
            <span className="text-2xl leading-8 font-bold text-gold">
              {t("card.quantityLabel")}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-4xl leading-11 font-bold text-white">
                {content.quantityValue}
              </span>
              <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
                {content.quantityUnit}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            {content.prizes.map((prize, prizeIndex) => (
              <div key={prize.amount} className="flex flex-col gap-8">
                {prizeIndex > 0 && (
                  <p className="pl-8 text-sm leading-5 font-bold tracking-[0.1px] text-divider">
                    {t("card.orConnector")}
                  </p>
                )}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <img src="/awards/license-icon.svg" alt="" width={24} height={24} />
                    <span className="text-2xl leading-8 font-bold text-gold">
                      {t("card.prizeLabel")}
                    </span>
                  </div>
                  <span className="text-4xl leading-11 font-bold text-white">
                    {prize.amount}
                  </span>
                  {prize.qualifier && (
                    <span className="text-sm leading-5 font-bold tracking-[0.1px] text-white">
                      {prize.qualifier}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
