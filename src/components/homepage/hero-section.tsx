import heroCopy from "../../../messages/vi/home.json";
import { EventCountdown, type CountdownRemaining } from "./event-countdown";
import { EventInfo } from "./event-info";
import { IconLinkArrow } from "./icon-link-arrow";

type HeroSectionProps = {
  remaining: CountdownRemaining;
};

/**
 * 3.5 Keyvisual (2167:9027) + Cover (2167:9029) + Frame 487 (2167:9031):
 * hero keyvisual with gradient cover, ROOT FURTHER wordmark, countdown,
 * event info and the B3 CTA pair. The wordmark (2788:12911) is a graphic
 * asset -- rendered as a decorative image (alt="") plus a visually-hidden
 * `<h1>` carrying the same literal text so the region stays an accessible
 * heading and satisfies the screen-reader/E2E text contract without a
 * duplicate announcement.
 *
 * Keyvisual BG (2167:9028) is 1512x1392 and Cover (2167:9029) 1512x1480 --
 * both taller than the hero content's own flow height (Frame 487 is only
 * 595px, y184-779) so they bleed ~500-600px into the top of
 * RootFurtherBlock (which starts at y899 and has no opaque background of
 * its own), matching the design's photo-behind-the-ROOT/FURTHER-wordmark
 * treatment. Rendered with explicit heights (not `inset-0`/h-full) and
 * `overflow-visible` on the section so they can overflow the section's own
 * auto-height box without adding to document flow height.
 *
 * Content column: Frame 487 itself is exactly 1224px wide starting at
 * x144 -- the same left edge as the header logo (site-header.tsx's
 * `md:px-36` = 144px on a full-bleed bar). `max-w-[1224px] mx-auto`
 * reproduces that at the 1512px design width without double-applying the
 * 144px as both a max-width AND extra padding (the bug this fix corrects).
 */
export function HeroSection({ remaining }: HeroSectionProps) {
  return (
    // mm:2167:9030
    <section data-testid="hero-section" className="relative w-full overflow-visible">
      {/* mm:2167:9028 */}
      <img
        src="/home/hero-keyvisual-bg.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[1392px] w-full object-cover"
      />
      {/* mm:2167:9029 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1480px]"
        style={{
          background:
            "linear-gradient(12deg, #00101A 23.7%, rgba(0, 18, 29, 0.46) 38.34%, rgba(0, 19, 32, 0.00) 48.92%)",
        }}
      />

      {/* mm:2167:9031 */}
      <div className="relative z-[1] mx-auto flex w-full max-w-[1224px] flex-col gap-10 px-4 pt-[184px] pb-0 md:px-0">
        {/* mm:2167:9032 */}
        <h1 className="flex flex-col gap-2.5">
          {/* mm:2788:12911 */}
          <img
            src="/home/hero-root-further-logo.png"
            alt=""
            aria-hidden="true"
            width={451}
            height={200}
            className="h-auto w-[451px] max-w-full"
          />
          <span className="sr-only">{heroCopy.hero.titleSr}</span>
        </h1>

        {/* mm:2167:9034 */}
        <div className="flex flex-col gap-4">
          <EventCountdown remaining={remaining} />
          <EventInfo />
        </div>

        {/* mm:2167:9062 */}
        <div className="flex flex-wrap gap-10">
          {/* mm:2167:9063 */}
          <a
            data-testid="cta-about-awards"
            href="/he-thong-giai"
            className="flex items-center gap-1 rounded-panel bg-gold px-6 py-4 font-body text-[22px] font-bold leading-7 text-canvas transition-colors hover:bg-gold/90"
          >
            {heroCopy.hero.ctaAboutAwards}
            <IconLinkArrow className="h-6 w-6" />
          </a>
          {/* mm:2167:9064 */}
          {/* Deferred destination (clarifications): inert control, same pattern as award-kudos-banner */}
          <button
            type="button"
            data-testid="cta-about-kudos"
            aria-disabled="true"
            tabIndex={-1}
            className="flex cursor-default items-center gap-1 rounded-panel border border-border-gold bg-gold-10 px-6 py-4 font-body text-[22px] font-bold leading-7 text-white"
          >
            {heroCopy.hero.ctaAboutKudos}
            <IconLinkArrow className="h-6 w-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
