import { useTranslations } from "next-intl";

/**
 * Keyvisual hero (MoMorph item 3, `mms_3_Keyvisual`). specs.csv row 3
 * describes a single flattened background photo (1200x871 per the
 * description; the actual node `2167:5138` renders at 1440x547) with the
 * title "ROOT FURTHER" and subtitle "Sun* Annual Award 2025" baked into the
 * artwork -- neither string is a separate Figma TEXT node (query_by_type
 * confirms no text node exists in this item's subtree). The background
 * photo itself has no `mm_media_*` export (list_media_nodes: 35 assets, none
 * covering `2167:5138`), so this renders the "Cover" node's own linear
 * gradient (`313:8439`, canvas navy fading to transparent) as the documented
 * fallback fill and exposes the baked-in copy as real text so it stays
 * screen-reader visible -- see report Concerns for this asset gap.
 */
export function AwardHero() {
  const t = useTranslations("awards");
  return (
    <section
      data-testid="award-hero"
      className="relative flex h-[420px] w-full items-end overflow-hidden bg-canvas md:h-[547px]"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/40 to-transparent"
      />
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-4 pb-12 md:px-36">
        <img
          src="/awards/root-further-logo.png"
          alt={t("hero.logoAlt")}
          width={338}
          height={150}
          className="h-auto w-[220px] md:w-[338px]"
        />
        <h1 className="sr-only">{t("hero.title")}</h1>
        <p className="sr-only">{t("hero.subtitle")}</p>
      </div>
    </section>
  );
}
