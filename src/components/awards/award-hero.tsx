import { useTranslations } from "next-intl";

/**
 * KV (313:8450) -- the first Bìa child of the Hệ thống giải frame: a 1152px
 * row holding only the 338x150 ROOT FURTHER wordmark (2789:12915) at
 * y184, i.e. 96px under the 88px header offset. The keyvisual artwork it
 * sits on is not this component's concern -- `award-keyvisual.tsx` paints
 * it behind the whole column -- so this is an in-flow block, not a hero
 * band with its own height. The visible wordmark is decorative; the
 * heading and eyebrow stay as visually-hidden text for the accessibility
 * tree and the E2E text contract.
 */
export function AwardHero() {
  const t = useTranslations("awards");
  return (
    // mm:313:8450
    <section data-testid="award-hero" className="flex w-full flex-col gap-10">
      {/* mm:2789:12915 */}
      <img
        src="/awards/root-further-logo.png"
        alt={t("hero.logoAlt")}
        width={338}
        height={150}
        className="h-[150px] w-[338px] max-w-full"
      />
      <h1 className="sr-only">{t("hero.title")}</h1>
      <p className="sr-only">{t("hero.subtitle")}</p>
    </section>
  );
}
