import Link from "next/link";

/**
 * Persistent footer (Homepage 7: 7.1 logo, 7.2-7.4 nav links, 7.5 "Tiêu
 * chuẩn chung", copyright). Sizes/colors from MCP `list_frame_styles`
 * node 5001:14800: padding 40px 90px, logo 69x64, link group gap 48px,
 * copyright font "Montserrat Alternates" 16px/24px bold.
 * "Sun* Kudos" has no confirmed destination (BR-004); "Tiêu chuẩn chung"
 * renders only, no destination this round (clarifications.md).
 */
export function SiteFooter() {
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
          <span role="link" tabIndex={0} className="font-body text-base font-bold text-white">
            Sun* Kudos
          </span>
          <button type="button" className="font-body text-base font-bold text-white">
            Tiêu chuẩn chung
          </button>
        </nav>
      </div>
      <p className="font-heading text-base font-bold text-white">
        Bản quyền thuộc về Sun* © 2025
      </p>
    </footer>
  );
}
