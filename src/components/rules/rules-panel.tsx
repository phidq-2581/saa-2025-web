"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { IconPen } from "@/components/kudos/card/icon-pen";
import { useRulesPanel } from "./rules-panel-context";
import { RulesContent } from "./rules-content";

export type RulesPanelProps = {
  /** Guest state: the spec's disabled "Viết KUDOS" (dimmed, ignores clicks). */
  writeDisabled?: boolean;
  /** Signed-in handoff -- the FAB opens its compose dialog here. */
  onWriteKudos?: () => void;
};

/**
 * Thể lệ panel (MoMorph b1Filzi9i6, frame 3204:6051): a 553px right-hand
 * drawer (3204:6052) on var(--Details-Container-2, #00070C), padding 24 40 40
 * 40, `justify-content: space-between` between the scrolling content column
 * (473 wide) and the 56px footer row (3204:6092, gap 16). Spec A: scrolls
 * when the copy is taller than the panel; "Đóng" closes; "Viết KUDOS" opens
 * the compose form. Footer buttons (3204:6093/6094): "Đóng" is a 94px
 * secondary button -- 10% gold fill, 1px #998C5F stroke drawn inset, its
 * 24px X + 8px + label centred; "Viết KUDOS" takes the remaining 363px in
 * solid gold with the pen icon. Labels 16px/700/24px, 0.5px tracking.
 *
 * Not on the canvas, decided in clarifications.md 2026-09-03: the same
 * bg-black/50 backdrop as the compose dialog (click outside closes), Escape
 * closes, focus lands on "Đóng" when opened, and a guest's "Viết KUDOS" uses
 * the spec's disabled state. The "dimmed" amount is not a design value --
 * 60% opacity follows the codebase's existing disabled buttons.
 */
export function RulesPanel({ writeDisabled = false, onWriteKudos }: RulesPanelProps) {
  const { isOpen, close } = useRulesPanel();
  const t = useTranslations("rules");
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-30 bg-black/50" onClick={close}>
      {/* mm:3204:6052 */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-panel-title"
        data-testid="rules-panel"
        onClick={(event) => event.stopPropagation()}
        className="absolute inset-y-0 right-0 flex w-full max-w-[553px] flex-col gap-10 bg-panel px-10 pt-6 pb-10"
      >
        {/* mm:3204:6053 */}
        <div data-testid="rules-panel-scroll" className="min-h-0 flex-1 overflow-y-auto">
          <RulesContent />
        </div>
        {/* mm:3204:6092 */}
        <div className="flex shrink-0 gap-4">
          {/* mm:3204:6093 */}
          <button
            ref={closeRef}
            type="button"
            data-testid="rules-panel-close"
            onClick={close}
            className="flex h-14 w-[94px] shrink-0 items-center justify-center gap-2 rounded-chip bg-gold-10 font-body text-base leading-6 font-bold tracking-[0.5px] text-white shadow-[inset_0_0_0_1px_#998C5F]"
          >
            <img src="/kudos-compose/icon-close.svg" alt="" width={24} height={24} aria-hidden="true" />
            {t("close")}
          </button>
          {/* mm:3204:6094 */}
          <button
            type="button"
            data-testid="rules-panel-write"
            disabled={writeDisabled}
            onClick={() => {
              close();
              onWriteKudos?.();
            }}
            className="flex h-14 flex-1 items-center justify-center gap-2 rounded-chip bg-gold font-body text-base leading-6 font-bold tracking-[0.5px] text-canvas disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconPen className="h-6 w-6" />
            {t("writeKudos")}
          </button>
        </div>
      </aside>
    </div>
  );
}
