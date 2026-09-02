import {
  isAllowedLinkScheme,
  isAllowedMarkType,
  isAllowedNodeType,
} from "../content-schema";

/**
 * Phase 05 (F005 BR-008/SC-004): the write-side mirror of Phase 01's
 * content-schema allow-list. A `kudos.content` row must never persist a
 * node/mark type outside the render layer's allow-list, nor a link with a
 * scheme other than http(s) -- this runs on unknown/untrusted JSON arriving
 * from a client, so every shape assumption is checked, never cast blindly.
 */

/** Group-3 review fix (HIGH): an attacker-controlled JSON tree with
 *  unbounded nesting or breadth must fail as a typed validation error, not
 *  exhaust the stack or CPU before the allow-list checks below ever run. */
export const MAX_CONTENT_DEPTH = 20;
export const MAX_CONTENT_NODE_COUNT = 2000;

export type ContentValidationReason =
  | "invalid-shape"
  | "unknown-node-type"
  | "unknown-mark-type"
  | "invalid-link-scheme"
  | "max-depth-exceeded"
  | "too-many-nodes";

export type ContentValidationResult =
  | { ok: true }
  | { ok: false; reason: "invalid-shape" }
  | { ok: false; reason: "unknown-node-type"; nodeType: string }
  | { ok: false; reason: "unknown-mark-type"; markType: string }
  | { ok: false; reason: "invalid-link-scheme"; href: string }
  | { ok: false; reason: "max-depth-exceeded" }
  | { ok: false; reason: "too-many-nodes" };

const SCHEME_PATTERN = /^([a-zA-Z][a-zA-Z\d+.-]*):/;

function extractScheme(href: string): string | null {
  const match = SCHEME_PATTERN.exec(href);
  return match ? `${match[1].toLowerCase()}:` : null;
}

function validateMark(mark: unknown): ContentValidationResult {
  if (typeof mark !== "object" || mark === null || Array.isArray(mark)) {
    return { ok: false, reason: "invalid-shape" };
  }

  const candidate = mark as { type?: unknown; attrs?: { href?: unknown } };

  if (typeof candidate.type !== "string") {
    return { ok: false, reason: "invalid-shape" };
  }

  if (!isAllowedMarkType(candidate.type)) {
    return { ok: false, reason: "unknown-mark-type", markType: candidate.type };
  }

  if (candidate.type === "link") {
    const href = candidate.attrs?.href;
    if (typeof href !== "string") {
      return { ok: false, reason: "invalid-link-scheme", href: "" };
    }

    const scheme = extractScheme(href);
    if (!scheme || !isAllowedLinkScheme(scheme)) {
      return { ok: false, reason: "invalid-link-scheme", href };
    }
  }

  return { ok: true };
}

/** Shared, mutable across the whole recursive walk of one top-level call --
 *  a total-node ceiling has to be tracked across siblings, not just depth. */
interface WalkBudget {
  nodeCount: number;
}

function validateNode(node: unknown, depth: number, budget: WalkBudget): ContentValidationResult {
  budget.nodeCount += 1;
  if (budget.nodeCount > MAX_CONTENT_NODE_COUNT) {
    return { ok: false, reason: "too-many-nodes" };
  }

  if (depth > MAX_CONTENT_DEPTH) {
    return { ok: false, reason: "max-depth-exceeded" };
  }

  if (typeof node !== "object" || node === null || Array.isArray(node)) {
    return { ok: false, reason: "invalid-shape" };
  }

  const candidate = node as { type?: unknown; marks?: unknown; content?: unknown };

  if (typeof candidate.type !== "string") {
    return { ok: false, reason: "invalid-shape" };
  }

  if (!isAllowedNodeType(candidate.type)) {
    return { ok: false, reason: "unknown-node-type", nodeType: candidate.type };
  }

  if (candidate.marks !== undefined) {
    if (!Array.isArray(candidate.marks)) {
      return { ok: false, reason: "invalid-shape" };
    }

    for (const mark of candidate.marks) {
      const markResult = validateMark(mark);
      if (!markResult.ok) {
        return markResult;
      }
    }
  }

  if (candidate.content !== undefined) {
    if (!Array.isArray(candidate.content)) {
      return { ok: false, reason: "invalid-shape" };
    }

    for (const child of candidate.content) {
      const childResult = validateNode(child, depth + 1, budget);
      if (!childResult.ok) {
        return childResult;
      }
    }
  }

  return { ok: true };
}

/** Recursively validates an unknown value as a TipTap document node tree,
 *  bounded by `MAX_CONTENT_DEPTH` and `MAX_CONTENT_NODE_COUNT` so a hostile
 *  payload fails fast as a typed error instead of degrading performance. */
export function validateContent(node: unknown): ContentValidationResult {
  return validateNode(node, 1, { nodeCount: 0 });
}
