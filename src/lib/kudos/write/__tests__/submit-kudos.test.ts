import { beforeEach, describe, expect, it, vi } from "vitest";
import type { KudosContentNode } from "../../content-schema";
import type { SubmitKudosInput } from "../submit-kudos";

// Phase 05 (F005 INT-002, Assumptions): images upload client -> Supabase
// Storage directly, on Submit only (not on file-pick, so a cancelled kudos
// never orphans an object). A failed upload must name the failing index so
// the modal can mark that thumbnail (resolves the spec's upload-failure
// [INFERRED] gap) and must never fall through to calling the insert action.

const uploadMock = vi.fn();
const storageFromMock = vi.fn(() => ({ upload: uploadMock }));
const createKudosMock = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: vi.fn(() => ({ storage: { from: storageFromMock } })),
}));

vi.mock("../create-kudos-action", () => ({
  createKudos: (...args: unknown[]) => createKudosMock(...args),
}));

function makeFile(name: string, type = "image/jpeg"): File {
  return new File(["fake-bytes"], name, { type });
}

const content: KudosContentNode = {
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "hi" }] }],
};

function baseInput(overrides: Partial<SubmitKudosInput> = {}): SubmitKudosInput {
  return {
    senderId: "sender-1",
    receiverId: "receiver-1",
    content,
    isAnonymous: false,
    anonymousDisplayName: null,
    hashtagIds: ["tag-1"],
    images: [] as File[],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(crypto, "randomUUID").mockReturnValue("00000000-0000-0000-0000-000000000000");
});

describe("submitKudos", () => {
  it("calls createKudos with no images when none are attached", async () => {
    createKudosMock.mockResolvedValueOnce({ ok: true, id: "kudos-1" });
    const { submitKudos } = await import("../submit-kudos");

    const result = await submitKudos(baseInput());

    expect(uploadMock).not.toHaveBeenCalled();
    expect(createKudosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "00000000-0000-0000-0000-000000000000",
        images: [],
      }),
    );
    expect(result).toEqual({ ok: true, id: "kudos-1" });
  });

  it("uploads each image to its position-scoped path, in order, then calls createKudos", async () => {
    uploadMock.mockResolvedValue({ data: { path: "ok" }, error: null });
    createKudosMock.mockResolvedValueOnce({ ok: true, id: "kudos-1" });
    const { submitKudos } = await import("../submit-kudos");

    await submitKudos(baseInput({ images: [makeFile("first.jpg"), makeFile("second.png", "image/png")] }));

    expect(storageFromMock).toHaveBeenCalledWith("images");
    expect(uploadMock).toHaveBeenNthCalledWith(
      1,
      "kudos/sender-1/00000000-0000-0000-0000-000000000000/0-first.jpg",
      expect.any(File),
    );
    expect(uploadMock).toHaveBeenNthCalledWith(
      2,
      "kudos/sender-1/00000000-0000-0000-0000-000000000000/1-second.png",
      expect.any(File),
    );
    expect(createKudosMock).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          { storagePath: "kudos/sender-1/00000000-0000-0000-0000-000000000000/0-first.jpg", position: 0 },
          { storagePath: "kudos/sender-1/00000000-0000-0000-0000-000000000000/1-second.png", position: 1 },
        ],
      }),
    );
  });

  it("stops at the first failed upload, names its index, and never calls createKudos", async () => {
    uploadMock
      .mockResolvedValueOnce({ data: { path: "ok" }, error: null })
      .mockResolvedValueOnce({ data: null, error: { message: "network error" } });
    const { submitKudos } = await import("../submit-kudos");

    const result = await submitKudos(
      baseInput({ images: [makeFile("a.jpg"), makeFile("b.jpg"), makeFile("c.jpg")] }),
    );

    expect(result).toEqual({ ok: false, code: "upload-failed", failedIndex: 1 });
    expect(uploadMock).toHaveBeenCalledTimes(2);
    expect(createKudosMock).not.toHaveBeenCalled();
  });

  it("passes through createKudos's error result unchanged", async () => {
    createKudosMock.mockResolvedValueOnce({ ok: false, code: "invalid-draft", reason: "invalid-hashtag-count" });
    const { submitKudos } = await import("../submit-kudos");

    const result = await submitKudos(baseInput({ hashtagIds: [] }));

    expect(result).toEqual({ ok: false, code: "invalid-draft", reason: "invalid-hashtag-count" });
  });

  // Api-map dead-code finding: validate-image.ts's validateImages had zero
  // production call sites -- nothing stood behind the compose UI's own
  // inline filtering except the RPC's count guard and the bucket's mime
  // allow-list. submitKudos must re-run it server-of-truth-side (client
  // orchestration, but the last line of defense before any network call)
  // and refuse to upload a single byte on a rejected file set.
  it("rejects an unsupported mime type before attempting any upload", async () => {
    const { submitKudos } = await import("../submit-kudos");

    const result = await submitKudos(baseInput({ images: [makeFile("doc.pdf", "application/pdf")] }));

    expect(result).toEqual({ ok: false, code: "invalid-images", reason: "unsupported-type", index: 0 });
    expect(uploadMock).not.toHaveBeenCalled();
    expect(createKudosMock).not.toHaveBeenCalled();
  });

  it("rejects a 6th image before attempting any upload", async () => {
    const { submitKudos } = await import("../submit-kudos");

    const images = Array.from({ length: 6 }, (_, index) => makeFile(`img-${index}.jpg`));
    const result = await submitKudos(baseInput({ images }));

    expect(result).toEqual({ ok: false, code: "invalid-images", reason: "too-many-images" });
    expect(uploadMock).not.toHaveBeenCalled();
    expect(createKudosMock).not.toHaveBeenCalled();
  });
});
