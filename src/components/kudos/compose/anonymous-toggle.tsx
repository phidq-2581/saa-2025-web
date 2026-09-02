"use client";

import { useTranslations } from "next-intl";

export type AnonymousToggleProps = {
  checked: boolean;
  displayName: string;
  onCheckedChange: (checked: boolean) => void;
  onDisplayNameChange: (name: string) => void;
};

/**
 * "Gửi ẩn danh" checkbox (mms_G, 520:14099/520:14092): checking reveals a
 * display-name field; unchecking hides AND discards the value (TC ID-41-44).
 * Spec BR-007: anonymity is display-only, `sender_id` still set server-side
 * (Phase 05) -- this modal never suppresses the real sender.
 */
export function AnonymousToggle({
  checked,
  displayName,
  onCheckedChange,
  onDisplayNameChange,
}: AnonymousToggleProps) {
  const t = useTranslations("compose.anonymous");

  return (
    // mm:520:14099
    <div className="flex w-full flex-col items-start gap-4">
      <label className="flex items-center gap-4">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => {
            const next = event.target.checked;
            onCheckedChange(next);
            if (!next) onDisplayNameChange("");
          }}
          data-testid="kudos-compose-anonymous-checkbox"
          className="h-6 w-6 rounded-xs border border-[#999999] bg-white"
        />
        <span className="font-body text-[22px] font-bold text-[#999999]">{t("label")}</span>
      </label>
      {checked && (
        <input
          type="text"
          value={displayName}
          onChange={(event) => onDisplayNameChange(event.target.value)}
          placeholder={t("namePlaceholder")}
          data-testid="kudos-compose-anonymous-name"
          className="h-14 w-full rounded-panel border border-border-gold bg-white px-6 py-4 font-body text-base font-bold text-canvas focus:outline-2 focus:outline-gold"
        />
      )}
    </div>
  );
}
