import { useTranslations } from "next-intl";
import { IconLinkArrow } from "./icon-link-arrow";

/**
 * mms_D1_Sunkudos (3390:10349) -- promo card: label, title, description,
 * illustration and an inert 'Chi tiết' button (BR-008, Kudos page
 * deferred). MM_MEDIA_Kudos Background doubles as the block's cover image
 * (satisfies the "illustration" requirement) over its own #0F0F0F fill.
 * The decorative "KUDOS" logo lockup (329:2948) is exported as one flat
 * SVG this round and rendered as a background flourish, aria-hidden.
 *
 * The outer instance (3390:10349) is 1224px wide at x144 -- the same
 * standard column as Hero/Awards. The VISIBLE card is its child "SunKudos"
 * group (I3390:10349;313:8415), only 1120px wide, centered inside that
 * column (x196 = 144 + (1224-1120)/2) -- narrower than the grid, per the
 * design's own flex `alignItems:center, justifyContent:center` on the
 * outer frame. Two nested containers reproduce that: the standard 1224
 * column, then the narrower 1120 card centered within it.
 */
export function KudosPromo() {
  const t = useTranslations("home");
  return (
    // mm:3390:10349
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1224px] px-4">
        {/* mm:I3390:10349;313:8415 */}
        <div
          data-testid="kudos-promo"
          className="relative mx-auto flex w-full max-w-[1120px] items-center overflow-hidden rounded-2xl px-4 py-16 md:px-24 md:py-24"
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
            className="pointer-events-none absolute right-16 top-1/2 hidden w-[280px] -translate-y-1/2 opacity-80 lg:block"
          />

          {/* mm:I3390:10349;313:8419 */}
          <div className="relative z-[1] flex w-full max-w-[457px] flex-col gap-8">
            {/* mm:I3390:10349;313:8420 */}
            <div className="flex flex-col gap-4">
              {/* mm:I3390:10349;313:8421 */}
              <p className="font-body text-2xl font-bold text-white">{t("kudos.label")}</p>
              {/* mm:I3390:10349;313:8422 */}
              <h2 className="font-body text-[57px] font-bold leading-[64px] tracking-[-0.25px] text-gold">
                {t("kudos.title")}
              </h2>
              {/* mm:I3390:10349;313:8423 */}
              <p className="whitespace-pre-line text-justify font-body text-base font-bold tracking-[0.5px] text-white">
                {t("kudos.description")}
              </p>
            </div>

            {/* mm:I3390:10349;313:8426 */}
            <button
              type="button"
              data-testid="kudos-promo-detail"
              aria-disabled="true"
              tabIndex={-1}
              className="inline-flex w-fit cursor-default items-center gap-1 rounded-chip bg-gold px-4 py-4 font-body text-base font-bold text-canvas"
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
