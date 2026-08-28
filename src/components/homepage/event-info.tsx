import eventCopy from "../../../messages/vi/home.json";

type InfoRowProps = {
  label: string;
  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex items-center gap-1">
      {/* mm:2167:9056 */}
      <span className="font-body text-base font-bold tracking-[0.15px] text-white">{label}</span>
      {/* mm:2167:9057 */}
      <span className="font-body text-2xl font-bold text-gold">{value}</span>
    </div>
  );
}

/**
 * mms_B2_Thông tin sự kiện (2167:9053). The raw Figma canvas text
 * ("26/12/2025" / "Âu Cơ Art Center" / "... qua sóng Livestream") is
 * stale placeholder copy left on the layer; the finalized spec
 * description (specs.csv row B2) and test-cases.csv both give "18h30" /
 * "Nhà hát nghệ thuật quân đội" / "Tường thuật trực tiếp tại Group
 * Facebook Sun* Family" -- used here as the current MoMorph-sourced copy,
 * matching the RED test's e2e/homepage.spec.ts assertions verbatim.
 */
export function EventInfo() {
  return (
    // mm:2167:9053
    <div data-testid="event-info" className="flex flex-col gap-4">
      {/* mm:2167:9054 */}
      <div className="flex flex-wrap items-center gap-[60px]">
        <InfoRow label={eventCopy.eventInfo.timeLabel} value={eventCopy.eventInfo.time} />
        <InfoRow label={eventCopy.eventInfo.placeLabel} value={eventCopy.eventInfo.place} />
      </div>
      {/* mm:2167:9061 */}
      <p className="font-body text-base font-bold tracking-[0.5px] text-white">
        {eventCopy.eventInfo.livestreamNote}
      </p>
    </div>
  );
}
