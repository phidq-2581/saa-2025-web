"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IconClose, IconLink } from "./compose-icons";

export type AddlinkDialogProps = {
  open: boolean;
  onSave: (text: string, link: string) => void;
  onCancel: () => void;
};

const TEXT_MAX_LENGTH = 100;
const LINK_MIN_LENGTH = 5;
const LINK_MAX_LENGTH = 2048;
const HTTP_SCHEME = /^https?:\/\//i;

function isTextValid(text: string): boolean {
  return text.trim().length > 0 && text.length <= TEXT_MAX_LENGTH;
}

function isLinkValid(link: string): boolean {
  return (
    link.length >= LINK_MIN_LENGTH && link.length <= LINK_MAX_LENGTH && HTTP_SCHEME.test(link)
  );
}

/**
 * Nested "Add link" dialog (Addlink Box, OyDLDuSGEa 1002:12682) opened from
 * the editor toolbar's link button. Inserts a NEW text run carrying the
 * link mark (Text + URL are both entered here) rather than converting an
 * existing selection -- spec B/C: two required fields, not a link-on-
 * selection flow. Sizes/colors traced via MCP: 752px card, padding 40,
 * gap 32, radius 24, bg #FFF8E1 (cream, not yet a shared token -- see
 * delivery report). Inputs: border #998C5F, radius 8, height 56.
 */
export function AddlinkDialog({ open, onSave, onCancel }: AddlinkDialogProps) {
  const t = useTranslations("compose.addlink");
  const [text, setText] = useState("");
  const [link, setLink] = useState("");
  // Reset fields when the dialog transitions closed -> open. Adjusting
  // state during render (rather than in an effect) avoids the extra
  // cascading render `react-hooks/set-state-in-effect` flags.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setText("");
      setLink("");
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const textValid = isTextValid(text);
  const linkValid = isLinkValid(link);
  const canSave = textValid && linkValid;

  return (
    // mm:1002:12682
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      data-testid="addlink-dialog"
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="flex w-full max-w-[752px] flex-col items-start gap-8 rounded-[24px] bg-[#FFF8E1] p-10">
        {/* mm:I1002:12682;1002:12500 */}
        <h2 className="w-full font-body text-[32px] font-bold leading-10 text-canvas">
          {t("title")}
        </h2>

        {/* mm:I1002:12682;1002:12501 */}
        <div className="flex w-full items-center gap-4">
          <span className="w-[107px] shrink-0 font-body text-[22px] font-bold text-canvas">
            {t("textLabel")}
          </span>
          <input
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            data-testid="addlink-text-input"
            className="h-14 flex-1 rounded-panel border border-border-gold bg-white px-6 py-4 font-body text-base font-bold text-canvas focus:outline-2 focus:outline-gold"
          />
        </div>
        {text.length > 0 && !textValid && (
          <p className="-mt-6 text-sm font-bold text-[#CF1322]">{t("textRequiredError")}</p>
        )}

        {/* mm:I1002:12682;1002:12652 */}
        <div className="flex w-full items-center gap-4">
          <span className="w-[47px] shrink-0 font-body text-[22px] font-bold text-canvas">
            {t("linkLabel")}
          </span>
          <input
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            data-testid="addlink-link-input"
            className="h-14 flex-1 rounded-panel border border-border-gold bg-white px-6 py-4 font-body text-base font-bold text-canvas focus:outline-2 focus:outline-gold"
          />
        </div>
        {link.length > 0 && !linkValid && (
          <p className="-mt-6 text-sm font-bold text-[#CF1322]">{t("linkInvalidError")}</p>
        )}

        {/* mm:I1002:12682;1002:12543 */}
        <div className="flex w-full items-start gap-6">
          <button
            type="button"
            onClick={onCancel}
            data-testid="addlink-cancel"
            className="flex items-center gap-2 rounded-chip border border-border-gold bg-gold-10 px-10 py-4 font-body text-base font-bold text-canvas"
          >
            <IconClose className="h-6 w-6 text-canvas" />
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => canSave && onSave(text, link)}
            disabled={!canSave}
            data-testid="addlink-save"
            className="flex flex-1 items-center justify-center gap-2 rounded-panel bg-gold px-4 py-4 font-body text-[22px] font-bold text-canvas disabled:opacity-40"
          >
            {t("save")}
            <IconLink className="h-6 w-6 text-canvas" />
          </button>
        </div>
      </div>
    </div>
  );
}
