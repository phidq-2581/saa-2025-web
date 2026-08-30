"use server";

import { headers } from "next/headers";
import { setLocale } from "./set-locale";

/**
 * Module-level Server Action wrapper around `setLocale`, bound to the
 * dropdown props' `onSelectLocale?: (locale) => void` shape. Client
 * Components (`language-dropdown.tsx`, `mobile-nav-drawer.tsx`) may only be
 * handed a Server Action *reference* -- never an inline closure defined
 * inside a Server Component (Risk Assessment, "`use server` boundary
 * misused") -- which is why this file exists rather than wiring `setLocale`
 * directly as a prop.
 *
 * `setLocale` needs the current `pathname` to `revalidatePath` the page the
 * switch was made from, but a Server Action invoked from a Client Component
 * has no route param of its own. The current path is recovered from the
 * `Referer` header Next.js's fetch-based action invocation sends; falls
 * back to `/` if that header is ever absent (e.g. a direct, non-browser
 * call), which still revalidates something sane rather than throwing.
 *
 * `locale` is untrusted here -- a Server Action is a network boundary, not
 * just a TS-narrowed call site -- but `setLocale` itself already validates
 * against the `['vi','en']` allow-list and falls back to the default
 * locale, so that check is not duplicated in this thin wrapper.
 */
export async function selectLocaleAction(locale: string): Promise<void> {
  const headerList = await headers();
  const referer = headerList.get("referer");
  await setLocale(locale, refererPathname(referer));
}

/** Pathname of the Referer, or "/" when absent or malformed (never throws). */
function refererPathname(referer: string | null): string {
  if (!referer) return "/";
  try {
    return new URL(referer).pathname;
  } catch {
    return "/";
  }
}
