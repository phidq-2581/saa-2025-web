"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type RulesPanelState = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const noop = () => {};

/**
 * Open/closed state of the Thể lệ panel (MoMorph b1Filzi9i6). One panel is
 * mounted per page (by `FabWidget` when signed in, by `FabWidgetContainer`'s
 * guest branch otherwise); three affordances open it -- the footer's "Tiêu
 * chuẩn chung", the FAB's "Thể lệ" and the compose toolbar's "Tiêu chuẩn
 * cộng đồng" (clarifications.md 2026-09-03). The default value is a no-op
 * so components that render bare in unit tests never need the provider.
 */
const RulesPanelContext = createContext<RulesPanelState>({ isOpen: false, open: noop, close: noop });

export function RulesPanelProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return <RulesPanelContext.Provider value={value}>{children}</RulesPanelContext.Provider>;
}

export function useRulesPanel(): RulesPanelState {
  return useContext(RulesPanelContext);
}
