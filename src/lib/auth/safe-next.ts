// Raw C0 control characters (incl. \0, \r, \n) or any whitespace -- a
// value carrying one of these could smuggle extra header lines (CRLF
// injection) into the redirect response if ever concatenated by a caller.
const CONTROL_OR_WHITESPACE_PATTERN = /[\0\s]/;
// Percent-encoded CR/LF/NUL. `searchParams.get()` decodes one level of
// percent-encoding, so a single-encoded `%0d%0a` already becomes a raw
// CRLF caught by the pattern above -- this catches the still-encoded
// literal form too (e.g. a double-encoded value, or a caller that passes
// a not-yet-decoded string straight into safeNext), so both
// representations are rejected regardless of which one reaches here.
const ENCODED_CONTROL_PATTERN = /%0d|%0a|%00/i;

/**
 * FR-009 / S2: closes the open-redirect path the OAuth callback's `next`
 * round-trip would otherwise create. Accepts a value ONLY when it starts
 * with a single `/`, does not start with `//` (protocol-relative),
 * contains neither `://` nor a backslash (host-smuggling in some
 * browsers), and carries no control character, whitespace, or
 * percent-encoded CR/LF/NUL (response-header injection). Anything else --
 * including `javascript:` pseudo-schemes, absolute URLs, and empty input
 * -- resolves to `/`.
 */
export function safeNext(next: string | null | undefined): string {
  if (!next) {
    return "/";
  }

  if (!next.startsWith("/")) {
    return "/";
  }

  if (next.startsWith("//")) {
    return "/";
  }

  if (next.includes("://") || next.includes("\\")) {
    return "/";
  }

  if (CONTROL_OR_WHITESPACE_PATTERN.test(next) || ENCODED_CONTROL_PATTERN.test(next)) {
    return "/";
  }

  return next;
}
