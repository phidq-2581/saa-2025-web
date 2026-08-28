/**
 * Pure decision for the scroll-spy nav (BR-001/BR-002/BR-003, F004
 * technical-spec SM-001). Kept isolated from `AwardCategoryNav` so the
 * hash -> active-slug rule is unit-testable without mounting a component
 * or touching `window`.
 */
export function resolveActiveSlug(
  hash: string | null | undefined,
  slugs: readonly string[],
): string | null {
  if (!hash) return null;
  const normalized = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!normalized) return null;
  return slugs.includes(normalized) ? normalized : null;
}
