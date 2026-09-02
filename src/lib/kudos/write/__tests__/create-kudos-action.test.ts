import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KudosContentNode } from "../../content-schema";
import type { CreateKudosInput } from "../create-kudos-action";

// Phase 05 (F005 INT-003, BR-008; data-model.md create_kudos RPC): the
// server action re-validates everything the client already gated
// (DEC-001) plus the two trust-boundary checks a client cannot be trusted
// to have done honestly: the content allow-list and the storage-path
// ownership prefix.

const getClaims = vi.fn();
const rpc = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getClaims },
    rpc,
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

const validContent: KudosContentNode = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "Cam on ban" }] }],
};

function validInput(overrides: Partial<CreateKudosInput> = {}): CreateKudosInput {
  return {
    id: "kudos-1",
    receiverId: "receiver-1",
    content: validContent,
    isAnonymous: false,
    anonymousDisplayName: null,
    hashtagIds: ["tag-1"],
    images: [],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } }, error: null });
});

describe("createKudos", () => {
  it("rejects a malformed payload before touching Supabase at all", async () => {
    const { createKudos } = await import("../create-kudos-action");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- simulating an untyped network payload at the action boundary
    const result = await createKudos({ id: "kudos-1" } as any);

    expect(result).toEqual({ ok: false, code: "invalid-input" });
    expect(getClaims).not.toHaveBeenCalled();
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns unauthenticated when getClaims has no sub", async () => {
    getClaims.mockResolvedValueOnce({ data: { claims: {} }, error: null });
    const { createKudos } = await import("../create-kudos-action");

    const result = await createKudos(validInput());

    expect(result).toEqual({ ok: false, code: "unauthenticated" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects sending a kudos to yourself (self-kudos is BLOCKED per the Group-3 checkpoint decision)", async () => {
    const { createKudos } = await import("../create-kudos-action");

    const result = await createKudos(validInput({ receiverId: "user-1" }));

    expect(result).toEqual({ ok: false, code: "self-kudos-not-allowed" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("returns invalid-draft with the specific reason when the draft fails re-validation", async () => {
    const { createKudos } = await import("../create-kudos-action");

    const result = await createKudos(validInput({ hashtagIds: [] }));

    expect(result).toEqual({ ok: false, code: "invalid-draft", reason: "invalid-hashtag-count" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects a content payload outside the allow-list even if the client claimed it was valid", async () => {
    const { createKudos } = await import("../create-kudos-action");

    const invalidContent = { type: "html", content: [] } as unknown as KudosContentNode;
    const result = await createKudos(validInput({ content: invalidContent }));

    expect(result).toEqual({ ok: false, code: "invalid-draft", reason: "invalid-content-shape" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects an image path carrying a foreign sender prefix (hostile path)", async () => {
    const { createKudos } = await import("../create-kudos-action");

    const result = await createKudos(
      validInput({ images: [{ storagePath: "kudos/someone-else/kudos-1/0-photo.jpg", position: 0 }] }),
    );

    expect(result).toEqual({ ok: false, code: "invalid-image-path" });
    expect(rpc).not.toHaveBeenCalled();
  });

  it("calls create_kudos with the authenticated user as sender via RPC, sorted image paths, and revalidates on success", async () => {
    rpc.mockResolvedValueOnce({ data: "kudos-1", error: null });
    const { createKudos } = await import("../create-kudos-action");

    const result = await createKudos(
      validInput({
        images: [
          { storagePath: "kudos/user-1/kudos-1/1-second.jpg", position: 1 },
          { storagePath: "kudos/user-1/kudos-1/0-first.jpg", position: 0 },
        ],
      }),
    );

    expect(result).toEqual({ ok: true, id: "kudos-1" });
    expect(rpc).toHaveBeenCalledWith("create_kudos", {
      p_id: "kudos-1",
      p_receiver: "receiver-1",
      p_content: validContent,
      p_is_anonymous: false,
      p_display_name: null,
      p_hashtag_ids: ["tag-1"],
      p_image_paths: ["kudos/user-1/kudos-1/0-first.jpg", "kudos/user-1/kudos-1/1-second.jpg"],
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/kudos");
  });

  it("passes the anonymous display name through only when is_anonymous is true", async () => {
    rpc.mockResolvedValueOnce({ data: "kudos-1", error: null });
    const { createKudos } = await import("../create-kudos-action");

    await createKudos(validInput({ isAnonymous: true, anonymousDisplayName: "An Sunner" }));

    expect(rpc).toHaveBeenCalledWith(
      "create_kudos",
      expect.objectContaining({ p_is_anonymous: true, p_display_name: "An Sunner" }),
    );
  });

  it("returns insert-failed and does not revalidate when the RPC errors", async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: "boom" } });
    const { createKudos } = await import("../create-kudos-action");

    const result = await createKudos(validInput());

    expect(result).toEqual({ ok: false, code: "insert-failed" });
    expect(revalidatePathMock).not.toHaveBeenCalled();
  });
});
