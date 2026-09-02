/**
 * B.4.1/C.3.4 "Thời gian đăng" ("10:00 - 10/30/2025"). Format locked by
 * clarifications.md 2026-08-31 "Format thời gian 'HH:mm - MM/DD/YYYY'" --
 * matches `TIME_FORMAT_REGEX` in `e2e/support/board-helpers.ts`. No date
 * library in this project (see `src/lib/countdown/compute-remaining.ts`'s
 * own `padStart` pattern); local wall-clock getters, same as that module.
 */
function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatKudosTime(isoDate: string): string {
  const date = new Date(isoDate);
  const hh = pad2(date.getHours());
  const mm = pad2(date.getMinutes());
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const year = date.getFullYear();
  return `${hh}:${mm} - ${month}/${day}/${year}`;
}
