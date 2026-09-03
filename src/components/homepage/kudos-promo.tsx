import { useTranslations } from "next-intl";
import { IconLinkArrow } from "./icon-link-arrow";

/**
 * mms_D1_Sunkudos (3390:10349) -- promo card: label, title, description,
 * illustration and an inert 'Chi tiết' button (BR-008, Kudos page
 * deferred). MM_MEDIA_Kudos Background (1120x500, exported at its rendered
 * crop) doubles as the block's cover image (satisfies the "illustration"
 * requirement) over its own #0F0F0F fill. The decorative "KUDOS" logo
 * lockup (329:2948, 364px wide) is exported as one flat SVG and rendered as
 * a background flourish, aria-hidden, at the node's own offset inside the
 * card (x868 -> 84px from the card's right edge, y3926 -> 215px from its top).
 *
 * The outer instance (3390:10349) is 1224px wide at x144 -- the same
 * standard column as Hero/Awards -- and sits 120px below the awards block
 * and 124px above the footer (Bìa's 96px bottom padding + the 28px gap to
 * 5001:14800). The VISIBLE card is its child "SunKudos" group
 * (I3390:10349;313:8415), 1120x500 with 16px radius, centered inside that
 * column (x196 = 144 + (1224-1120)/2). Content (mms_D2, 457 wide) starts
 * 64px in from the card's left edge and is vertically centered; inside it
 * label/title/description are 16px apart and the button 32px below
 * (313:8420 gap 16, 313:8419 gap 32). Button 313:8426: padding 16, 8px gap
 * between the 16px/700/24px label (0.15px letter-spacing) and the arrow.
 */
export function KudosPromo() {
  const t = useTranslations("home");
  return (
    // mm:3390:10349
    <section className="w-full">
      <div className="mx-auto mt-[120px] mb-[124px] w-full max-w-[1224px] px-4">
        {/* mm:I3390:10349;313:8415 */}
        <div
          data-testid="kudos-promo"
          className="relative mx-auto flex h-[500px] w-full max-w-[1120px] items-center overflow-hidden rounded-2xl pl-4 md:pl-16"
          style={{ backgroundColor: "#0F0F0F" }}
        >
          {/* mm:I3390:10349;313:8416 */}
          <img
            src="/home/kudos-illustration.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* mm:I3390:10349;329:2948 */}
          <img
            src="/home/kudos-logo-lockup.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-[84px] top-[215px] hidden w-[364px] lg:block"
          />

          {/* mm:I3390:10349;313:8419 */}
          <div className="relative z-[1] flex w-full max-w-[457px] flex-col gap-8">
            {/* mm:I3390:10349;313:8420 */}
            <div className="flex flex-col gap-4">
              {/* mm:I3390:10349;313:8421 */}
              <p className="font-body text-2xl font-bold leading-8 text-white">{t("kudos.label")}</p>
              {/* mm:I3390:10349;313:8422 */}
              <h2 className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
                {t("kudos.title")}
              </h2>
              {/* mm:I3390:10349;313:8423 */}
              <p className="whitespace-pre-line text-justify font-body text-base font-bold leading-6 tracking-[0.5px] text-white">
                {t("kudos.description")}
              </p>
            </div>

            {/* mm:I3390:10349;313:8426 */}
            <button
              type="button"
              data-testid="kudos-promo-detail"
              aria-disabled="true"
              tabIndex={-1}
              className="inline-flex w-fit cursor-default items-center gap-2 rounded-chip bg-gold p-4 font-body text-base font-bold leading-6 tracking-[0.15px] text-canvas"
            >
              {t("kudos.detailLink")}
              <IconLinkArrow className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
