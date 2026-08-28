"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DropdownRenderState = {
  open: boolean;
  close: () => void;
};

type DropdownProps = {
  /** Accessible name for the panel (aria-label). */
  label: string;
  /** Content rendered inside the trigger <button>. */
  trigger: (state: DropdownRenderState) => ReactNode;
  /** Content rendered inside the panel while open. */
  children: (state: DropdownRenderState) => ReactNode;
  triggerTestId?: string;
  panelTestId?: string;
  triggerClassName?: string;
  panelClassName?: string;
};

/**
 * Shared open/close primitive backing the language, profile, and
 * profile-admin dropdowns (SM-001_DropdownMenuState / BR-003).
 * - click trigger toggles
 * - outside click / Escape closes
 * - Enter/Space on a focused, closed trigger opens it (native <button>
 *   keyboard activation already fires the click handler, so no extra
 *   keydown wiring is required here)
 */
export function Dropdown({
  label,
  trigger,
  children,
  triggerTestId,
  panelTestId,
  triggerClassName,
  panelClassName,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        data-testid={triggerTestId}
        onClick={toggle}
        className={triggerClassName}
      >
        {trigger({ open, close })}
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          data-testid={panelTestId}
          className={panelClassName}
        >
          {children({ open, close })}
        </div>
      )}
    </div>
  );
}
