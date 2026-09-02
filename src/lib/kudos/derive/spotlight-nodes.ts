import type { SpotlightNode } from "../types";

/**
 * Phase 02 rework (F006, plan-owner ruling on MoMorph B.7): the Spotlight
 * word cloud is a RECIPIENT cloud, not a hashtag cloud -- one node per
 * kudos, labeled by its recipient. Hover shows name + time received;
 * clicking opens that exact kudos's detail page (TC `33ca8f8a`). Nodes are
 * ordered `receivedAt desc` (most recent first); a `kudosId desc`
 * tie-break keeps the order fully deterministic (unspecified by the spec,
 * fixed here for testability, same pattern as `highlight-order.ts`).
 */

export interface SpotlightKudosRow {
  kudosId: string;
  recipientName: string | null;
  receivedAt: string;
}

export function deriveSpotlightNodes(rows: SpotlightKudosRow[]): SpotlightNode[] {
  return [...rows]
    .sort((a, b) => {
      if (a.receivedAt !== b.receivedAt) {
        return b.receivedAt.localeCompare(a.receivedAt);
      }
      return b.kudosId.localeCompare(a.kudosId);
    })
    .map((row) => ({
      kudosId: row.kudosId,
      recipientName: row.recipientName,
      receivedAt: row.receivedAt,
    }));
}
