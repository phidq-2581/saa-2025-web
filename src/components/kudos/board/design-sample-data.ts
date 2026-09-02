/**
 * Phase 04 (F006) single import surface for `/kudos`'s design-sourced mock
 * data. Only `page.tsx` imports from this file (or its `sample-*` helper
 * modules) -- every other component receives data through props per the
 * phase's integration contract. Phase 07 deletes this whole `sample-*`
 * family once real Supabase queries land.
 */

export { FILTER_HASHTAGS, DEPARTMENTS, CURRENT_VIEWER_ID } from "./sample-reference-data";
export { HIGHLIGHT_SLIDES, FEED_PAGES, EMPTY_FEED_PAGES } from "./sample-cards";
export {
  SPOTLIGHT_NODES,
  SPOTLIGHT_TOTAL_KUDOS,
  SPOTLIGHT_TICKER,
  RANK_LEADERBOARD,
  GIFT_LEADERBOARD,
  SIDEBAR_STATS,
} from "./sample-spotlight-leaderboard";
