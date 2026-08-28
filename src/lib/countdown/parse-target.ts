/**
 * BR-004_CountdownEnvFallback (TC ID-60): parses `NEXT_PUBLIC_EVENT_START_AT`
 * (or any ISO-8601 string) into epoch-ms. MUST NOT throw -- an invalid or
 * missing value returns `null`, the safe fallback sentinel, instead of
 * crashing the page at module scope.
 */
export function parseTarget(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const ms = Date.parse(value);
  return Number.isNaN(ms) ? null : ms;
}
