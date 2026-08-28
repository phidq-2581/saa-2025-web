"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageDropdown, type Locale } from "./language-dropdown";

export type MobileNavLink = { label: string; href?: string };

export type MobileNavDrawerProps = {
  links: MobileNavLink[];
  locale: Locale;
  onSelectLocale?: (locale: Locale) => void;
};

/**
 * PROVISIONAL -- no MoMorph row covers the header below `md` (768px); this
 * pattern is a clarifications.md decision ("logo + bell + avatar + hamburger
 * button opening a drawer with the 3 links and the language switch"), built
 * only from tokens already pulled from MCP elsewhere on the header/dropdown.
 * Same status class as the minimal 404/403 pages.
 */
export function MobileNavDrawer({ links, locale, onSelectLocale }: MobileNavDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        data-testid="mobile-nav-toggle"
        aria-label="Open navigation menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 flex-col items-center justify-center gap-1"
      >
        <span className="h-0.5 w-6 bg-white" />
        <span className="h-0.5 w-6 bg-white" />
        <span className="h-0.5 w-6 bg-white" />
      </button>
      {open && (
        <div
          data-testid="mobile-nav-drawer"
          className="fixed inset-0 z-30 flex flex-col gap-6 bg-panel p-6"
        >
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="self-end font-body text-2xl text-white"
          >
            &times;
          </button>
          <nav className="flex flex-col gap-4">
            {links.map((link) =>
              link.href ? (
                <Link key={link.label} href={link.href} className="font-body text-base font-bold text-white">
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.label}
                  role="link"
                  tabIndex={0}
                  className="font-body text-base font-bold text-white"
                >
                  {link.label}
                </span>
              ),
            )}
          </nav>
          <LanguageDropdown locale={locale} onSelectLocale={onSelectLocale} />
        </div>
      )}
    </div>
  );
}
