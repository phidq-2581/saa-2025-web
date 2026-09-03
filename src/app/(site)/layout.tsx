import { SiteHeaderContainer } from "@/components/layout/site-header-container";
import { SiteFooter } from "@/components/layout/site-footer";
import { FabWidgetContainer } from "@/components/layout/fab-widget-container";
import { RulesPanelProvider } from "@/components/rules/rules-panel-context";

/**
 * Shell for every site page (header/footer/FAB). Split out of the root
 * layout so `/login` (in the sibling `(auth)` route group) can carry its
 * own minimal header/footer per the login spec (MoMorph GzbNeVGJHz, items
 * 1 & 3) without inheriting this full shell. Route groups don't affect
 * the URL, so `/` still resolves to this group's `page.tsx`.
 *
 * Header/FAB are server containers (Phase 07) that resolve the real
 * session + `profile.role` -- `SiteHeader`/`FabWidget` themselves stay the
 * plain, prop-driven client components Phase 02 shipped.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    // The Thể lệ panel's open state is shared by the footer trigger, the FAB
    // and the compose toolbar, so the provider wraps the whole shell.
    <RulesPanelProvider>
      <SiteHeaderContainer />
      {children}
      <SiteFooter />
      <FabWidgetContainer />
    </RulesPanelProvider>
  );
}
