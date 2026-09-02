"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { HashtagRef } from "@/lib/kudos/types";

/**
 * B.1.1_ButtonHashtag (2940:13459) + JWpsISMAaM "Dropdown Hashtag filter"
 * (563:8026 mms_A_Dropdown-List, chip items 186:1433/186:1496). Local
 * controlled dropdown: `isOpen`/`onOpenChange` are owned by `FilterBar` so
 * this panel and the department one stay mutually exclusive. Outside-click
 * / Escape-to-close mirrors `ui/dropdown.tsx`'s effect, duplicated locally
 * per the prompt (that primitive can't take external open-state control).
 */
export type HashtagFilterDropdownProps = {
  hashtags: HashtagRef[];
  selectedId: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (hashtagId: string) => void;
};

export function HashtagFilterDropdown({
  hashtags,
  selectedId,
  isOpen,
  onOpenChange,
  onSelect,
}: HashtagFilterDropdownProps) {
  const t = useTranslations("kudos");
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [isOpen, onOpenChange]);

  const selected = hashtags.find((tag) => tag.id === selectedId);

  return (
    <div ref={rootRef} className="relative">
      {/* mm:2940:13459 */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-testid="hashtag-filter-trigger"
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-2 rounded-chip border border-border-gold bg-gold-10 p-4 font-body text-base font-bold tracking-[0.15px] text-white"
      >
        {/* mm:I2940:13459;186:2760 */}
        <span>{selected ? `#${selected.name}` : t("filters.hashtagLabel")}</span>
        {/* mm:I2940:13459;186:2761 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </button>
      {isOpen && (
        // mm:563:8026
        <div
          role="menu"
          aria-label={t("filters.hashtagLabel")}
          data-testid="hashtag-filter-menu"
          className="absolute left-0 z-10 mt-1 flex max-h-80 w-64 flex-col gap-1 overflow-y-auto rounded-panel border border-border-gold bg-panel p-1.5"
        >
          {hashtags.map((tag) => {
            const isSelected = tag.id === selectedId;
            return (
              // mm:I563:8026;525:13508
              <button
                key={tag.id}
                type="button"
                role="menuitem"
                onClick={() => onSelect(tag.id)}
                style={isSelected ? { textShadow: "var(--shadow-glow-gold)" } : undefined}
                className={`flex items-center gap-1 rounded-chip px-4 py-4 text-left font-body text-base font-bold tracking-[0.5px] text-white ${
                  isSelected ? "bg-gold-10" : ""
                }`}
              >
                #{tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
