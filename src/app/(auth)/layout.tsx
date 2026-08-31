import { getLocale } from "next-intl/server";
import { LoginHeader } from "@/components/login/login-header";
import { selectLocaleAction } from "@/lib/i18n/select-locale-action";
import { isLocale, defaultLocale } from "@/i18n/request";
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
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Phase 08 fix: the login header language dropdown was a no-op (rebuild-spec
  // W4 finding) -- resolve the live locale and inject the same server action
  // the (site) shell uses, so EN/VN switching works on /login too.
  const rawLocale = await getLocale();
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;
  return (
    <>
      <LoginHeader locale={locale} onSelectLocale={selectLocaleAction} />
      <main className="flex flex-1 flex-col">{children}</main>
      <LoginFooter />
    </>
  );
}
