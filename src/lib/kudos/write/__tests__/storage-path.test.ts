import { describe, expect, it } from "vitest";
import { buildKudosImageStoragePath, verifyKudosImageStoragePath } from "../storage-path";

// Phase 05 (data-model.md Storage): path convention
// kudos/{sender_id}/{kudos_id}/{position}-{filename}. The verifier is the
// action's defense against a client attaching another Sunner's object path
// to its own kudos.
describe("buildKudosImageStoragePath", () => {
  it("builds the kudos/{sender}/{kudos}/{position}-{filename} path", () => {
    const path = buildKudosImageStoragePath({
      senderId: "sender-1",
      kudosId: "kudos-1",
      position: 0,
      fileName: "photo.jpg",
    });

    expect(path).toBe("kudos/sender-1/kudos-1/0-photo.jpg");
  });

  it("strips directory components from a hostile filename so it cannot escape its own segment", () => {
    const path = buildKudosImageStoragePath({
      senderId: "sender-1",
      kudosId: "kudos-1",
      position: 2,
      fileName: "../../etc/passwd",
    });

    expect(path).toBe("kudos/sender-1/kudos-1/2-passwd");
    expect(path.split("/")).toHaveLength(4);
  });

  it("falls back to a safe default when the filename sanitizes to nothing", () => {
    const path = buildKudosImageStoragePath({
      senderId: "sender-1",
      kudosId: "kudos-1",
      position: 0,
      fileName: "///",
    });

    expect(path).toBe("kudos/sender-1/kudos-1/0-file");
  });
});

describe("verifyKudosImageStoragePath", () => {
  it("accepts a path that matches the owning sender and kudos", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/sender-1/kudos-1/0-photo.jpg",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(true);
  });

  it("rejects a foreign sender prefix (hostile path)", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/someone-else/kudos-1/0-photo.jpg",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(false);
  });

  it("rejects a sender-id that is only a string prefix of the real one", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/sender-1-extra/kudos-1/0-photo.jpg",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(false);
  });

  it("rejects a kudos-id that is only a string prefix of the real one", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/sender-1/kudos-1-extra/0-photo.jpg",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(false);
  });

  it("rejects a path with a traversal segment", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/sender-1/kudos-1/../other-kudos/0-photo.jpg",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(false);
  });

  it("rejects a path that nests a second segment after the filename slot", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/sender-1/kudos-1/0-photo.jpg/extra",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(false);
  });

  it("rejects an empty filename segment", () => {
    expect(
      verifyKudosImageStoragePath({
        storagePath: "kudos/sender-1/kudos-1/",
        senderId: "sender-1",
        kudosId: "kudos-1",
      }),
    ).toBe(false);
  });
});
