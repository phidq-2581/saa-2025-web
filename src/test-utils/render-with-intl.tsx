import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import commonVi from "../../messages/vi/common.json";
import commonEn from "../../messages/en/common.json";
import loginVi from "../../messages/vi/login.json";
import loginEn from "../../messages/en/login.json";
import homeVi from "../../messages/vi/home.json";
import homeEn from "../../messages/en/home.json";
import awardsVi from "../../messages/vi/awards.json";
import awardsEn from "../../messages/en/awards.json";
import kudosVi from "../../messages/vi/kudos.json";
import kudosEn from "../../messages/en/kudos.json";
import composeVi from "../../messages/vi/compose.json";
import composeEn from "../../messages/en/compose.json";
import profileVi from "../../messages/vi/profile.json";
import profileEn from "../../messages/en/profile.json";

export type SupportedLocale = "vi" | "en";

/**
 * Real message catalogs keyed by namespace, mirroring `src/i18n/request.ts`'s
 * NAMESPACES list -- so any component under test resolves the exact same
 * namespace/key shape it would at runtime. Never a hand-rolled stub catalog:
 * Phase 07b's contract is that VN output must not change by a single
 * character, which only the real JSON can guarantee.
 */
const CATALOGS: Record<SupportedLocale, Record<string, unknown>> = {
  vi: { common: commonVi, login: loginVi, home: homeVi, awards: awardsVi, kudos: kudosVi, compose: composeVi, profile: profileVi },
  en: { common: commonEn, login: loginEn, home: homeEn, awards: awardsEn, kudos: kudosEn, compose: composeEn, profile: profileEn },
};

export type RenderWithIntlOptions = Omit<RenderOptions, "wrapper"> & {
  /** Defaults to "vi" -- the app's default locale (src/i18n/request.ts). */
  locale?: SupportedLocale;
};

/**
 * Renders `ui` inside a real `NextIntlClientProvider` carrying the actual
 * `messages/<locale>/*.json` catalogs.
 *
 * Vitest runs under Vite (no "react-server" build condition), so
 * `useTranslations` always resolves to next-intl's context-based Client
 * Component implementation here -- even for components that behave as
 * plain Server Components at runtime under Next.js's own bundler. Every
 * screen component calling `useTranslations` therefore needs this wrapper
 * in tests; a "No intl context found" error means a render call is still
 * using bare `render()`, not a reason to change the component itself.
 */
export function renderWithIntl(
  ui: ReactElement,
  { locale = "vi", ...options }: RenderWithIntlOptions = {},
): RenderResult {
  return render(ui, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale={locale} messages={CATALOGS[locale]}>
        {children}
      </NextIntlClientProvider>
    ),
    ...options,
  });
}
