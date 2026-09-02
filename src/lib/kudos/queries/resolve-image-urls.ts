import { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const IMAGES_BUCKET = "images";
/** Matches the modal's own attachment lifetime expectation -- long enough
 *  for one page view/session, short enough that a leaked URL goes stale. */
const SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Phase 07 (F006): `kudos.imagePaths` holds bare storage object paths
 * (`kudos/{senderId}/{kudosId}/{position}-{fileName}`, Phase 05
 * `storage-path.ts`), not browser-loadable URLs -- the `images` bucket is
 * private (`supabase/config.toml` `[storage.buckets.images] public = false`,
 * Phase 01), so a plain `getPublicUrl()` would hand `<img>` a URL the
 * storage API rejects. Signed URLs are the private-bucket equivalent that a
 * plain `<img src>` can still load with no extra headers. Returns `[]` (not
 * a throw) on failure or an empty input -- an image row that never resolves
 * disappears from the card instead of breaking the whole render (mirrors
 * every other query's degrade-on-error convention).
 */
export async function resolveImageUrls(supabase: SupabaseServerClient, paths: string[]): Promise<string[]> {
  if (paths.length === 0) {
    return [];
  }

  const { data, error } = await supabase.storage.from(IMAGES_BUCKET).createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error("resolveImageUrls: failed to sign image paths", error);
    return [];
  }

  return data.map((entry) => entry.signedUrl).filter((url): url is string => Boolean(url));
}
