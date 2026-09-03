import { useTranslations } from "next-intl";
import type { CampaignWindow } from "@/lib/kudos/derive/campaign-window";
import { formatCampaignBoundary } from "@/lib/kudos/derive/campaign-window";

/**
 * "Hover campain" (MoMorph gI07KYVJWE, frame 3241:15021): a 368x130 card on
 * var(--Details-Container-2, #00070C), radius 16, padding 16, holding a row
 * (gap 11) of the 56x66 "x2" fire art (Group 435: untagged "image 35" plus
 * the 29.158px/700 "x2" label -- MoMorph has no export for it, so the group
 * was hand-exported at 2x, label included, to /kudos-board/campaign-x2.png
 * and rendered as one image) and a 276px 14px/700/20px 0.1px text. MoMorph flattens
 * the text to var(--Details-Text-Secondary-2, #999); the canvas paints the
 * first sentence white and the rest grey, and the "XX:XX ngày XX/12"
 * placeholders are the real special-day window (campaign-window.ts).
 * Shown via the marker's `group-hover` / `group-focus-within`.
 */
export function CampaignTooltip({ campaign }: { campaign: CampaignWindow }) {
  const t = useTranslations("kudos");
  return (
    // mm:3241:15021
    <span
      role="tooltip"
      data-testid="sidebar-campaign-tooltip"
      className="pointer-events-none absolute bottom-full right-0 z-10 mb-1 flex w-[368px] min-h-[130px] flex-col items-center justify-center rounded-2xl bg-panel p-4 text-left opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
    >
      {/* mm:3241:15022 */}
      <span className="flex w-full items-start gap-[11px]">
        {/* mm:3241:15030 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/kudos-board/campaign-x2.png"
          alt=""
          width={56}
          height={66}
          className="h-[66px] w-14 shrink-0 object-contain"
        />
        {/* mm:3241:15024 */}
        <span className="w-[276px] font-body text-sm leading-5 font-bold tracking-[0.1px] text-[#999999]">
          <span className="block text-white">{t("sidebar.campaignTitle")}</span>
          {t("sidebar.campaignBody", {
            start: formatCampaignBoundary(campaign.start, "start"),
            end: formatCampaignBoundary(campaign.end, "end"),
          })}
        </span>
      </span>
    </span>
  );
}
