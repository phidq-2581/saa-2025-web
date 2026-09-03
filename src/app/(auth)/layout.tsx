import { getLocale } from "next-intl/server";
import { LoginHeader } from "@/components/login/login-header";
import { LoginKeyvisual } from "@/components/login/login-keyvisual";
import { selectLocaleAction } from "@/lib/i18n/select-locale-action";
import { isLocale, defaultLocale } from "@/i18n/request";
import { LoginFooter } from "@/components/login/login-footer";

/**
 * Minimal shell for the `(auth)` route group (currently just `/login`) --
 * no SiteHeader/SiteFooter/FabWidget from the sibling `(site)` group.
 * Login spec items 1 & 3 define their own header/footer (MoMorph
 * GzbNeVGJHz), rendered here instead.
 *
 * The Login frame's keyvisual + gradient covers (662:14388/14392/14390)
 * span the full 1440x1024 canvas, footer strip included, so they are
 * painted once here as an absolute layer behind header, main and footer
 * (`overflow-hidden` clips the 1093px-tall bottom cover). `main` and the
 * footer are positioned so DOM order keeps them above that layer.
 *
 * Plain `children` prop, not `LayoutProps<"/login">`: Next's typed-route
 * union (used by the root layout's `LayoutProps<"/">`) is generated from
 * already-built routes and hasn't picked up this brand-new route group
 * yet, so the generic constraint rejects "/login" until a full build runs.
 */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Phase 08 fix: the login header language dropdown was a no-op (rebuild-spec
  // W4 finding) -- resolve the live locale and inject the same server action
  // the (site) shell uses, so EN/VN switching works on /login too.
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <LoginKeyvisual />
      <LoginHeader locale={locale} onSelectLocale={selectLocaleAction} />
      <main className="relative flex flex-1 flex-col">{children}</main>
      <LoginFooter />
    </div>
  );
}
