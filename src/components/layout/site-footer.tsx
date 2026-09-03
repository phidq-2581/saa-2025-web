import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { RulesTriggerButton } from "@/components/rules/rules-trigger-button";

/**
 * Persistent footer (Homepage 7: 7.1 logo, 7.2-7.4 nav links, 7.5 "Tiêu
 * chuẩn chung", copyright). Sizes/colors from MCP `list_frame_styles`
 * node 5001:14800: 144px tall INCLUDING its 1px top rule
 * var(--Details-Divider, #2E3940) (Figma strokes sit inside the box, so the
 * desktop height is fixed rather than derived from `padding: 40px 90px` +
 * a border). The two groups are `justify-content: space-between` with no
 * gap of their own -- at the 1440 canvas only 14px separates them, so any
 * horizontal gap here would wrap the copyright onto a second line. Logo 69x64, logo->links gap 80 (Frame
 * 488), link gap 48 (Frame 476). Each link is a 56px button with 16px
 * padding (342:1410-1412, 1161:9487) around a 16px/700/24px label with
 * 0.15px letter-spacing; copyright is "Montserrat Alternates" 16px/24px bold.
 * The canvas paints "Award Information" with a 10% gold fill + glow -- that
 * is a captured hover state (the header marks About SAA 2025 as the current
 * page), so it is not reproduced as a static style.
 * "Tiêu chuẩn chung" opens the Thể lệ panel (b1Filzi9i6) since 2026-09-03 --
 * one of its three triggers, see rules-panel-context.tsx.
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
  const linkClassName =
    "flex h-14 items-center px-4 font-body text-base font-bold leading-6 tracking-[0.15px] text-white";

  return (
    <footer
      data-testid="site-footer"
      className="flex flex-wrap items-center justify-between gap-y-10 border-t border-divider px-6 py-10 md:h-36 md:flex-nowrap md:px-[90px] md:py-0"
    >
      <div className="flex flex-wrap items-center gap-10 md:gap-20">
        <Link href="/">
          <img src="/nav/logo-footer.png" alt="Sun* SAA logo" width={69} height={64} />
        </Link>
        <nav className="flex flex-wrap items-center gap-6 md:gap-12">
          <Link href="/" className={linkClassName}>
            About SAA 2025
          </Link>
          <Link href="/he-thong-giai" className={linkClassName}>
            Awards Information
          </Link>
          <Link href="/kudos" className={linkClassName}>
            Sun* Kudos
          </Link>
          {/* mm:I5001:14800;1161:9487 -- opens the Thể lệ panel (clarifications 2026-09-03) */}
          <RulesTriggerButton className={linkClassName}>{t("footer.generalStandards")}</RulesTriggerButton>
        </nav>
      </div>
      <p className="font-heading text-base font-bold leading-6 text-white">{t("footer.copyright")}</p>
    </footer>
  );
}
