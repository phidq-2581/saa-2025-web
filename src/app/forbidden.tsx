import Link from "next/link";
import { getTranslations } from "next-intl/server";

// PROVISIONAL -- no Figma frame; tokens only (clarifications § Error state).
// Same tokens as not-found.tsx, for the 403 case. No route in this round
// is admin-only (permissions.md § Route Access Matrix), so nothing calls
// Next's `forbidden()` yet -- this file exists ready for the first phase
// that adds an admin-gated route.
//
// Phase 07: see not-found.tsx's docblock -- `forbidden.*` now lives at
// `common.forbidden.*` under the namespaced message tree.
export default async function Forbidden() {
  const t = await getTranslations("common.forbidden");

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-canvas px-6 py-24 text-center text-white">
      <p className="font-body text-sm font-bold uppercase tracking-widest text-gold">403</p>
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
