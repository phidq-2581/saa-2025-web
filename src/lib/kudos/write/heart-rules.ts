/**
 * Phase 05 (F006 BR-006/BR-007, DEC-001_HeartToggleFlow). Pure heart-grant
 * rules, kept out of `toggle-heart-action.ts` ("use server" files export
 * only async actions -- Group-3 review fix). `granted_amount` has no
 * client-writable path: the action reads `special_days` itself, server-side,
 * in Asia/Ho_Chi_Minh (Supabase's `current_date` is UTC -- a naive compare
 * is 7h out of phase around VN midnight). There is no stored `heart_total`
 * column (data-model.md) -- a revoke's "amount" only ever needs to be read
 * back from the row actually deleted, never assumed.
 */

export function computeHoChiMinhDateString(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function computeGrantAmount(nowUtc: Date, specialDays: readonly string[]): 1 | 2 {
  const vnDate = computeHoChiMinhDateString(nowUtc);
  return specialDays.includes(vnDate) ? 2 : 1;
}

/** Named on purpose: the revoke amount is always read off the row actually
 *  deleted, never hardcoded to 1 -- see BR-007_HeartRevokeReturnsGranted. */
export function resolveRevokedAmount(existingHeart: { grantedAmount: number }): number {
  return existingHeart.grantedAmount;
}
