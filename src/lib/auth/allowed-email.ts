/**
 * FR-BR-001: domain-only allow-list predicate for sign-in.
 *
 * `isAllowedEmail` is domain-only BY DESIGN — it does not validate email
 * format and it does not check Google's `email_verified` claim. Verifying
 * the address is confirmed by Google is a separate, later check (Phase 03,
 * server-side at the OAuth callback). Folding that in here would blur two
 * distinct responsibilities: "which domain is allowed" vs "is this address
 * actually the user's".
 *
 * See plans/clarifications.md § Auth/authorization.
 */
export const ALLOWED_EMAIL_DOMAIN = "sun-asterisk.com";

/**
 * Returns true only when `email` ends in `@sun-asterisk.com`, case-insensitive.
 *
 * Strict by design: this is a security predicate, so a malformed address
 * must never pass. It requires EXACTLY one `@` and a non-empty local part
 * before comparing the domain — a multi-`@` value like
 * `a@b@sun-asterisk.com` or an empty local part like `@sun-asterisk.com`
 * is rejected outright rather than evaluated on a trailing segment.
 */
export function isAllowedEmail(email: string): boolean {
  const atCount = (email.match(/@/g) ?? []).length;
  if (atCount !== 1) {
    return false;
  }

  const [localPart, domainPart] = email.split("@");
  if (!localPart) {
    return false;
  }

  const domain = domainPart.trim().toLowerCase();
  return domain === ALLOWED_EMAIL_DOMAIN;
}
