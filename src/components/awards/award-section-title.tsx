import awards from "../../../messages/vi/awards.json";

/**
 * Section title (MoMorph item A, `mms_A_Title hệ thống giải thưởng`,
 * 313:8453). Sizes from `get_node`: eyebrow 313:8454 fontSize 24/weight
 * 700/lineHeight 32, heading 313:8457 fontSize 57/weight 700/lineHeight
 * 64/color rgba(255,234,158,1) = --color-gold. Eyebrow text rendered as
 * "Sun* annual awards 2025" (lowercase) per specs.csv row A's quoted
 * copy and the RED test -- the raw TEXT node's `character` field returns
 * Title Case ("Sun* Annual Awards 2025"); see report Concerns for this
 * node-vs-spec casing discrepancy.
 *
 * Container width fix (Phase 06 typography pass): the artboard/frame is
 * 1440px wide with `md:px-36` (144px/side) side padding, giving a 1152px
 * inner content width that matches the eyebrow's own text-box width
 * (313:8454, x144-1296). The heading (313:8457, x254-1185) is 931px wide
 * and needs that full 1152px to render on ONE line per spec -- a
 * `max-w-[1152px]` wrapper combined with the same `md:px-36` padding was
 * double-subtracting the padding (864px effective), which wrapped the
 * heading to two lines. `max-w-[1440px]` matches the artboard basis.
 */
export function AwardSectionTitle() {
  return (
    <div
      data-testid="award-section-title"
      className="mx-auto flex w-full max-w-360 flex-col gap-4 px-4 pt-20 md:px-36"
    >
      <p className="text-center text-2xl leading-8 font-bold text-white">
        {awards.sectionTitle.eyebrow}
      </p>
      <h2 className="font-heading text-left text-[40px] leading-12 font-bold tracking-[-0.25px] text-gold md:text-[57px] md:leading-16">
        {awards.sectionTitle.heading}
      </h2>
    </div>
  );
}
