import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile/get-current-profile";
import { getRecipients } from "@/lib/kudos/queries/get-recipients";
import { getFilterOptions } from "@/lib/kudos/queries/get-filter-options";
import { FabWidget } from "./fab-widget";
import { RulesPanel } from "@/components/rules/rules-panel";

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
    // No FAB for a guest, but the footer's "Tiêu chuẩn chung" still opens the
    // Thể lệ panel -- with "Viết KUDOS" in its disabled state (no session).
    return (
      <>
        <FabWidget visible={false} />
        <RulesPanel writeDisabled />
      </>
    );
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
