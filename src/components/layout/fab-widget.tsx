"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HashtagRef, KudosAuthor } from "@/lib/kudos/types";
import { ComposeDialogContainer } from "@/components/kudos/containers/compose-dialog-container";

export type FabWidgetProps = {
  /** Session gating is Phase 07's job; default true keeps the shell visible now. */
  visible?: boolean;
  /** Phase 07: real data for the shared compose dialog -- `recipients`/
   * `hashtags`/`currentViewerId` come from `FabWidgetContainer`'s queries.
   * Defaulted to empty/`""` so a caller that renders `FabWidget` bare
   * (e.g. an existing unit test) still mounts without crashing; the dialog
   * simply has nothing to search until real data is supplied. */
  recipients?: KudosAuthor[];
  hashtags?: HashtagRef[];
  currentViewerId?: string;
};

/**
 * Floating action widget (Homepage mms_6_Widget Button, collapsed
 * _hphd32jN2, expanded Sv7DFwBw1h). Collapsed pill 106x64 bg #FFEA9E
 * radius 100px; expanded "Thể lệ" 149x64, "Viết KUDOS" 214x64, "Hủy" 56x56
 * bg #D4271D -- all values traced via MCP list_frame_styles.
 * Per Sv7DFwBw1h reference (313:9140), the collapsed pill does NOT coexist
 * with the expanded state -- the 56x56 red circle occupies that same
 * bottom-right slot instead, icon-only.
 *
 * Both the toggle and the menu stay mounted at all times; only Tailwind's
 * `hidden` utility (not conditional mounting) switches which one is on
 * screen (BR-004). That keeps `aria-controls="fab-menu"` always resolving
 * to a real element, and `display:none` already excludes whichever half is
 * inactive from both layout and the accessibility/tab-focus tree, so no
 * redundant control is ever reachable. The toggle's own accessible name
 * (`fab.toggle`) never changes with expanded state -- only `aria-expanded`
 * communicates that; the cancel button inside the menu carries its own
 * localized name (`fab.cancel`). Both Thể lệ/Viết KUDOS destinations render
 * only, no navigation (BR-004, SM-002_FabWidgetState).
 */
export function FabWidget({
  visible = true,
  recipients = [],
  hashtags = [],
  currentViewerId = "",
}: FabWidgetProps) {
  const [expanded, setExpanded] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const t = useTranslations("common");

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-[19px] z-20 flex flex-col items-end gap-3">
      <div
        data-testid="fab-menu"
        id="fab-menu"
        className={expanded ? "flex flex-col items-end gap-3" : "hidden"}
      >
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="flex h-16 w-[149px] items-center gap-2 rounded-chip bg-gold p-4 font-body text-2xl font-bold text-canvas"
        >
          <img src="/nav/fab-icon-rules.svg" alt="" width={24} height={24} aria-hidden="true" />
          {t("fab.rules")}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setComposeOpen(true);
          }}
          className="flex h-16 w-[214px] items-center gap-2 rounded-chip bg-gold p-4 font-body text-2xl font-bold text-canvas"
        >
          <img src="/nav/fab-icon-pencil.svg" alt="" width={24} height={24} aria-hidden="true" />
          {t("fab.writeKudos")}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label={t("fab.cancel")}
          className="flex h-14 w-14 items-center justify-center rounded-pill bg-badge"
        >
          <img src="/nav/fab-icon-cancel.svg" alt="" width={24} height={24} aria-hidden="true" />
          <span className="sr-only">{t("fab.cancel")}</span>
        </button>
      </div>
      <button
        type="button"
        data-testid="fab-toggle"
        aria-label={t("fab.toggle")}
        aria-expanded={expanded}
        aria-controls="fab-menu"
        onClick={() => setExpanded(true)}
        className={
          expanded ? "hidden" : "flex h-16 w-[106px] items-center gap-2 rounded-pill bg-gold p-4"
        }
      >
        <img src="/nav/fab-icon-pencil.svg" alt="" width={24} height={24} aria-hidden="true" />
        <span className="font-body text-2xl font-bold text-canvas">/</span>
        <img src="/nav/fab-icon-saa.svg" alt="" width={24} height={24} aria-hidden="true" />
      </button>

      <ComposeDialogContainer
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        recipients={recipients}
        hashtags={hashtags}
        currentViewerId={currentViewerId}
      />
    </div>
  );
}
