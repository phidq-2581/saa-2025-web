import { getTranslations } from "next-intl/server";

/**
 * mms_D_Footer (662:14447) -- copyright only, no nav links (Login TC
 * 33a1dacf). Divider colour is the node's own
 * `var(--Details-Divider, #2E3940)` border-top, kept as a shared
 * --color-divider token since the Figma variable name reads as a
 * system-wide value, not login-specific.
 *
 * No existing synchronous `@testing-library/react` render covers this
 * component (only reached via `(auth)/layout.tsx`, itself untested), so
 * `async` + `getTranslations` is safe here -- see `hero-section.tsx`'s
 * docblock for the components where it is not.
 */
export async function LoginFooter() {
  const t = await getTranslations("login");

  return (
    // mm:662:14447
    <footer
      data-testid="login-footer"
      className="flex w-full items-center justify-center border-t border-divider px-4 py-10 md:px-[90px]"
    >
      {/* mm:I662:14447;342:1413 */}
      <p className="font-heading text-base font-bold text-white">{t("footerCopyright")}</p>
    </footer>
  );
}
