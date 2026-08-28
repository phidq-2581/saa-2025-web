import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FabWidget } from "@/components/layout/fab-widget";

/**
 * Shell for every site page (header/footer/FAB). Split out of the root
 * layout so `/login` (in the sibling `(auth)` route group) can carry its
 * own minimal header/footer per the login spec (MoMorph GzbNeVGJHz, items
 * 1 & 3) without inheriting this full shell. Route groups don't affect
 * the URL, so `/` still resolves to this group's `page.tsx`.
 */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader variant="guest" locale="vi" />
      {children}
      <SiteFooter />
      <FabWidget />
    </>
  );
}
