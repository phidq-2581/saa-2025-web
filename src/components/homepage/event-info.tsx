import { useTranslations } from "next-intl";

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    // Group 417/418: 16px/700/24px label, 4px, 24px/700/32px gold value
    <div className="flex items-center gap-1">
      {/* mm:2167:9056 */}
      <span className="font-body text-base font-bold leading-6 tracking-[0.15px] text-white">
        {label}
      </span>
      {/* mm:2167:9057 */}
      <span className="font-body text-2xl font-bold leading-8 text-gold">{value}</span>
    </div>
  );
}

/**
 * mms_B2_Thông tin sự kiện (2167:9053): a 60px-gapped row of the two
 * label/value pairs (Frame 522), then 8px below, the 16px/700/24px
 * livestream note with 0.5px letter-spacing (2167:9061).
 *
 * Copy: the Figma canvas (`character` fields 2167:9057/9059/9061 --
 * "26/12/2025" / "Âu Cơ Art Center" / "Tường thuật trực tiếp qua sóng
 * Livestream") and the older spec CSV row B2 ("18h30" / "Nhà hát nghệ
 * thuật quân đội" / "... tại Group Facebook Sun* Family") disagree;
 * clarifications.md 2026-09-03 makes the canvas authoritative, so
 * messages/*\/home.json carry the canvas text.
 */
export function EventInfo() {
  const t = useTranslations("home");
  return (
    // mm:2167:9053
    <div data-testid="event-info" className="flex flex-col gap-2">
      {/* mm:2167:9054 */}
      <div className="flex flex-wrap items-center gap-[60px]">
        <InfoRow label={t("eventInfo.timeLabel")} value={t("eventInfo.time")} />
        <InfoRow label={t("eventInfo.placeLabel")} value={t("eventInfo.place")} />
      </div>
      {/* mm:2167:9061 */}
      <p className="font-body text-base font-bold leading-6 tracking-[0.5px] text-white">
        {t("eventInfo.livestreamNote")}
      </p>
    </div>
  );
}
