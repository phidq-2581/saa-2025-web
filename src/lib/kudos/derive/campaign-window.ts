import { computeHoChiMinhDateString } from "@/lib/kudos/write/heart-rules";

/** First/last `special_days.day` (YYYY-MM-DD) of the run that contains today. */
export type CampaignWindow = { start: string; end: string };

function shiftDay(day: string, delta: number): string {
  // YYYY-MM-DD arithmetic in UTC -- calendar days only, no local-time drift.
  const next = new Date(`${day}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + delta);
  return next.toISOString().slice(0, 10);
}

/**
 * `special_days` holds whole Asia/Ho_Chi_Minh calendar days and heart-rules.ts
 * doubles any heart granted on one of them, so the "x2 campaign" a Sunner is
 * in right now is the contiguous run of special days around today's Ho Chi
 * Minh date. Returns null when today is not special (no marker, no card).
 */
export function resolveCampaignWindow(nowUtc: Date, specialDays: readonly string[]): CampaignWindow | null {
  const today = computeHoChiMinhDateString(nowUtc);
  const days = new Set(specialDays);
  if (!days.has(today)) return null;
  let start = today;
  while (days.has(shiftDay(start, -1))) start = shiftDay(start, -1);
  let end = today;
  while (days.has(shiftDay(end, 1))) end = shiftDay(end, 1);
  return { start, end };
}

/**
 * The canvas placeholder is "XX:XX ngày XX/12" (frame 3241:15021); a
 * special day covers its whole Ho Chi Minh calendar day, so the window opens
 * at 00:00 on its first day and closes at 23:59 on its last.
 */
export function formatCampaignBoundary(day: string, edge: "start" | "end"): string {
  const [, month, date] = day.split("-");
  return `${edge === "start" ? "00:00" : "23:59"} ngày ${date}/${month}`;
}
