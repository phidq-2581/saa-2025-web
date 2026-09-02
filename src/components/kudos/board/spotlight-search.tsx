"use client";

import { useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";

/**
 * B.7.3_Tìm kiếm sunner (2940:14833, componentId 186:2757) -- the Spotlight
 * search pill: 219x39px, border ~0.68px solid var(--Details-Border,
 * #998C5F) [--color-border-gold], background
 * var(--Details-SecondaryButton-Normal, rgba(255,234,158,.10))
 * [--color-gold-10], radius ~46.4px (pill, `rounded-full`). Icon child
 * I2940:14833;186:2759 (MM_MEDIA_Search, 16x16 SVG, fetched via
 * get_figma_image since it had no assets.md row) is inlined below per
 * code-rules.md 2a: original `fill="white"` swapped for `currentColor`.
 *
 * Validation (spec B.7.3 validationNote "Tối đa 100 ký tự" -> maxLength
 * error; empty submit -> "Vui lòng nhập từ khóa"): deliberately does NOT
 * set a native `maxLength` attribute -- Playwright's `fill()` can bypass
 * it, and the RED test fills 101 chars then presses Enter expecting the
 * error to become visible regardless. Length is instead checked in the
 * Enter handler against the full, untruncated controlled value. The error
 * `<p>` stays mounted at all times (`hidden` class toggle, not conditional
 * unmount) -- same convention as `fab-widget.tsx`'s menu.
 */
export function SpotlightSearch() {
  const t = useTranslations("kudos");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    if (value.trim().length === 0) {
      setError(t("spotlight.searchEmptyError"));
      return;
    }
    if (value.length > 100) {
      setError(t("spotlight.searchMaxLengthError"));
      return;
    }
    setError(null);
  }

  return (
    <div className="flex flex-col gap-1.5">
      {/* mm:2940:14833 */}
      <div className="flex h-[39px] w-[219px] items-center gap-1.5 rounded-full border border-border-gold bg-gold-10 px-3">
        {/* mm:I2940:14833;186:2759 */}
        <SearchIcon className="h-4 w-4 shrink-0 text-white" />
        {/* mm:I2940:14833;186:2760 */}
        <input
          type="text"
          data-testid="spotlight-search-input"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder={t("spotlight.searchPlaceholder")}
          aria-invalid={error !== null}
          className="w-full bg-transparent font-body text-xs font-medium text-white placeholder-white/70 focus:outline-none"
        />
      </div>
      <p
        data-testid="spotlight-search-error"
        role="alert"
        className={error ? "font-body text-xs text-badge" : "hidden font-body text-xs text-badge"}
      >
        {error}
      </p>
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path
        d="M9.5 3C11.2239 3 12.8772 3.68482 14.0962 4.90381C15.3152 6.12279 16 7.77609 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16C7.77609 16 6.12279 15.3152 4.90381 14.0962C3.68482 12.8772 3 11.2239 3 9.5C3 7.77609 3.68482 6.12279 4.90381 4.90381C6.12279 3.68482 7.77609 3 9.5 3ZM9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z"
        fill="currentColor"
      />
    </svg>
  );
}
