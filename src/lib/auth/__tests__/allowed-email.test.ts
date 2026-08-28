import { describe, expect, it } from "vitest";
import { ALLOWED_EMAIL_DOMAIN, isAllowedEmail } from "../allowed-email";

// FR-BR-001: isAllowedEmail is a domain-only predicate (case-insensitive exact
// match on `sun-asterisk.com`), strict about shape — exactly one `@` and a
// non-empty local part, or it rejects outright. It intentionally does NOT
// validate full email format or Google's `email_verified` claim — that is a
// separate Phase 03 check. See plans/clarifications.md § Auth/authorization.
describe("isAllowedEmail", () => {
  const cases: Array<[email: string, expected: boolean, reason: string]> = [
    ["user@sun-asterisk.com", true, "exact domain match"],
    ["USER@SUN-ASTERISK.COM", true, "case-insensitive domain match"],
    ["user@sub.sun-asterisk.com", false, "subdomain is not the exact domain"],
    ["user@evil-sun-asterisk.com", false, "look-alike domain sharing a suffix, not the domain"],
    ["", false, "empty string has no domain segment"],
    ["no-at-sign", false, "missing @ means there is no domain segment"],
    [
      "a@b@sun-asterisk.com",
      false,
      "multiple @ signs — a malformed address must never pass, strict security predicate",
    ],
    ["@sun-asterisk.com", false, "empty local part before the @ is not a valid address"],
  ];

  it.each(cases)("isAllowedEmail(%j) -> %s (%s)", (email, expected) => {
    expect(isAllowedEmail(email)).toBe(expected);
  });

  it("exposes the allowed domain constant for reuse by callers", () => {
    expect(ALLOWED_EMAIL_DOMAIN).toBe("sun-asterisk.com");
  });
});
