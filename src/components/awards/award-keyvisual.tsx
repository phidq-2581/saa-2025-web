/**
 * mms_3_Keyvisual (313:8437 → "image 20" 2167:5138, 1440x547 at y80) plus the
 * Cover gradient (313:8439, 1440x627 from y0) of the Hệ thống giải frame.
 * Both are full-bleed layers behind the Bìa column -- the ROOT FURTHER
 * wordmark and the section title sit ON the artwork in the design, they do
 * not follow a hero block. Painted absolutely inside `<main>` so the flow
 * column above them can start at the frame's own y184.
 *
 * "image 20" carries no MM_MEDIA tag and no MoMorph download path, so it is
 * drawn as two background layers:
 *  1. `/awards/keyvisual-bg.png` -- the node exported from Figma by the user
 *     (clarifications.md 2026-09-03); a rendered node, so `cover`. Absent
 *     until exported, in which case the layer paints nothing.
 *  2. A reconstruction from the Homepage keyvisual export. All three
 *     keyvisuals are crops of one 1458x2012 master: this node shows it at
 *     natural size from master row 858.967 (`-0.163px -858.967px / 101.245%
 *     367.889%` on 1440x547), the Kudos board KV from row 909.862, and the
 *     Homepage export (1512x1392, `cover`) is the master scaled 1512/1458
 *     with its top edge at master row 334.86. Drawing that export back at
 *     1458px wide and offset -(858.967 - 334.86) reproduces this crop; the
 *     -18px / -4px correction was fitted against the Kudos board's exact
 *     export (mean pixel error 8.0/255, between a 1px and a 2px self-shift
 *     of that export), so the same registration is trusted here.
 * A CSS background rather than <img> so a missing layer degrades to the one
 * below, never to a broken image icon.
 */
export function AwardKeyvisual() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[627px] @container">
      {/* mm:2167:5138 -- 1440x547 at y80. Layer 2 is sized in container-width
          units so it scales exactly like `cover` of the 1440x547 node would:
          1458px → 101.25cqw, x -18.16px → -1.2611cqw, y -528.1px → -36.674cqw,
          plus the vertical centring `cover` applies once the box is wider than
          1440 (-(37.986cqw - 547px) / 2). At 1440 this is -18.16px / -528.1px. */}
      <div
        data-testid="award-keyvisual"
        className="absolute inset-x-0 top-20 h-[547px]"
        style={{
          backgroundImage: "url(/awards/keyvisual-bg.png), url(/home/hero-keyvisual-bg.png)",
          backgroundSize: "cover, 101.25cqw auto",
          backgroundPosition: "center, -1.2611cqw calc(273.5px - 55.667cqw)",
          backgroundRepeat: "no-repeat, no-repeat",
        }}
      />
      {/* mm:313:8439 -- Cover 1440x627 at y0 */}
      <div
        className="absolute inset-x-0 top-0 h-[627px]"
        style={{ background: "linear-gradient(0deg, #00101A -4.23%, rgba(0, 19, 32, 0.00) 52.79%)" }}
      />
    </div>
  );
}
