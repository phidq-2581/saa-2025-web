import { getTranslations } from "next-intl/server";

/**
 * mms_D_Footer (662:14447) -- copyright only, no nav links (Login TC
 * 33a1dacf). The instance is 91px tall (y933-1024) with a 1px top rule
 * var(--Details-Divider, #2E3940), kept as the shared --color-divider
 * token since the Figma variable name reads as a system-wide value. Its
 * `padding: 40px 90px` would give 104px with a 24px text line, so the
 * height is set explicitly and the line centered instead. `relative` keeps
 * it above the absolutely positioned keyvisual layers painted by the
 * route-group layout.
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
      className="relative flex h-[91px] w-full items-center justify-center border-t border-divider px-4 md:px-[90px]"
    >
      {/* mm:I662:14447;342:1413 */}
      <p className="font-heading text-base font-bold leading-6 text-white">{t("footerCopyright")}</p>
    </footer>
  );
}
