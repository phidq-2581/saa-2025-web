import { describe, expect, it } from "vitest";
import { emailVerified } from "../email-verified";
import type { User } from "@supabase/supabase-js";

// FR-008 / S3 (red-team security-adversary): a Google address on the right
// domain must still be rejected when Google itself has not verified it.
// Unverified when EITHER `user.email_confirmed_at` is null OR the identity's
// `identity_data.email_verified !== true`.
function buildUser(overrides: {
  emailConfirmedAt: string | null;
  identityEmailVerified: boolean | undefined;
}): User {
  return {
    id: "00000000-0000-0000-0000-000000000000",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
    email_confirmed_at: overrides.emailConfirmedAt ?? undefined,
    identities: [
      {
        id: "identity-1",
        user_id: "00000000-0000-0000-0000-000000000000",
        identity_id: "identity-1",
        provider: "google",
        identity_data: { email_verified: overrides.identityEmailVerified },
        created_at: "2026-01-01T00:00:00Z",
        last_sign_in_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
    ],
  } as unknown as User;
}

describe("emailVerified", () => {
  it("rejects when email_confirmed_at is null", () => {
    const user = buildUser({ emailConfirmedAt: null, identityEmailVerified: true });
    expect(emailVerified(user)).toBe(false);
  });

  it("rejects when the Google identity's email_verified is false", () => {
    const user = buildUser({
      emailConfirmedAt: "2026-01-01T00:00:00Z",
      identityEmailVerified: false,
    });
    expect(emailVerified(user)).toBe(false);
  });

  it("rejects when the Google identity's email_verified is missing", () => {
    const user = buildUser({
      emailConfirmedAt: "2026-01-01T00:00:00Z",
      identityEmailVerified: undefined,
    });
    expect(emailVerified(user)).toBe(false);
  });

  it("accepts when both email_confirmed_at is set and the identity is verified", () => {
    const user = buildUser({
      emailConfirmedAt: "2026-01-01T00:00:00Z",
      identityEmailVerified: true,
    });
    expect(emailVerified(user)).toBe(true);
  });

  it("rejects when there is no identity at all", () => {
    const user = buildUser({ emailConfirmedAt: "2026-01-01T00:00:00Z", identityEmailVerified: true });
    user.identities = [];
    expect(emailVerified(user)).toBe(false);
  });
});
