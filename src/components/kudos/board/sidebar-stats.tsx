"use client";

import { useTranslations } from "next-intl";
import type { SidebarStatsView } from "./kudos-board-types";

/**
 * D.1_Thống kê tổng quat (2940:13489, MaZUn5xHXZ). 5 concrete D.1.x stat
 * rows (2940:13491/13492/3241:14882/13495/13496, all `justify-content:
 * space-between` -- label left, gold number right per the actual X
 * coordinates, not the parent D description's paraphrase) + a 1px divider
 * (2940:13494) before the last two rows + the disabled "Mở Secret Box"
 * button (2940:13497).
 *
 * KNOWN GAP: the RED spec's `sidebar-stat-line` count is 6; only 5 rows
 * exist as real nodes under 2940:13488 (the D section's own description
 * text says "6 dòng số liệu" but the 6th is never itemized -- see the
 * phase-04 prompt's "KNOWN DESIGN GAP" and this delivery's report). This
 * renders exactly 5 -- no invented 6th row.
 */
export type SidebarStatsProps = {
  stats: SidebarStatsView;
};

export function SidebarStats({ stats }: SidebarStatsProps) {
  const t = useTranslations("kudos");

  const topRows = [
    { key: "received", label: t("sidebar.kudosReceived"), value: stats.kudosReceivedCount },
    { key: "sent", label: t("sidebar.kudosSent"), value: stats.kudosSentCount },
    {
      key: "hearts",
      label: t("sidebar.heartsReceived"),
      value: stats.heartsReceivedCount,
      showX2: stats.heartsDoubled,
    },
  ];
  const bottomRows = [
    { key: "secretOpened", label: t("sidebar.secretBoxOpened"), value: stats.secretBoxOpenedCount },
    { key: "secretUnopened", label: t("sidebar.secretBoxUnopened"), value: stats.secretBoxUnopenedCount },
  ];

  return (
    // mm:2940:13489
    <div className="flex w-full flex-col items-start gap-2.5 rounded-[17px] border border-border-gold bg-panel p-6">
      {/* mm:2940:13490 */}
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {topRows.map((row) => (
          <StatLine key={row.key} label={row.label} value={row.value} showX2={row.showX2} />
        ))}
        {/* mm:2940:13494 */}
        <div className="h-px w-full bg-divider" />
        {bottomRows.map((row) => (
          <StatLine key={row.key} label={row.label} value={row.value} />
        ))}
        <OpenGiftButton />
      </div>
    </div>
  );
}

function StatLine({ label, value, showX2 }: { label: string; value: number; showX2?: boolean }) {
  return (
    // mm:2940:13491
    <div data-testid="sidebar-stat-line" className="flex w-full items-center justify-between gap-2">
      <span className="font-body text-[22px] font-bold leading-7 text-white">{label}</span>
      <span className="flex items-center gap-1">
        {showX2 && (
          // mm:3241:14931
          <span
            aria-hidden="true"
            style={{ WebkitTextStroke: "1.04px #000" }}
            className="flex h-10 w-[34px] items-center justify-center font-body text-[17.5px] font-bold text-white"
          >
            x2
          </span>
        )}
        <span className="font-body text-[32px] font-bold leading-10 text-gold">{value}</span>
      </span>
    </div>
  );
}

function OpenGiftButton() {
  const t = useTranslations("kudos");
  return (
    // mm:2940:13497
    <div className="group relative w-full">
      <button
        type="button"
        disabled
        data-testid="sidebar-open-gift-btn"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-gold p-4 font-body text-[22px] font-bold leading-7 text-canvas disabled:cursor-not-allowed"
      >
        {/* mm:I2940:13497;186:1766 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M22.5 10.3698L19.76 8.77984C20 8.56984 20.23 8.29984 20.4 7.99984C21.23 6.56984 20.74 4.72984 19.3 3.89984C18.44 3.39984 17.43 3.39984 16.58 3.75984L16.59 3.74984L15.71 4.13984L15.6 3.17984L15.59 3.18984C15.5 2.27984 14.97 1.39984 14.11 0.899841C12.67 0.0748415 10.84 0.569842 10 1.99984C9.83 2.29984 9.72 2.62984 9.66 2.94984L6.91 1.36984C5.95 0.819842 4.73 1.13984 4.18 2.09984L2.68 4.69984C2.4 5.17984 2.57 5.78984 3.05 6.05984L4.78 7.05984L9 9.49984H2.5V19.4998C2.5 20.6098 3.4 21.4998 4.5 21.4998H20.5C21.61 21.4998 22.5 20.6098 22.5 19.4998V14.3698L23.23 13.0998C23.78 12.1398 23.46 10.9198 22.5 10.3698ZM16.94 5.99984C17.21 5.49984 17.83 5.35984 18.3 5.62984C18.78 5.90984 18.95 6.49984 18.67 6.99984C18.39 7.49984 17.78 7.63984 17.3 7.36984C16.83 7.08984 16.66 6.49984 16.94 5.99984ZM14.57 8.09984L21.5 12.0998L20.5 13.8298L13.57 9.82984L14.57 8.09984ZM11.5 19.4998H4.5V11.4998H11.5V19.4998ZM11.84 8.82984L4.91 4.82984L5.91 3.09984L12.84 7.09984L11.84 8.82984ZM12.11 4.36984C11.63 4.08984 11.47 3.49984 11.74 2.99984C12 2.49984 12.63 2.35984 13.11 2.62984C13.59 2.90984 13.75 3.49984 13.47 3.99984C13.2 4.49984 12.59 4.63984 12.11 4.36984ZM13.5 19.4998V12.0998L20.5 16.1398V19.4998H13.5Z"
            fill="currentColor"
          />
        </svg>
        {/* mm:I2940:13497;186:1568 */}
        <span>{t("sidebar.openGift")}</span>
      </button>
      {/* Sắp ra mắt tooltip -- CSS-only group-hover so it fires even though
          the trigger button itself is disabled (native mouse events on a
          disabled button are unreliable across browsers; :hover is not). */}
      <div
        role="tooltip"
        data-testid="sidebar-open-gift-tooltip"
        className="pointer-events-none absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-chip border border-border-gold bg-panel px-3 py-1.5 font-body text-sm text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        {t("sidebar.openGiftTooltip")}
      </div>
    </div>
  );
}
