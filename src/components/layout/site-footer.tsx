import Link from "next/link";
import { getTranslations } from "next-intl/server";

/**
 * Persistent footer (Homepage 7: 7.1 logo, 7.2-7.4 nav links, 7.5 "Tiêu
 * chuẩn chung", copyright). Sizes/colors from MCP `list_frame_styles`
 * node 5001:14800: padding 40px 90px, logo 69x64, link group gap 48px,
 * copyright font "Montserrat Alternates" 16px/24px bold.
 * "Sun* Kudos" has no confirmed destination (BR-004); "Tiêu chuẩn chung"
 * renders only, no destination this round (clarifications.md).
 *
 * The three nav labels ("About SAA 2025"/"Awards Information"/"Sun*
 * Kudos") are already-English design copy, identical in both locales
 * (`e2e/navigation-shell.spec.ts` asserts this exact text with no locale
 * switch) -- they stay plain literals, not translation keys, per the EN
 * copy rule's "already English... copy through unchanged." Copyright and
 * "Tiêu chuẩn chung" DO change between locales, so they're the only two
 * strings routed through `common.footer` (shared with `login-footer.tsx`,
 * `getTranslations` -- this component has no existing synchronous
 * `@testing-library/react` render, so `async` is safe here; see
 * `hero-section.tsx`'s docblock for the components where it is not).
 */
export async function SiteFooter() {
  const t = await getTranslations("common");

  return (
    <footer
      data-testid="site-footer"
      className="flex flex-wrap items-center justify-between gap-10 px-6 py-10 md:px-[90px]"
    >
      <div className="flex flex-wrap items-center gap-10 md:gap-20">
        <Link href="/">
          <img src="/nav/logo-footer.png" alt="Sun* SAA logo" width={69} height={64} />
        </Link>
        <nav className="flex flex-wrap items-center gap-6 md:gap-12">
          <Link href="/" className="font-body text-base font-bold text-white">
            About SAA 2025
          </Link>
          <Link href="/he-thong-giai" className="font-body text-base font-bold text-white">
            Awards Information
          </Link>
          <Link href="/kudos" className="font-body text-base font-bold text-white">
            Sun* Kudos
          </Link>
          <button type="button" className="font-body text-base font-bold text-white">
            {t("footer.generalStandards")}
          </button>
        </nav>
      </div>
      <p className="font-heading text-base font-bold text-white">{t("footer.copyright")}</p>
    </footer>
  );
}
