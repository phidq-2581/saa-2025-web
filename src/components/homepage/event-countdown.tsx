import { useTranslations } from "next-intl";

export type CountdownRemaining = {
  days: string;
  hours: string;
  minutes: string;
  reached: boolean;
};

type TileProps = {
  testId: string;
  value: string;
  label: string;
};

/**
 * mms_B1.3.1-3_Days/Hours/Minutes (2167:9038/9043/9048) -- each unit is a
 * column (gap 14) of two digit tiles (gap 14) over a 24px/700/32px label.
 * Tile = Rectangle 1 (186:2616): 51.2x81.92px, radius 8, 0.5px
 * var(--Details-Text-Primary-1, #FFEA9E) border, gradient #FFF -> 10% white,
 * the whole rectangle at 50% opacity, backdrop blur 16.64px. The digit
 * (186:2617) is a sibling of that rectangle, not a child, so it stays fully
 * opaque -- reproduced by pre-multiplying the 50% into the border/gradient
 * colours instead of putting `opacity` on the tile that holds the digit.
 * Digit face: design "Digital Numbers" 49.152px/400 -> "DSEG7 Classic" per
 * clarifications.md 2026-09-03 (`font-digital`, fonts.ts).
 */
function CountdownTile({ testId, value, label }: TileProps) {
  const digits = value.padStart(2, "0").slice(-2).split("");
  return (
    // mm:2167:9038
    <div data-testid={testId} className="flex flex-col items-start gap-3.5">
      <div className="flex gap-3.5">
        {digits.map((digit, index) => (
          <span
            key={index}
            className="flex h-[81.92px] w-[51.2px] items-center justify-center rounded-panel border font-digital text-[49.152px] font-normal leading-none text-white"
            style={{
              borderColor: "rgba(255, 234, 158, 0.5)",
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.05) 100%)",
              backdropFilter: "blur(16.64px)",
            }}
          >
            {digit}
          </span>
        ))}
      </div>
      {/* mm:2167:9042 */}
      <span className="font-body text-2xl font-bold leading-8 text-white">{label}</span>
    </div>
  );
}

/**
 * mms_B1_Countdown time (2167:9035): "Coming soon" label (24px/700/32px)
 * then, 16px below, the three units 40px apart (2167:9037). Server
 * placeholder is `00/00/00` with `reached: false` (BR-005); Phase 07 wires
 * the live tick from `useCountdown` and passes the computed `remaining` in,
 * so this component itself never touches the clock.
 */
export function EventCountdown({ remaining }: { remaining: CountdownRemaining }) {
  const t = useTranslations("home");
  const { days, hours, minutes, reached } = remaining;
  return (
    <div className="flex flex-col gap-4">
      {!reached ? (
        // mm:2167:9036
        <p data-testid="coming-soon-label" className="font-body text-2xl font-bold leading-8 text-white">
          {t("hero.comingSoon")}
        </p>
      ) : null}
      {/* mm:2167:9037 */}
      <div
        className="flex flex-wrap items-center gap-10"
        aria-live="polite"
        aria-atomic="true"
      >
        <CountdownTile testId="countdown-days" value={days} label={t("countdown.days")} />
        <CountdownTile testId="countdown-hours" value={hours} label={t("countdown.hours")} />
        <CountdownTile testId="countdown-minutes" value={minutes} label={t("countdown.minutes")} />
      </div>
    </div>
  );
}
