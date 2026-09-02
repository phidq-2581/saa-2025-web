import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

/**
 * F002 FR-001 / BR-001_LocalePersistence: locale travels in the `NEXT_LOCALE`
 * cookie, no URL prefix (clarifications.md § i18n). Default is `vi`.
 */
export const LOCALE_COOKIE = "NEXT_LOCALE";
export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "vi";

/** S5: strict allow-list check -- an arbitrary cookie value must never
 * reach the dynamic `import()` below. */
export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}

/** Phase 07: one namespace per screen, plus the shared `common` chrome copy.
 * Phase 01 (round 2) registers empty `compose`/`kudos`/`profile` catalogues
 * ahead of the screens that fill them (03/04/06), so two concurrent phases
 * never edit the same shared file. */
const NAMESPACES = ["common", "login", "home", "awards", "compose", "kudos", "profile"] as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  const catalogs = await Promise.all(
    NAMESPACES.map((namespace) => import(`../../messages/${locale}/${namespace}.json`)),
  );

  return {
    locale,
    messages: Object.fromEntries(
      NAMESPACES.map((namespace, index) => [namespace, catalogs[index].default]),
    ),
  };
});
