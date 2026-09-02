"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HashtagRef } from "@/lib/kudos/types";
import { Dropdown } from "@/components/ui/dropdown";
import { IconPlus, IconClose } from "./compose-icons";

export type HashtagPickerProps = {
  selected: HashtagRef[];
  options: HashtagRef[];
  onChange: (next: HashtagRef[]) => void;
};

const MAX_HASHTAGS = 5;

/**
 * "Hashtag" field (mms_E_Frame 536, 520:9890) -- required label, "+
 * Hashtag" trigger opening the 13-tag picker (p9zO-c4a4x Dropdown list
 * hashtag, reusing the shared `Dropdown` open/close primitive), and chips
 * for already-added tags. The Viết Kudo frame's own Tag Group (662:8595)
 * only captures the empty state (single "+ Hashtag" child, no chip
 * sample) -- chips reuse the sibling dropdown screen's verified
 * "selected" treatment (bg-gold-20, radius-xs) as the closest sourced
 * visual for the same "hashtag selected" concept (design gap, delivery
 * report).
 */
export function HashtagPicker({ selected, options, onChange }: HashtagPickerProps) {
  const t = useTranslations("compose.hashtag");
  const [touched, setTouched] = useState(false);
  const atMax = selected.length >= MAX_HASHTAGS;
  const selectedIds = new Set(selected.map((tag) => tag.id));

  const toggle = (tag: HashtagRef) => {
    setTouched(true);
    if (selectedIds.has(tag.id)) {
      onChange(selected.filter((item) => item.id !== tag.id));
      return;
    }
    if (atMax) return;
    onChange([...selected, tag]);
  };

  return (
    // mm:520:9890
    <div className="flex w-full flex-col items-start gap-2" data-testid="kudos-compose-hashtag-picker">
      <div className="flex w-full items-start gap-4">
        {/* mm:I520:11647;520:9891 */}
        <span className="flex shrink-0 items-center gap-0.5 pt-1 font-body text-[22px] font-bold text-canvas">
          {t("label")}
          <span className="text-[16px] text-[#CF1322]">*</span>
        </span>

        {/* mm:I520:11647;662:8595 */}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Dropdown
            label={t("label")}
            triggerTestId="kudos-compose-hashtag-add"
            panelClassName="absolute left-0 z-20 mt-1 flex w-[318px] flex-col items-start gap-0 rounded-panel border border-border-gold bg-panel p-1.5"
            triggerClassName="flex h-12 items-center gap-2 rounded-panel border border-border-gold bg-white px-2 py-1 font-body text-[11px] font-bold leading-4 tracking-[0.5px] text-[#999999]"
            trigger={() => (
              <>
                <IconPlus className="h-6 w-6 shrink-0 text-[#999999]" />
                <span className="whitespace-pre-line text-left">
                  {t("addButtonLabel")}
                  {"\n"}
                  {t("addButtonNote")}
                </span>
              </>
            )}
          >
            {() =>
              options.map((tag) => {
                const isSelected = selectedIds.has(tag.id);
                const disabled = !isSelected && atMax;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggle(tag)}
                    disabled={disabled}
                    data-testid="kudos-compose-hashtag-option"
                    className={`flex w-full items-center justify-between gap-0.5 rounded-xs px-4 py-2 font-body text-base font-bold tracking-[0.15px] disabled:cursor-not-allowed disabled:opacity-40 ${
                      isSelected ? "bg-gold-20 text-white" : "text-white"
                    }`}
                  >
                    <span>#{tag.name}</span>
                    {isSelected && (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <path
                          d="M3 8.5L6.2 11.5L13 4.5"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })
            }
          </Dropdown>

          {selected.map((tag) => (
            // mm:hashtag-chip
            <span
              key={tag.id}
              data-testid="kudos-compose-hashtag-chip"
              className="flex items-center gap-1 rounded-xs bg-gold-20 px-4 py-2 font-body text-base font-bold tracking-[0.15px] text-canvas"
            >
              #{tag.name}
              <button
                type="button"
                onClick={() => toggle(tag)}
                data-testid="kudos-compose-hashtag-chip-remove"
                aria-label={tag.name}
                className="ml-1"
              >
                <IconClose className="h-3 w-3 text-canvas" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {touched && atMax && (
        <p data-testid="kudos-compose-hashtag-error" className="font-body text-sm font-bold text-[#CF1322]">
          {t("maxError")}
        </p>
      )}
      {touched && selected.length === 0 && !atMax && (
        <p data-testid="kudos-compose-hashtag-error" className="font-body text-sm font-bold text-[#CF1322]">
          {t("requiredError")}
        </p>
      )}
    </div>
  );
}
