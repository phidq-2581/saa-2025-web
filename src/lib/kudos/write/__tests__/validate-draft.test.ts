import { describe, expect, it } from "vitest";
import type { KudosContentNode } from "../../content-schema";
import { isSelfKudos, validateDraft, type KudosDraftInput } from "../validate-draft";

// Phase 05 (F005 DEC-001 mirrored server-side): receiver present,
// non-empty content, 1-5 hashtags. Server-side re-validation is the second
// layer behind the client's submit-enablement gate.
const textNode = (text: string): KudosContentNode => ({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text }] }],
});

function draft(overrides: Partial<KudosDraftInput> = {}): KudosDraftInput {
  return {
    receiverId: "receiver-1",
    content: textNode("Cam on ban"),
    hashtagIds: ["tag-1"],
    isAnonymous: false,
    anonymousDisplayName: null,
    imagePaths: [],
    ...overrides,
  };
}

describe("validateDraft", () => {
  it("accepts a minimal valid draft", () => {
    expect(validateDraft(draft())).toEqual({ ok: true });
  });

  it("accepts the maximum of 5 hashtags and 5 images", () => {
    expect(
      validateDraft(
        draft({
          hashtagIds: ["t1", "t2", "t3", "t4", "t5"],
          imagePaths: ["a", "b", "c", "d", "e"],
        }),
      ),
    ).toEqual({ ok: true });
  });

  it("rejects a missing receiver", () => {
    expect(validateDraft(draft({ receiverId: null }))).toEqual({
      ok: false,
      reason: "missing-receiver",
    });
  });

  it("rejects content that is empty after trimming (whitespace-only)", () => {
    expect(validateDraft(draft({ content: textNode("   ") }))).toEqual({
      ok: false,
      reason: "empty-content",
    });
  });

  it("rejects a content document with no text at all", () => {
    expect(validateDraft(draft({ content: { type: "doc", content: [] } }))).toEqual({
      ok: false,
      reason: "empty-content",
    });
  });

  it("rejects a content document carrying a disallowed node/mark type", () => {
    const invalidContent = { type: "html", content: [] } as unknown as KudosContentNode;
    expect(validateDraft(draft({ content: invalidContent }))).toEqual({
      ok: false,
      reason: "invalid-content-shape",
    });
  });

  it("rejects zero hashtags", () => {
    expect(validateDraft(draft({ hashtagIds: [] }))).toEqual({
      ok: false,
      reason: "invalid-hashtag-count",
    });
  });

  it("rejects a 6th hashtag", () => {
    expect(validateDraft(draft({ hashtagIds: ["t1", "t2", "t3", "t4", "t5", "t6"] }))).toEqual({
      ok: false,
      reason: "invalid-hashtag-count",
    });
  });

  it("rejects a duplicate hashtag id", () => {
    expect(validateDraft(draft({ hashtagIds: ["t1", "t1"] }))).toEqual({
      ok: false,
      reason: "duplicate-hashtag",
    });
  });

  it("rejects more than 5 image paths", () => {
    expect(validateDraft(draft({ imagePaths: ["a", "b", "c", "d", "e", "f"] }))).toEqual({
      ok: false,
      reason: "too-many-images",
    });
  });

  it("rejects an anonymous draft with no display name", () => {
    expect(validateDraft(draft({ isAnonymous: true, anonymousDisplayName: null }))).toEqual({
      ok: false,
      reason: "missing-anonymous-display-name",
    });
    expect(validateDraft(draft({ isAnonymous: true, anonymousDisplayName: "   " }))).toEqual({
      ok: false,
      reason: "missing-anonymous-display-name",
    });
  });

  it("accepts an anonymous draft with a display name", () => {
    expect(
      validateDraft(draft({ isAnonymous: true, anonymousDisplayName: "An Sunner" })),
    ).toEqual({ ok: true });
  });
});

// Group-3 checkpoint decision: self-kudos is BLOCKED. Exported as a small,
// pure predicate (not folded into KudosDraftInput, which has no senderId)
// so the client (Phase 07's compose modal, which already knows both ids)
// can call the exact same rule the server enforces in
// create-kudos-action.ts -- one source of truth, no duplicated `===`.
describe("isSelfKudos", () => {
  it("is true when the receiver is the sender", () => {
    expect(isSelfKudos("user-1", "user-1")).toBe(true);
  });

  it("is false for a normal, different receiver", () => {
    expect(isSelfKudos("user-1", "receiver-1")).toBe(false);
  });
});
