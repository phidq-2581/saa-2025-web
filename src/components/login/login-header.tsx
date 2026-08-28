import { LanguageDropdown } from "@/components/layout/language-dropdown";

/**
 * mms_A_Header (662:14391) -- SCR002_Header guest state stripped down to
 * just logo + language selector, no nav links / bell / account menu
 * (Login TC 8415b629). Fixed/sticky per spec item 1's description.
 *
 * Header bg is its own token, not a reuse of --color-header: MCP reports
 * a different value for this screen's header instance (rgba(11,15,18,.8)
 * here vs rgba(16,20,23,.8) on the homepage header, see globals.css).
 *
 * Logo is a plain <img>, not a <Link> -- TC b9805e65 calls it static,
 * non-interactive (unlike SiteHeader's linked logo).
 */
export function LoginHeader() {
  return (
    // mm:662:14391
    <header
      data-testid="login-header"
      className="fixed top-0 z-20 flex h-20 w-full items-center justify-between bg-header-login px-4 py-3 md:px-36"
    >
      {/* mm:I662:14391;186:2166 */}
      {/* mm:I662:14391;178:1033;178:1030 */}
      <img src="/nav/logo-header.png" alt="Sun* SAA logo" width={52} height={48} />

      {/* mm:I662:14391;186:1601 -- wrapper carries the E2E testid; the
          dropdown itself keeps its own "language-trigger" testid untouched */}
      <div data-testid="login-language-trigger">
        <LanguageDropdown locale="vi" />
      </div>
    </header>
  );
}
