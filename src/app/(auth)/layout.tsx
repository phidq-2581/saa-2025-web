import { LoginHeader } from "@/components/login/login-header";
import { LoginFooter } from "@/components/login/login-footer";

/**
 * Minimal shell for the `(auth)` route group (currently just `/login`) --
 * no SiteHeader/SiteFooter/FabWidget from the sibling `(site)` group.
 * Login spec items 1 & 3 define their own header/footer (MoMorph
 * GzbNeVGJHz), rendered here instead.
 *
 * Plain `children` prop, not `LayoutProps<"/login">`: Next's typed-route
 * union (used by the root layout's `LayoutProps<"/">`) is generated from
 * already-built routes and hasn't picked up this brand-new route group
 * yet, so the generic constraint rejects "/login" until a full build runs.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LoginHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <LoginFooter />
    </>
  );
}
