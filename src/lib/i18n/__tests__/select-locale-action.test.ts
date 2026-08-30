import { beforeEach, describe, expect, it, vi } from "vitest";

// F002 FR-001: selectLocaleAction is the module-level Server Action wrapper
// dropdowns invoke -- it recovers `pathname` from the Referer header (a
// Server Action has no route param of its own) and delegates the untrusted
// `locale` value straight to `setLocale`, which owns allow-list validation.
const setLocaleMock = vi.fn();
const headersGet = vi.fn();

vi.mock("../set-locale", () => ({
  setLocale: (...args: unknown[]) => setLocaleMock(...args),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => ({ get: headersGet })),
}));

describe("selectLocaleAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("derives pathname from the Referer header and forwards it to setLocale", async () => {
    headersGet.mockReturnValue("http://localhost:3000/he-thong-giai#mvp");
    const { selectLocaleAction } = await import("../select-locale-action");

    await selectLocaleAction("en");

    expect(setLocaleMock).toHaveBeenCalledWith("en", "/he-thong-giai");
  });

  it("falls back to '/' when the Referer header is absent", async () => {
    headersGet.mockReturnValue(null);
    const { selectLocaleAction } = await import("../select-locale-action");

    await selectLocaleAction("vi");

    expect(setLocaleMock).toHaveBeenCalledWith("vi", "/");
  });
});
