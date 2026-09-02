/**
 * Phase 01 (F005/F006): the single allow-list contract for Viet Kudo's
 * TipTap content. Both the write layer (Phase 05, validates before insert)
 * and the render layer (Phase 04, renders safely) import this -- one source
 * of truth for what shape/marks a `kudos.content` jsonb document may hold
 * (clarifications.md Session 2026-08-31: "TipTap JSON ... render an toan").
 */

/** Structural/block node types a stored document may contain. */
export const ALLOWED_NODE_TYPES = [
  "doc",
  "paragraph",
  "text",
  "blockquote",
  "orderedList",
  "listItem",
  "mention",
] as const;

export type AllowedNodeType = (typeof ALLOWED_NODE_TYPES)[number];

/** Inline formatting marks a text node may carry. */
export const ALLOWED_MARK_TYPES = ["bold", "italic", "strike", "link"] as const;

export type AllowedMarkType = (typeof ALLOWED_MARK_TYPES)[number];

/** Only http(s) links may be stored/rendered -- blocks `javascript:`/`data:` schemes. */
export const ALLOWED_LINK_SCHEMES = ["http:", "https:"] as const;

export type AllowedLinkScheme = (typeof ALLOWED_LINK_SCHEMES)[number];

export interface KudosContentMark {
  type: AllowedMarkType;
  attrs?: Record<string, unknown>;
}

export interface KudosContentNode {
  type: AllowedNodeType;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: KudosContentMark[];
  content?: KudosContentNode[];
}

export function isAllowedNodeType(value: string): value is AllowedNodeType {
  return (ALLOWED_NODE_TYPES as readonly string[]).includes(value);
}

export function isAllowedMarkType(value: string): value is AllowedMarkType {
  return (ALLOWED_MARK_TYPES as readonly string[]).includes(value);
}

export function isAllowedLinkScheme(value: string): value is AllowedLinkScheme {
  return (ALLOWED_LINK_SCHEMES as readonly string[]).includes(value);
}
