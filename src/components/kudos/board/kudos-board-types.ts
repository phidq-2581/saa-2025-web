import type { KudosCardView, SidebarStats, SpotlightNode } from "@/lib/kudos/types";
import type { CampaignWindow } from "@/lib/kudos/derive/campaign-window";

/**
 * Phase 04 (F006): local, presentation-only view-model types layered on top
 * of the read-only Phase 01 contracts in `src/lib/kudos/types.ts`. These
 * exist because the shared types don't carry every field the MoMorph design
 * needs to render a card/sidebar/spotlight -- see the phase-04 delivery
 * report "Design gaps found" for the specific mismatches. `src/lib/kudos/**`
 * itself is never edited here; Phase 07 reconciles the real query shapes.
 */

/** 4-tier hero badge shown next to a name (spec discovery, not in specs.csv;
 * clarifications.md 2026-08-31 "Phát hiện từ frame"). Thresholds are Phase
 * 07's job -- this phase only renders whatever tier the data carries. */
export type HeroTier = "new" | "rising" | "super" | "legend";

/** Asterisk-tier badge: 0 = none, 1 >= 10, 2 >= 20, 3 >= 50 kudos received
 * (clarifications.md "Suy từ mốc hoa thị"). */
export type AsteriskTier = 0 | 1 | 2 | 3;

/** Sender/receiver fields the design shows (department, hero tier, asterisk
 * count -- B.3.2/B.3.6/C.3.1/C.3.3) that `KudosAuthor` doesn't carry. */
export interface AuthorPresentation {
  department: string;
  heroTier: HeroTier;
  asteriskTier: AsteriskTier;
}

/** One renderable kudos card: the real `KudosCardView` payload plus the
 * presentation-only sender/receiver metadata above. */
export interface KudosCardSample extends KudosCardView {
  senderMeta: AuthorPresentation;
  receiverMeta: AuthorPresentation;
}

/** Sidebar's 5 real `D.1.x` stat rows -- the shared `SidebarStats` shape
 * (received/sent/hearts/secret-opened/secret-unopened/asteriskTier) plus
 * the one genuinely presentational extra the shared type doesn't carry:
 * `heartsDoubled`, the "x2" marker discovered next to "Số tim bạn nhận
 * được:" (node 3241:14882/3241:14931). The RED spec (corrected) asserts
 * `sidebar-stat-line` count === 5 -- 2940:13488 has exactly 5 concrete
 * `D.1.x` label+value rows (D.1.5 is a divider, not a stat). */
export interface SidebarStatsView extends SidebarStats {
  heartsDoubled: boolean;
  /** The special-day run that makes `heartsDoubled` true -- feeds the "Hover
   *  campain" card (campaign-window.ts); null whenever hearts are not doubled. */
  campaign: CampaignWindow | null;
}

/** One Spotlight ticker line ("08:30PM {name} đã nhận được một Kudos mới",
 * node 3004:15999 -- frame discovery, clarifications.md 2026-08-31). */
export interface SpotlightTickerItem {
  recipientName: string;
  time: string;
}

/** Re-exported for board components that only need the Spotlight node
 * shape, not the rest of `src/lib/kudos/types.ts`. `SpotlightNode` is
 * one-node-per-kudos (`{ kudosId, recipientName, receivedAt }`) -- the
 * word cloud sizes/labels by how often a `recipientName` recurs across
 * nodes, computed at render time; the sample data does not pre-aggregate
 * a count. */
export type { SpotlightNode };
