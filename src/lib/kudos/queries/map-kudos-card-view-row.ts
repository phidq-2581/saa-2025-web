import type { KudosCardView, HashtagRef } from "../types";
import type { KudosContentNode } from "../content-schema";

/**
 * Phase 02 (F006): the raw shape of one `public.kudos_card_view` row as
 * PostgREST returns it (snake_case, arrays coalesced to `{}` by the view
 * itself -- never `null`). Shared by every query that reads the view, so
 * the camelCase mapping lives in exactly one place (DRY).
 */
export interface KudosCardViewRow {
  id: string;
  sender_id: string;
  sender_full_name: string | null;
  sender_avatar_url: string | null;
  receiver_id: string;
  receiver_full_name: string | null;
  receiver_avatar_url: string | null;
  content: unknown;
  is_anonymous: boolean;
  anonymous_display_name: string | null;
  created_at: string;
  heart_count: number;
  hashtag_ids: string[] | null;
  hashtag_names: string[] | null;
  image_paths: string[] | null;
}

export function mapKudosCardViewRow(row: KudosCardViewRow): KudosCardView {
  const hashtagIds = row.hashtag_ids ?? [];
  const hashtagNames = row.hashtag_names ?? [];
  const hashtags: HashtagRef[] = hashtagIds.map((id, index) => ({
    id,
    name: hashtagNames[index] ?? "",
  }));

  return {
    id: row.id,
    sender: {
      id: row.sender_id,
      fullName: row.sender_full_name,
      avatarUrl: row.sender_avatar_url,
    },
    receiver: {
      id: row.receiver_id,
      fullName: row.receiver_full_name,
      avatarUrl: row.receiver_avatar_url,
    },
    content: row.content as KudosContentNode,
    isAnonymous: row.is_anonymous,
    anonymousDisplayName: row.anonymous_display_name,
    createdAt: row.created_at,
    heartCount: row.heart_count,
    hashtags,
    imagePaths: row.image_paths ?? [],
  };
}
