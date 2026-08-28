"use client";

import { useState } from "react";

export type FabWidgetProps = {
  /** Session gating is Phase 07's job; default true keeps the shell visible now. */
  visible?: boolean;
};

/**
 * Floating action widget (Homepage mms_6_Widget Button, collapsed
 * _hphd32jN2, expanded Sv7DFwBw1h). Collapsed pill 106x64 bg #FFEA9E
 * radius 100px; expanded "Thể lệ" 149x64, "Viết KUDOS" 214x64, "Hủy" 56x56
 * bg #D4271D -- all values traced via MCP list_frame_styles.
 * Per Sv7DFwBw1h reference (313:9140), the collapsed pill does NOT coexist
 * with the expanded state -- the 56x56 red circle occupies that same
 * bottom-right slot instead, icon-only. It stays keyboard/AT-reachable and
 * Playwright-text-matchable via a visually-hidden `sr-only` "Hủy" span.
 * Both Thể lệ/Viết KUDOS destinations render only, no navigation (BR-004,
 * SM-002_FabWidgetState).
 */
export function FabWidget({ visible = true }: FabWidgetProps) {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  if (expanded) {
    return (
      <div className="fixed bottom-6 right-[19px] z-20 flex flex-col items-end gap-3">
        <div data-testid="fab-menu" className="flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex h-16 w-[149px] items-center gap-2 rounded-chip bg-gold p-4 font-body text-2xl font-bold text-canvas"
          >
            <img src="/nav/fab-icon-rules.svg" alt="" width={24} height={24} aria-hidden="true" />
            Thể lệ
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="flex h-16 w-[214px] items-center gap-2 rounded-chip bg-gold p-4 font-body text-2xl font-bold text-canvas"
          >
            <img src="/nav/fab-icon-pencil.svg" alt="" width={24} height={24} aria-hidden="true" />
            Viết KUDOS
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label="Hủy"
            className="flex h-14 w-14 items-center justify-center rounded-pill bg-badge"
          >
            <img src="/nav/fab-icon-cancel.svg" alt="" width={24} height={24} aria-hidden="true" />
            <span className="sr-only">Hủy</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-[19px] z-20">
      <button
        type="button"
        data-testid="fab-toggle"
        aria-label="Quick actions"
        onClick={() => setExpanded(true)}
        className="flex h-16 w-[106px] items-center gap-2 rounded-pill bg-gold p-4"
      >
        <img src="/nav/fab-icon-pencil.svg" alt="" width={24} height={24} aria-hidden="true" />
        <span className="font-body text-2xl font-bold text-canvas">/</span>
        <img src="/nav/fab-icon-saa.svg" alt="" width={24} height={24} aria-hidden="true" />
      </button>
    </div>
  );
}
