import type { KudosContentNode } from "../content-schema";
import { validateContent } from "./validate-content";

/**
 * Phase 05 (F005 DEC-001_SubmitEnablementFlow, mirrored server-side): the
 * action's second layer behind the client's submit-enablement gate --
 * receiver present, non-empty content, 1-5 distinct hashtags, at most 5
 * images, and (data-model.md § kudos) a display name whenever anonymous.
 */

export interface KudosDraftInput {
  receiverId: string | null;
  content: KudosContentNode;
  hashtagIds: readonly string[];
  isAnonymous: boolean;
  anonymousDisplayName: string | null;
  imagePaths: readonly string[];
}

export type DraftValidationReason =
  | "missing-receiver"
  | "invalid-content-shape"
  | "empty-content"
  | "invalid-hashtag-count"
  | "duplicate-hashtag"
  | "too-many-images"
  | "missing-anonymous-display-name";

export type DraftValidationResult = { ok: true } | { ok: false; reason: DraftValidationReason };

/**
 * Group-3 checkpoint decision: self-kudos is BLOCKED. A standalone
 * predicate (not folded into `KudosDraftInput`, which carries no sender
 * id) so both the server action and, later, Phase 07's compose modal call
 * the exact same rule -- one source of truth, no duplicated `===`.
 */
export function isSelfKudos(senderId: string, receiverId: string): boolean {
  return senderId === receiverId;
}

const MIN_HASHTAGS = 1;
const MAX_HASHTAGS = 5;
const MAX_IMAGES = 5;

function extractPlainText(node: KudosContentNode): string {
  const own = node.text ?? "";
  const children = node.content?.map(extractPlainText).join("") ?? "";
  return own + children;
}

export function validateDraft(draft: KudosDraftInput): DraftValidationResult {
  if (!draft.receiverId) {
    return { ok: false, reason: "missing-receiver" };
  }

  const contentShape = validateContent(draft.content);
  if (!contentShape.ok) {
    return { ok: false, reason: "invalid-content-shape" };
  }

  if (extractPlainText(draft.content).trim().length === 0) {
    return { ok: false, reason: "empty-content" };
  }

  if (draft.hashtagIds.length < MIN_HASHTAGS || draft.hashtagIds.length > MAX_HASHTAGS) {
    return { ok: false, reason: "invalid-hashtag-count" };
  }

  if (new Set(draft.hashtagIds).size !== draft.hashtagIds.length) {
    return { ok: false, reason: "duplicate-hashtag" };
  }

  if (draft.imagePaths.length > MAX_IMAGES) {
    return { ok: false, reason: "too-many-images" };
  }

  if (draft.isAnonymous && !draft.anonymousDisplayName?.trim()) {
    return { ok: false, reason: "missing-anonymous-display-name" };
  }

  return { ok: true };
}
