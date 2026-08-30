"use client";

import { parseTarget } from "@/lib/countdown/parse-target";
import { useCountdown } from "@/lib/countdown/use-countdown";
import { EventCountdown } from "./event-countdown";

/**
 * Client wrapper that feeds `EventCountdown`'s presentational `remaining`
 * prop from `useCountdown`'s live, client-only tick (BR-005). Kept as a
 * thin wrapper rather than folded into `EventCountdown` itself, so that
 * component's existing prop-driven unit tests
 * (`__tests__/event-countdown.test.tsx`) keep asserting the pure render
 * contract without needing a timer/env fixture. `parseTarget` never throws
 * (BR-004): a missing/invalid env value resolves to `null`, which
 * `useCountdown` treats as already-reached (the safe fallback).
 *
 * `NEXT_PUBLIC_*` env vars are inlined into the client bundle at build
 * time, so reading it here (inside the component, not at module scope) is
 * safe and cheap -- `parseTarget` is a single `Date.parse` call, and
 * per-render evaluation (rather than a module-level constant) is what lets
 * `__tests__/home-page.test.tsx` exercise both the reached and not-reached
 * paths via `vi.stubEnv` + a fresh dynamic import per test.
 */
export function EventCountdownLive() {
  const targetMs = parseTarget(process.env.NEXT_PUBLIC_EVENT_START_AT);
  const remaining = useCountdown(targetMs);
  return <EventCountdown remaining={remaining} />;
}
