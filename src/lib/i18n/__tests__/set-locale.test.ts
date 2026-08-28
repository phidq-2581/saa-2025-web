import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// F002 FR-001 / BR-001_LocalePersistence / S5: setLocale validates `locale`
// against the ['vi','en'] allow-list at the server-action boundary (a
// network-facing call, not just a TS-typed one) and falls back to `vi`
// rather than trusting the caller.
const cookieSet = vi.fn();
const revalidatePathMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ set: cookieSet })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (path: string) => revalidatePathMock(path),
}));

describe("setLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("writes the NEXT_LOCALE cookie with 1y/path/sameSite flags and revalidates the path", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { setLocale } = await import("../set-locale");

    await setLocale("en", "/he-thong-giai");

    expect(cookieSet).toHaveBeenCalledWith("NEXT_LOCALE", "en", {
      maxAge: 31536000,
      path: "/",
      sameSite: "lax",
      secure: false,
      httpOnly: false,
    });
    expect(revalidatePathMock).toHaveBeenCalledWith("/he-thong-giai");
  });

  it("falls back to 'vi' for a value outside the allow-list (S5)", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { setLocale } = await import("../set-locale");

    await setLocale("fr", "/");

    expect(cookieSet).toHaveBeenCalledWith("NEXT_LOCALE", "vi", expect.any(Object));
  });

  it("falls back to 'vi' for an empty string", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const { setLocale } = await import("../set-locale");

    await setLocale("", "/");

    expect(cookieSet).toHaveBeenCalledWith("NEXT_LOCALE", "vi", expect.any(Object));
  });

  it("sets secure:true only in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { setLocale } = await import("../set-locale");

    await setLocale("vi", "/");

    expect(cookieSet).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "vi",
      expect.objectContaining({ secure: true }),
    );
  });
});
