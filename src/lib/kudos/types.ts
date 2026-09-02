import type { KudosContentNode } from "./content-schema";

/**
 * Phase 01 (F005/F006): the shared view-model contracts every kudos query
 * (Phase 02/05) and every kudos UI component (Phase 03/04/06) imports.
 * Field names are derived from `public.kudos_card_view` and the seed data,
 * never guessed (`development-rules.md`: MCP/design/data is authoritative).
 */

export interface HashtagRef {
  id: string;
  name: string;
}

export interface KudosAuthor {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

/** One row of `public.kudos_card_view`, camelCased at the query boundary. */
export interface KudosCardView {
  id: string;
  sender: KudosAuthor;
  receiver: KudosAuthor;
  content: KudosContentNode;
  isAnonymous: boolean;
  anonymousDisplayName: string | null;
  createdAt: string;
  heartCount: number;
  hashtags: HashtagRef[];
  imagePaths: string[];
}

/**
 * Sidebar counters -- real DB counts, never hardcoded (secret box defaults
 * 0 this round -- no redemption flow ships yet, BR-010).
 */
export interface SidebarStats {
  kudosReceivedCount: number;
  kudosSentCount: number;
  /** BR-006: hearts credit the SENDER -- sum of `granted_amount` on hearts
   *  over kudos the viewer SENT, never a receiver-side count. */
  heartsReceivedCount: number;
  secretBoxOpenedCount: number;
  /** No pending-gift data source exists this round -- fixed at 0. */
  secretBoxUnopenedCount: number;
  asteriskTier: 0 | 1 | 2 | 3;
}

/** A Sunner's asterisk-tier promotion event, derived from kudos-received milestones (10/20/50). */
export interface LeaderboardEntry {
  userId: string;
  fullName: string | null;
  avatarUrl: string | null;
  kudosReceivedCount: number;
  milestoneReachedAt: string;
}

/**
 * One node of the Spotlight word cloud -- one node per kudos, labeled by
 * its recipient (MoMorph B.7: hover shows name + time received, click
 * opens that kudos's detail page, TC `33ca8f8a`).
 */
export interface SpotlightNode {
  kudosId: string;
  recipientName: string | null;
  receivedAt: string;
}

export interface FeedPage {
  items: KudosCardView[];
  nextOffset: number | null;
}
