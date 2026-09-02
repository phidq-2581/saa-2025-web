import { describe, expect, it } from "vitest";
import {
  ALLOWED_LINK_SCHEMES,
  ALLOWED_MARK_TYPES,
  ALLOWED_NODE_TYPES,
  isAllowedLinkScheme,
  isAllowedMarkType,
  isAllowedNodeType,
} from "../content-schema";

// Phase 01: this is the single allow-list contract the write layer (Phase
// 05) and the render layer (Phase 04) both consume -- an unlisted node/mark
// type or a non-http(s) link scheme must never be treated as safe.
describe("content-schema guards", () => {
  it.each(ALLOWED_NODE_TYPES)("isAllowedNodeType(%j) accepts every listed node type", (type) => {
    expect(isAllowedNodeType(type)).toBe(true);
  });

  it.each(["html", "image", "codeBlock", ""])(
    "isAllowedNodeType(%j) rejects a node type not on the allow-list",
    (type) => {
      expect(isAllowedNodeType(type)).toBe(false);
    },
  );

  it.each(ALLOWED_MARK_TYPES)("isAllowedMarkType(%j) accepts every listed mark type", (type) => {
    expect(isAllowedMarkType(type)).toBe(true);
  });

  it.each(["underline", "code", "highlight", ""])(
    "isAllowedMarkType(%j) rejects a mark type not on the allow-list",
    (type) => {
      expect(isAllowedMarkType(type)).toBe(false);
    },
  );

  it.each(ALLOWED_LINK_SCHEMES)("isAllowedLinkScheme(%j) accepts every listed scheme", (scheme) => {
    expect(isAllowedLinkScheme(scheme)).toBe(true);
  });

  it.each(["javascript:", "data:", "file:", ""])(
    "isAllowedLinkScheme(%j) rejects a scheme not on the allow-list",
    (scheme) => {
      expect(isAllowedLinkScheme(scheme)).toBe(false);
    },
  );
});
