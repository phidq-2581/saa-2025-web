import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile/get-current-profile";
import { getRecipients } from "@/lib/kudos/queries/get-recipients";
import { getFilterOptions } from "@/lib/kudos/queries/get-filter-options";
import { FabWidget } from "./fab-widget";

/**
 * Server container for `FabWidget` -- renders only for an authenticated
 * user (SCR004_Fab hidden state). Session/profile lookup mirrors
 * `SiteHeaderContainer`'s so the header and FAB never disagree about
 * whether the visitor is signed in.
 *
 * Phase 07: also resolves the compose dialog's real data (recipients,
 * hashtags, the viewer's own id) since the FAB is the site-wide entry
 * point for "Viết KUDOS" -- every page, not just `/kudos`, must be able to
 * open a fully wired dialog. Skipped entirely for a guest (`profile` null)
 * since the dialog never renders without a viewer id anyway.
 */
export async function FabWidgetContainer() {
  const profile = await getCurrentProfile();
  if (!profile) {
    return <FabWidget visible={false} />;
  }

  const supabase = await createClient();
  const [{ data: claimsData }, { hashtags }, recipients] = await Promise.all([
    supabase.auth.getClaims(),
    getFilterOptions(),
    getRecipients(),
  ]);
  const currentViewerId = (claimsData?.claims?.sub as string | undefined) ?? "";

  return (
    <FabWidget visible recipients={recipients} hashtags={hashtags} currentViewerId={currentViewerId} />
  );
}
