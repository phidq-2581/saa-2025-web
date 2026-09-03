"use client";

import type { ReactNode } from "react";
import { useRulesPanel } from "./rules-panel-context";

type RulesTriggerButtonProps = {
  className?: string;
  children: ReactNode;
};

/** A plain button that opens the Thể lệ panel -- lets Server Components such
 *  as `SiteFooter` place a trigger without becoming client components. */
export function RulesTriggerButton({ className, children }: RulesTriggerButtonProps) {
  const { open } = useRulesPanel();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
