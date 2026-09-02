import { describe, expect, it } from "vitest";
import { MAX_CONTENT_DEPTH, MAX_CONTENT_NODE_COUNT, validateContent } from "../validate-content";

/** A chain of `depth` nested blockquotes wrapping a leaf text node -- the
 *  leaf sits at recursion depth `depth` (root counts as depth 1). */
function buildNestedBlockquote(depth: number): unknown {
  let node: unknown = { type: "text", text: "x" };
  for (let level = 1; level < depth; level += 1) {
    node = { type: "blockquote", content: [node] };
  }
  return node;
}

/** A flat doc with `childCount` text children -- total node count is
 *  `childCount + 1` (the root `doc` node itself). */
function buildWideDoc(childCount: number): unknown {
  return {
    type: "doc",
    content: Array.from({ length: childCount }, () => ({ type: "text", text: "x" })),
  };
}

// Phase 05 (F005 BR-008/SC-004): the write-side mirror of Phase 01's
// content-schema allow-list -- a kudos row must never persist a node/mark
// type outside the render layer's allow-list, nor a link with an unsafe
// scheme.
describe("validateContent", () => {
  it("accepts a plain paragraph/text document", () => {
    const doc = {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Cam on ban" }] }],
    };

    expect(validateContent(doc)).toEqual({ ok: true });
  });

  it("accepts every allow-listed mark type, including a link with an http(s) href", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "great job",
              marks: [
                { type: "bold" },
                { type: "italic" },
                { type: "strike" },
                { type: "link", attrs: { href: "https://example.com" } },
              ],
            },
          ],
        },
      ],
    };

    expect(validateContent(doc)).toEqual({ ok: true });
  });

  it("accepts a mention node", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "mention", attrs: { id: "user-1", label: "Nguyen Van A" } }],
        },
      ],
    };

    expect(validateContent(doc)).toEqual({ ok: true });
  });

  it("rejects a node type outside the allow-list (e.g. a raw html node)", () => {
    const doc = { type: "doc", content: [{ type: "html", content: [] }] };

    expect(validateContent(doc)).toEqual({
      ok: false,
      reason: "unknown-node-type",
      nodeType: "html",
    });
  });

  it("rejects a mark type outside the allow-list (e.g. underline)", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "underline" }] }] },
      ],
    };

    expect(validateContent(doc)).toEqual({
      ok: false,
      reason: "unknown-mark-type",
      markType: "underline",
    });
  });

  it("rejects a javascript: link href", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] },
          ],
        },
      ],
    };

    expect(validateContent(doc)).toEqual({
      ok: false,
      reason: "invalid-link-scheme",
      href: "javascript:alert(1)",
    });
  });

  it("rejects a relative link href (no scheme)", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "/internal" } }] }],
        },
      ],
    };

    expect(validateContent(doc)).toEqual({
      ok: false,
      reason: "invalid-link-scheme",
      href: "/internal",
    });
  });

  it("accepts an https link href", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "x", marks: [{ type: "link", attrs: { href: "http://example.com" } }] },
          ],
        },
      ],
    };

    expect(validateContent(doc)).toEqual({ ok: true });
  });

  it("rejects a non-object node", () => {
    expect(validateContent(null)).toEqual({ ok: false, reason: "invalid-shape" });
    expect(validateContent("not-a-node")).toEqual({ ok: false, reason: "invalid-shape" });
    expect(validateContent([])).toEqual({ ok: false, reason: "invalid-shape" });
  });

  it("rejects a node whose marks/content are not arrays", () => {
    expect(validateContent({ type: "text", marks: "bold" })).toEqual({
      ok: false,
      reason: "invalid-shape",
    });
    expect(validateContent({ type: "doc", content: "nope" })).toEqual({
      ok: false,
      reason: "invalid-shape",
    });
  });

  // Group-3 review fix (HIGH): unbounded recursion on an attacker-controlled
  // JSON tree can exhaust the stack or CPU before any allow-list check ever
  // rejects it. A depth cap and a total-node cap turn that into a typed,
  // cheap-to-hit validation error instead.
  it("accepts a document nested exactly to the depth cap", () => {
    expect(validateContent(buildNestedBlockquote(MAX_CONTENT_DEPTH))).toEqual({ ok: true });
  });

  it("rejects a document nested one level past the depth cap", () => {
    expect(validateContent(buildNestedBlockquote(MAX_CONTENT_DEPTH + 1))).toEqual({
      ok: false,
      reason: "max-depth-exceeded",
    });
  });

  it("accepts a document with exactly the node-count cap", () => {
    expect(validateContent(buildWideDoc(MAX_CONTENT_NODE_COUNT - 1))).toEqual({ ok: true });
  });

  it("rejects a document one node past the node-count cap", () => {
    expect(validateContent(buildWideDoc(MAX_CONTENT_NODE_COUNT))).toEqual({
      ok: false,
      reason: "too-many-nodes",
    });
  });
});
