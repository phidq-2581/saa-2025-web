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
 * Sizes/colors traced via MCP: trigger 108x56 (padding 16, gap 2, radius 4),
 * panel border #998C5F, panel bg #00070C, selected item bg rgba(255,234,158,0.2).
 * Trigger inner group (Frame 485, gap 4) is a 24x24 icon box ("IC",
 * 186:1709) holding the 20x15 flag, then the 16px/700/24 label with
 * 0.15px letter-spacing -- the box, not the flag, sets the label's x.
 * Figma places the 24px chevron 1px INTO that group (group 1204-1257,
 * chevron from 1256: 77px of content in a 76px box), so the trigger has
 * no gap and the chevron a -1px margin -- otherwise it overflows 3px right.
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
      triggerClassName="flex h-14 w-[108px] items-center justify-between rounded-chip p-4 text-white"
      panelClassName="absolute right-0 z-10 mt-1 flex w-[119px] flex-col gap-1 rounded-panel border border-border-gold bg-panel p-1.5"
      trigger={() => (
        <>
          <span className="flex items-center gap-1">
            {locale === "vi" && (
              <span className="flex h-6 w-6 items-center justify-center">
                <img src="/nav/flag-vn.svg" alt="" width={20} height={15} aria-hidden="true" />
              </span>
            )}
            <span className="font-body text-base font-bold leading-6 tracking-[0.15px]">
              {LOCALE_LABEL[locale]}
            </span>
          </span>
          <img
            src="/nav/chevron-down.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
            className="-ml-px"
          />
        </>
      )}
    >
      {({ close }) => (
        <>
          <button
            type="button"
            data-testid="language-option"
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
            data-testid="language-option"
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
