import Link from "next/link";
import { getTranslations } from "next-intl/server";

// PROVISIONAL -- no Figma frame; tokens only (clarifications § Error state).
// Next.js needs a not-found.tsx regardless of screen-design status; this
// uses only design tokens already pulled from MCP into globals.css
// (--color-canvas, --color-gold, --color-border-gold, --radius-pill).
//
// Phase 07: `src/i18n/request.ts` now loads one namespace per catalog file
// (`{common, login, home, awards}`), so `notFound.*` lives under the
// `common` catalog at `common.notFound.*` rather than being a top-level
// namespace -- `getTranslations("common.notFound")` (a dot-path into the
// messages tree, which next-intl resolves the same as a plain namespace)
// keeps every `t("title")`/`t("description")`/`t("backHome")` call below
// unchanged.
export default async function NotFound() {
  const t = await getTranslations("common.notFound");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-6 py-24 text-center text-white">
      <p className="font-body text-sm font-bold uppercase tracking-widest text-gold">404</p>
      <h1 className="font-heading text-3xl font-bold">{t("title")}</h1>
      <p className="max-w-md font-body text-base text-white/80">{t("description")}</p>
      <Link
        href="/"
        className="mt-4 rounded-pill border border-border-gold px-6 py-3 font-body text-sm font-bold text-gold"
      >
        {t("backHome")}
      </Link>
    </main>
  );
}
