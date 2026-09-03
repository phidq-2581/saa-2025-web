import { useTranslations } from "next-intl";
import { IconLinkArrow } from "./icon-link-arrow";

export type AwardCardProps = {
  slug: string;
  title: string;
  description?: string;
  badgeSrc: string;
  badgeWidth: number;
  badgeHeight: number;
  href: string;
};

/**
 * mms_C2.1-C2.6 Award (214:1032 instances): a 336px column, `gap: 24px`
 * between the 336x336 thumbnail and the text block (Frame 490, gap 4).
 * Thumbnail is a shared texture (MM_MEDIA_Award BG, identical file across
 * all 6 cards, exported at its rendered 336x336 crop) with a
 * category-specific wordmark badge centered over it -- the Picture-Award
 * node is itself a flex container (`align-items:center,
 * justify-content:center`) so centering the badge needs no per-card
 * offset math (code-rules 3, auto-layout -> flex). Border-radius 24px ==
 * Tailwind's default `rounded-3xl`; glow shadow reuses `--shadow-glow-gold`
 * (same value as the account-menu active-row glow, phase-02 token).
 * Text: 24px/400/32px gold title, 16px/400/24px description with 0.5px
 * letter-spacing (as many lines as the copy needs -- the canvas shows
 * three on "Top Project"; the spec CSV's 2-line clamp is superseded per
 * clarifications.md 2026-09-03), then the 56px "Chi tiết" button
 * (214:1023: padding 16px 0, 16px/500/24px label with 0.15px
 * letter-spacing, 4px gap to the 24px arrow).
 *
 * Per BR-006, thumbnail/title/'Chi tiết' all navigate to the same
 * `/he-thong-giai#{slug}` target -- implemented as ONE `<a>` wrapping the
 * whole card body (not three separate links), matching the RED contract's
 * single-anchor selectors in e2e/homepage.spec.ts.
 */
export function AwardCard({
  slug,
  title,
  description,
  badgeSrc,
  badgeWidth,
  badgeHeight,
  href,
}: AwardCardProps) {
  const t = useTranslations("home");
  return (
    // mm:2167:9075
    <article data-testid="award-card" data-slug={slug} className="group w-full">
      <a href={href} className="flex w-full flex-col gap-6">
        {/* mm:I2167:9075;214:1019 */}
        <span className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl border border-gold shadow-[var(--shadow-glow-gold)] transition-transform duration-200 group-hover:-translate-y-1">
          {/* mm:I2167:9075;214:1019;81:2442 */}
          <img
            src="/home/award-card-bg.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* mm:I2167:9075;214:1019;214:666 */}
          <img
            src={badgeSrc}
            alt=""
            width={badgeWidth}
            height={badgeHeight}
            className="relative z-[1] max-w-[70%]"
          />
        </span>

        {/* mm:I2167:9075;214:1020 */}
        <span className="flex flex-col gap-1">
          {/* mm:I2167:9075;214:1021 */}
          <span className="font-body text-2xl leading-8 text-gold">{title}</span>
          {description ? (
            // mm:I2167:9075;214:1022
            <span className="font-body text-base leading-6 tracking-[0.5px] text-white">
              {description}
            </span>
          ) : null}
          {/* mm:I2167:9075;214:1023 */}
          <span className="inline-flex w-fit items-center gap-1 py-4 font-body text-base font-medium leading-6 tracking-[0.15px] text-white">
            {t("awards.detailLink")}
            <IconLinkArrow className="h-6 w-6" />
          </span>
        </span>
      </a>
    </article>
  );
}
