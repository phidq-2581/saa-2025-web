"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

/**
 * B.1.2_Button Phong ban (2940:13460) + WXK5AYB_rG "Dropdown Phòng ban"
 * (563:8027 mms_A_Dropdown-List). Same chip-list component set as the
 * hashtag dropdown (186:1433/186:1496) but department codes render plain
 * (no "#" prefix -- confirmed against the WXK5AYB_rG node text, e.g.
 * "CEVC2"/"CEVC3"). Same local controlled open/close pattern as
 * `hashtag-filter-dropdown.tsx`; see that file's header for why it isn't
 * `ui/dropdown.tsx`.
 */
export type DepartmentFilterDropdownProps = {
  departments: string[];
  selected: string | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (department: string) => void;
};

export function DepartmentFilterDropdown({
  departments,
  selected,
  isOpen,
  onOpenChange,
  onSelect,
}: DepartmentFilterDropdownProps) {
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

  return (
    <div ref={rootRef} className="relative">
      {/* mm:2940:13460 */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        data-testid="dept-filter-trigger"
        onClick={() => onOpenChange(!isOpen)}
        className="flex h-14 items-center gap-2 rounded-chip bg-gold-10 p-4 font-body text-base font-bold leading-6 tracking-[0.15px] text-white shadow-[inset_0_0_0_1px_#998C5F]"
      >
        {/* mm:I2940:13460;186:2760 */}
        <span>{selected ?? t("filters.departmentLabel")}</span>
        {/* mm:I2940:13460;186:2761 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
        </svg>
      </button>
      {isOpen && (
        // mm:563:8027
        <div
          role="menu"
          aria-label={t("filters.departmentLabel")}
          data-testid="dept-filter-menu"
          className="absolute left-0 z-10 mt-1 flex max-h-96 w-56 flex-col gap-1 overflow-y-auto rounded-panel border border-border-gold bg-panel p-1.5"
        >
          {departments.map((department) => {
            const isSelected = department === selected;
            return (
              // mm:I563:8027;563:7956
              <button
                key={department}
                type="button"
                role="menuitem"
                data-testid="dept-filter-option"
                onClick={() => onSelect(department)}
                style={isSelected ? { textShadow: "var(--shadow-glow-gold)" } : undefined}
                className={`flex items-center gap-1 rounded-chip px-4 py-4 text-left font-body text-base font-bold tracking-[0.5px] text-white ${
                  isSelected ? "bg-gold-10" : ""
                }`}
              >
                {department}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
