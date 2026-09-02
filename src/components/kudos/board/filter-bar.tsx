"use client";

import { useState } from "react";
import type { HashtagRef } from "@/lib/kudos/types";
import { HashtagFilterDropdown } from "./hashtag-filter-dropdown";
import { DepartmentFilterDropdown } from "./department-filter-dropdown";

/**
 * B.1_Bộ lọc (2940:13458 "Buttons", MaZUn5xHXZ): the two filter triggers
 * side by side. Owns which of the two panels is open so opening one closes
 * the other (phase-04 assertion 2) -- `ui/dropdown.tsx` manages its own
 * open state internally with no external control, so this row and its two
 * dropdown children implement a small local controlled pattern instead of
 * reusing that primitive (see phase-04 prompt decision).
 */
export type KudosFilterValue = {
  hashtagId: string | null;
  department: string | null;
};

export type FilterBarProps = {
  hashtags: HashtagRef[];
  departments: string[];
  value: KudosFilterValue;
  onChange: (value: KudosFilterValue) => void;
};

type OpenFilter = "hashtag" | "department" | null;

export function FilterBar({ hashtags, departments, value, onChange }: FilterBarProps) {
  const [openFilter, setOpenFilter] = useState<OpenFilter>(null);

  return (
    // mm:2940:13458
    <div className="flex items-center gap-2">
      <HashtagFilterDropdown
        hashtags={hashtags}
        selectedId={value.hashtagId}
        isOpen={openFilter === "hashtag"}
        onOpenChange={(open) => setOpenFilter(open ? "hashtag" : null)}
        onSelect={(hashtagId) => {
          onChange({ ...value, hashtagId });
          setOpenFilter(null);
        }}
      />
      <DepartmentFilterDropdown
        departments={departments}
        selected={value.department}
        isOpen={openFilter === "department"}
        onOpenChange={(open) => setOpenFilter(open ? "department" : null)}
        onSelect={(department) => {
          onChange({ ...value, department });
          setOpenFilter(null);
        }}
      />
    </div>
  );
}
