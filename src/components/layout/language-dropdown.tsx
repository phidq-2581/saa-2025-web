"use client";

import { Dropdown } from "@/components/ui/dropdown";

export type Locale = "vi" | "en";

export type LanguageDropdownProps = {
  locale: Locale;
  onSelectLocale?: (locale: Locale) => void;
};

const LOCALE_LABEL: Record<Locale, string> = { vi: "VN", en: "EN" };

/**
 * Language switcher (Homepage A1.7 trigger + hUyaaugye2 dropdown panel).
 * Sizes/colors traced via MCP: trigger 108x56, panel border #998C5F,
 * panel bg #00070C, selected item bg rgba(255,234,158,0.2).
 * The EN option's GB flag icon has no exportable MM_MEDIA asset and both
 * get_media_file/get_figma_image fallbacks 500'd -- rendered as a text-only
 * chip instead of guessing a flag graphic (see delivery report).
 */
export function LanguageDropdown({ locale, onSelectLocale }: LanguageDropdownProps) {
  return (
    <Dropdown
      label="Language"
      triggerTestId="language-trigger"
      panelTestId="language-menu"
      triggerClassName="flex h-14 w-[108px] items-center justify-between gap-0.5 rounded-chip p-4 text-white"
      panelClassName="absolute right-0 z-10 mt-1 flex w-[119px] flex-col gap-1 rounded-panel border border-border-gold bg-panel p-1.5"
      trigger={() => (
        <>
          <span className="flex items-center gap-1">
            {locale === "vi" && (
              <img src="/nav/flag-vn.svg" alt="" width={24} height={15} aria-hidden="true" />
            )}
            <span className="font-body text-base font-bold">{LOCALE_LABEL[locale]}</span>
          </span>
          <img src="/nav/chevron-down.svg" alt="" width={24} height={24} aria-hidden="true" />
        </>
      )}
    >
      {({ close }) => (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectLocale?.("vi");
              close();
            }}
            className={`flex h-14 w-[108px] items-center justify-between gap-0.5 rounded-xs p-4 font-body text-base font-bold text-white ${
              locale === "vi" ? "bg-gold-20" : ""
            }`}
          >
            <span className="flex items-center gap-1">
              <img src="/nav/flag-vn.svg" alt="Vietnam flag" width={20} height={15} />
              VN
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              onSelectLocale?.("en");
              close();
            }}
            className={`flex h-14 w-[110px] items-center justify-between gap-0.5 rounded-xs p-4 font-body text-base font-bold text-white ${
              locale === "en" ? "bg-gold-20" : ""
            }`}
          >
            EN
          </button>
        </>
      )}
    </Dropdown>
  );
}
