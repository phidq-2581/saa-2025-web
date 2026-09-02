import { describe, expect, it } from "vitest";
import { deriveSpotlightNodes } from "../spotlight-nodes";
import type { SpotlightKudosRow } from "../spotlight-nodes";

function kudos(kudosId: string, recipientName: string | null, receivedAt: string): SpotlightKudosRow {
  return { kudosId, recipientName, receivedAt };
}

// Phase 02 rework (F006, plan-owner ruling on MoMorph B.7): the Spotlight
// word cloud is a RECIPIENT cloud, not a hashtag cloud -- one node per
// kudos, labeled by its recipient. Hover shows name + time received;
// clicking opens that exact kudos's detail page (TC `33ca8f8a`).
describe("deriveSpotlightNodes", () => {
  it("returns an empty node list for no kudos", () => {
    expect(deriveSpotlightNodes([])).toEqual([]);
  });

  it("returns one node per kudos, labeled by its recipient", () => {
    const rows = [kudos("k1", "Alice", "2026-01-01T00:00:00Z")];
    expect(deriveSpotlightNodes(rows)).toEqual([
      { kudosId: "k1", recipientName: "Alice", receivedAt: "2026-01-01T00:00:00Z" },
    ]);
  });

  it("keeps every kudos as its own node even when the same recipient repeats", () => {
    const rows = [
      kudos("k1", "Alice", "2026-01-01T00:00:00Z"),
      kudos("k2", "Alice", "2026-01-02T00:00:00Z"),
    ];
    expect(deriveSpotlightNodes(rows)).toHaveLength(2);
  });

  it("orders nodes by receivedAt desc, most recent first", () => {
    const rows = [
      kudos("k1", "Alice", "2026-01-01T00:00:00Z"),
      kudos("k2", "Bob", "2026-01-03T00:00:00Z"),
      kudos("k3", "Cara", "2026-01-02T00:00:00Z"),
    ];
    expect(deriveSpotlightNodes(rows).map((n) => n.kudosId)).toEqual(["k2", "k3", "k1"]);
  });

  it("breaks a receivedAt tie deterministically by kudosId desc", () => {
    const rows = [
      kudos("aaa", "Alice", "2026-01-01T00:00:00Z"),
      kudos("bbb", "Bob", "2026-01-01T00:00:00Z"),
    ];
    expect(deriveSpotlightNodes(rows).map((n) => n.kudosId)).toEqual(["bbb", "aaa"]);
  });

  it("preserves a null recipient name instead of dropping the node", () => {
    const rows = [kudos("k1", null, "2026-01-01T00:00:00Z")];
    expect(deriveSpotlightNodes(rows)[0].recipientName).toBeNull();
  });
});
