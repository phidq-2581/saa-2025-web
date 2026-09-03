"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AccountMenu, type AccountUser } from "./account-menu";
import { LanguageDropdown, type Locale } from "./language-dropdown";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import { NotificationBell } from "./notification-bell";

export type SiteHeaderProps = {
  variant: "guest" | "authed";
  locale: Locale;
  user?: AccountUser;
  unreadCount?: number;
  onSelectLocale?: (locale: Locale) => void;
};

const NAV_LINKS: { label: string; href?: string }[] = [
  { label: "About SAA 2025", href: "/" },
  { label: "Awards Information", href: "/he-thong-giai" },
  // Round 2: /kudos exists — the round-1 "no confirmed destination" (BR-004)
  // rendering is superseded by the shipped Sun* Kudos Live board.
  { label: "Sun* Kudos", href: "/kudos" },
];

/**
 * Persistent header (Homepage A1: A1.1 logo, A1.2/A1.3/A1.5 nav links,
 * A1.6 bell, A1.7 language, A1.8 account). Sizes/colors from MCP
 * `list_frame_styles("i87tDx10uM")` node 2167:9091 -- bg rgba(16,20,23,.8),
 * h-80px, padding 12px 144px at desktop; logo->nav gap 64 (Frame 488),
 * nav gap 24 (Frame 476). Each nav item is a 52px-tall button with 16px
 * horizontal padding (186:1579/1587/1593) around a 14px/700/20px label with
 * 0.1px letter-spacing; the selected state swaps the 4px radius for a 1px
 * gold bottom rule plus gold text with the shared glow. The rule is an
 * inset box-shadow, not a border, so the label stays at y30 like the others.
 * Nav links render regardless of `variant` (public content, per Homepage
 * TC ID-0). The bell and account trigger are the authenticated delta (TC
 * ID-1/ID-11 both assume a signed-in session; Login's guest header shows
 * only logo + language) -- both are variant-gated, the bell on `variant`
 * alone and the account trigger additionally needing a `user`. Mobile `<md`
 * padding (px-4) is a layout value, not a Figma value, per the breakpoint
 * clarification's own reasoning -- no MoMorph mobile frame exists.
 */
export function SiteHeader({
  variant,
  locale,
  user,
  unreadCount = 0,
  onSelectLocale,
}: SiteHeaderProps) {
  const pathname = usePathname();

  return (
    <header
      data-testid="site-header"
      className="fixed top-0 z-20 flex h-20 w-full items-center justify-between gap-4 bg-header px-4 py-3 md:px-36"
    >
      <div className="flex items-center gap-16">
        <Link href="/">
          <img src="/nav/logo-header.png" alt="Sun* SAA logo" width={52} height={48} />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.href !== undefined && pathname === link.href;
            const linkClassName = `flex h-[52px] items-center px-4 font-body text-sm font-bold leading-5 tracking-[0.1px] ${
              active
                ? "text-gold shadow-[inset_0_-1px_0_#FFEA9E] [text-shadow:var(--shadow-glow-gold)]"
                : "rounded-chip text-white"
            }`;
            return link.href ? (
              <Link key={link.label} href={link.href} className={linkClassName}>
                {link.label}
              </Link>
            ) : (
              <span key={link.label} role="link" tabIndex={0} className={linkClassName}>
                {link.label}
              </span>
            );
          })}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        {variant === "authed" && <NotificationBell unreadCount={unreadCount} />}
        <div className="hidden md:block">
          <LanguageDropdown locale={locale} onSelectLocale={onSelectLocale} />
        </div>
        {variant === "authed" && user && <AccountMenu user={user} />}
        <MobileNavDrawer links={NAV_LINKS} locale={locale} onSelectLocale={onSelectLocale} />
      </div>
    </header>
  );
}
