export interface RemainingTime {
  days: string;
  hours: string;
  minutes: string;
  reached: boolean;
}

const MINUTE_MS = 60_000;
const MINUTES_PER_DAY = 24 * 60;

function pad2(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

/**
 * ALG-001_CountdownRemainingTime. Diffs two epoch-ms timestamps, floors into
 * whole minutes, derives days/hours/minutes by integer division, and clamps
 * to zero once the diff is non-positive (BR-002). Every field is 2-digit
 * zero-padded (BR-001).
 */
export function computeRemaining(nowMs: number, targetMs: number): RemainingTime {
  const diff = targetMs - nowMs;
  if (diff <= 0) {
    return { days: "00", hours: "00", minutes: "00", reached: true };
  }

  const totalMinutes = Math.floor(diff / MINUTE_MS);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / 60);
  const minutes = totalMinutes % 60;

  return { days: pad2(days), hours: pad2(hours), minutes: pad2(minutes), reached: false };
}
