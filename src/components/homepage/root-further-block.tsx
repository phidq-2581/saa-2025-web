import { useTranslations } from "next-intl";

/**
 * Frame 486 (3204:10152): Root Further theme description. Node position
 * (x180-1332, y899-2118) gives a 1152px-wide column narrower than the
 * standard 1224px column used by Hero/Awards/Kudos -- centered separately
 * ((1512-1152)/2 = 180, matching the node's own startX). The node's
 * `padding: 120px 104px` style does NOT hold horizontally: the paragraph
 * TEXT nodes (3204:10156/10162) report their own width as the full
 * 1152px, same as the parent frame, not 1152-2*104 -- so the 104px is not
 * an additional inset on top of the 1152 column.
 *
 * Vertical rhythm: Bìa's auto-layout puts Frame 486 120px below the hero
 * (779 -> 899) and 120px above the awards block (2118 -> 2238), but the
 * frame's own children sit outside that box -- the ROOT/FURTHER wordmark
 * group (3204:10153) at y881-1015 and the text group (5001:14827) at
 * y1047-2137. Reproduced in-flow as 102px top (881-779), 32px gaps (the
 * frame's `gap`), and 101px bottom (2238-2137) -- identical pixels at the
 * 1512 canvas width without absolute positioning. The quote TEXT node
 * (3204:10161) is 66px tall in Figma (20px/700 on a 32px line, two lines),
 * so it carries that explicit height to keep paragraph 2 at y1689.
 */
export function RootFurtherBlock() {
  const t = useTranslations("home");
  return (
    // mm:3204:10152
    <section data-testid="root-further-block" className="w-full">
      <div className="mx-auto flex w-full max-w-[1152px] flex-col items-center gap-8 px-4 pt-[102px] pb-[101px] md:px-0">
        {/* mm:3204:10153 */}
        <div aria-hidden="true" className="relative hidden h-[134px] w-[290px] sm:block">
          {/* mm:3204:10155 */}
          <img
            src="/home/root-further-root-text.png"
            alt=""
            className="absolute left-[51px] top-0 h-[67px] w-[189px]"
          />
          {/* mm:3204:10154 */}
          <img
            src="/home/root-further-further-text.png"
            alt=""
            className="absolute left-0 top-[67px] h-[67px] w-[290px]"
          />
        </div>

        {/* mm:5001:14827 */}
        <div className="flex w-full flex-col gap-8">
          {/* mm:3204:10156 */}
          <p className="whitespace-pre-line text-justify font-body text-2xl font-bold leading-8 text-white">
            {t("rootFurther.paragraph1")}
          </p>
          {/* mm:3204:10161 */}
          <p className="h-[66px] whitespace-pre-line text-center font-body text-xl font-bold leading-8 text-white">
            {t("rootFurther.quote")}
            <br />
            {t("rootFurther.quoteTranslation")}
          </p>
          {/* mm:3204:10162 */}
          <p className="whitespace-pre-line text-justify font-body text-2xl font-bold leading-8 text-white">
            {t("rootFurther.paragraph2")}
          </p>
        </div>
      </div>
    </section>
  );
}
