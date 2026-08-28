import { describe, expect, it } from "vitest";
import { safeNext } from "../safe-next";

// FR-009 / S2 (red-team security-adversary): `next` closes the open-redirect
// path the callback's round-trip `next` param would otherwise create.
// Accept only a single leading `/`, never `//`, never `://`, never `\`.
describe("safeNext", () => {
  const hostileCases: Array<[value: string, reason: string]> = [
    ["https://evil.tld", "absolute URL with a scheme"],
    ["//evil.tld", "protocol-relative URL (double leading slash)"],
    ["/\\evil", "backslash used to smuggle a host in some browsers"],
    ["javascript:alert(1)", "javascript: pseudo-scheme"],
    ["http://x", "absolute http URL"],
    ["", "empty string has no leading slash to accept"],
    ["/he-thong-giai\r\nSet-Cookie: x=1", "raw CRLF -- HTTP response-header/CRLF injection"],
    ["/x\n", "raw trailing newline"],
    ["/x ", "raw whitespace"],
    ["/%0d%0aevil", "percent-encoded CRLF -- still rejected even when not yet decoded"],
    ["/x\0evil", "raw NUL byte"],
  ];

  it.each(hostileCases)("safeNext(%j) -> '/' (%s)", (value) => {
    expect(safeNext(value)).toBe("/");
  });

  it("accepts a plain in-app path", () => {
    expect(safeNext("/he-thong-giai")).toBe("/he-thong-giai");
  });

  it("accepts an in-app path with a hash anchor (award category deep link)", () => {
    expect(safeNext("/he-thong-giai#mvp")).toBe("/he-thong-giai#mvp");
  });

  it("falls back to '/' for undefined input", () => {
    expect(safeNext(undefined)).toBe("/");
  });

  it("falls back to '/' for null input", () => {
    expect(safeNext(null)).toBe("/");
  });
});
