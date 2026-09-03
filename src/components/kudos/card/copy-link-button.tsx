"use client";

import { useTranslations } from "next-intl";
import { IconLink } from "./icon-link";

export interface CopyLinkButtonProps {
  kudosId: string;
  onCopyLink?: (id: string) => void;
}

/**
 * B.4.4/C.4.2 "Copy Link" button (componentSet 186:1426, `rounded-chip`
 * radius 4px token). Toast display (`copyLinkToast` copy) is out of scope
 * this phase (no toast system exists yet) -- this only writes the link and
 * calls the `onCopyLink` prop.
 *
 * `navigator.clipboard.writeText` can reject (denied permission, insecure
 * context, no user-activation in some browsers) -- caught and silently
 * no-op'd rather than left as an unhandled rejection, since there's no
 * toast system yet to surface a failure state to the user. Revisit once
 * Phase 07 (or a later round) adds one.
 */
export function CopyLinkButton({ kudosId, onCopyLink }: CopyLinkButtonProps) {
  const t = useTranslations("kudos");

  function handleClick() {
    const url = `${window.location.origin}/kudos/${kudosId}`;
    navigator.clipboard.writeText(url).catch(() => {});
    onCopyLink?.(kudosId);
  }

  return (
    // mm:I2940:13465;335:9465
    <button
      type="button"
      data-testid="kudos-card-copy-link-btn"
      onClick={handleClick}
      className="flex items-center gap-1 rounded-chip p-4 font-body text-base leading-6 font-bold tracking-[0.15px] text-canvas hover:bg-gold-10"
    >
      {t("card.copyLink")}
      <IconLink className="h-6 w-6" />
    </button>
  );
}
