"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { KudosAuthor } from "@/lib/kudos/types";
import { IconChevronDown } from "./compose-icons";

export type RecipientAutocompleteProps = {
  value: KudosAuthor | null;
  recipients: KudosAuthor[];
  onChange: (recipient: KudosAuthor) => void;
};

/**
 * "Người nhận" field (mms_B_Chọn người nhận, 520:9871): required label +
 * search input (white bg, border #998C5F, radius 8, 56px tall) that
 * filters `MOCK_RECIPIENTS` (design-sourced Sunner pool) as the user
 * types. Options render in a page-reachable dropdown panel -- not a React
 * portal, but a normal absolutely-positioned panel, which is sufficient
 * for `page.locator()` discovery either way.
 */
export function RecipientAutocomplete({ value, recipients, onChange }: RecipientAutocompleteProps) {
  const t = useTranslations("compose.recipient");
  const [query, setQuery] = useState(value?.fullName ?? "");
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setTouched(true);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const matches = recipients.filter((person) =>
    (person.fullName ?? "").toLowerCase().includes(query.trim().toLowerCase()),
  );

  const select = (person: KudosAuthor) => {
    onChange(person);
    setQuery(person.fullName ?? "");
    setOpen(false);
  };

  const invalid = touched && !value;

  return (
    // mm:520:9871
    <div ref={rootRef} className="relative flex w-full items-center gap-4">
      {/* mm:I520:11647;520:9872 */}
      <span className="flex shrink-0 items-center gap-0.5 font-body text-[22px] font-bold text-canvas">
        {t("label")}
        <span className="text-[16px] text-[#CF1322]">*</span>
      </span>

      {/* mm:I520:11647;520:9873 */}
      <div className="relative flex-1">
        <div
          className={`flex h-14 items-center justify-between rounded-panel border bg-white px-6 py-4 ${
            invalid ? "border-[#CF1322]" : "border-border-gold"
          }`}
        >
          <input
            type="text"
            value={query}
            placeholder={t("placeholder")}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            data-testid="kudos-compose-recipient-input"
            className="w-full font-body text-base font-bold text-canvas outline-none placeholder:text-[#999999]"
          />
          <IconChevronDown className="shrink-0 text-[#999999]" />
        </div>

        {open && matches.length > 0 && (
          <div className="absolute left-0 z-20 mt-1 flex w-full flex-col gap-1 rounded-panel border border-border-gold bg-panel p-1.5">
            {matches.map((person) => (
              <button
                key={person.id}
                type="button"
                onClick={() => select(person)}
                data-testid="kudos-compose-recipient-option"
                className="rounded-xs px-4 py-2 text-left font-body text-base font-bold text-white hover:bg-gold-10"
              >
                {person.fullName}
              </button>
            ))}
          </div>
        )}
      </div>

      {invalid && (
        <p className="absolute -bottom-6 left-0 font-body text-sm font-bold text-[#CF1322]">
          {t("requiredError")}
        </p>
      )}
    </div>
  );
}
