import { getCurrentProfile } from "@/lib/profile/get-current-profile";
import { FabWidget } from "./fab-widget";

/**
 * Server container for `FabWidget` -- renders only for an authenticated
 * user (SCR004_Fab hidden state). Session/profile lookup mirrors
 * `SiteHeaderContainer`'s so the header and FAB never disagree about
 * whether the visitor is signed in.
 */
export async function FabWidgetContainer() {
  const profile = await getCurrentProfile();
  return <FabWidget visible={!!profile} />;
}
