import type { User } from "@supabase/supabase-js";

/**
 * FR-008 / S3: `isAllowedEmail` proves the domain, not the identity. An
 * unverified Google address on the right domain must still be rejected.
 * Unverified when EITHER `user.email_confirmed_at` is null/undefined OR the
 * (first, Google) identity's `identity_data.email_verified !== true`.
 */
export function emailVerified(user: User): boolean {
  if (!user.email_confirmed_at) {
    return false;
  }

  const identity = user.identities?.[0];
  if (!identity) {
    return false;
  }

  return identity.identity_data?.email_verified === true;
}
