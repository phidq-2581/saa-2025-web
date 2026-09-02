"use client";

import { useTranslations } from "next-intl";
import { IconClose, IconSend } from "./compose-icons";

export type ComposeFooterProps = {
  submitDisabled: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

/**
 * Footer action bar (mms_H_Frame 538, 520:9905): "Hủy" (bordered, gold-10
 * bg) + "Gửi" (solid gold, primary). Gửi disabled until recipient/content/
 * hashtag are all valid (spec H.2, DEC-001).
 */
export function ComposeFooter({ submitDisabled, onCancel, onSubmit }: ComposeFooterProps) {
  const t = useTranslations("compose.footer");

  return (
    // mm:520:9905
    <div className="flex w-full items-start gap-6">
      <button
        type="button"
        onClick={onCancel}
        data-testid="kudos-compose-cancel"
        className="flex items-center gap-2 rounded-chip border border-border-gold bg-gold-10 px-10 py-4 font-body text-base font-bold text-canvas"
      >
        <IconClose className="h-6 w-6 text-canvas" />
        {t("cancel")}
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={submitDisabled}
        data-testid="kudos-compose-submit"
        className="flex flex-1 items-center justify-center gap-2 rounded-panel bg-gold p-4 font-body text-base font-bold text-canvas disabled:opacity-40"
      >
        {t("submit")}
        <IconSend className="h-6 w-6 text-canvas" />
      </button>
    </div>
  );
}
