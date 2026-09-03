import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

type LoginHeroProps = {
  children: ReactNode;
};

/**
 * mms_B_Bìa (662:14393) -- the content region between header and footer:
 * y88-933 on the 1024 canvas (an 8px gap under the 80px fixed header),
 * padding 96px 144px. Its only child, Frame 487 (662:14394), fills that
 * box and vertically CENTERS its two children 80px apart: the 451x200
 * ROOT FURTHER wordmark (662:14395) and Frame 550 (662:14755) -- a
 * 496px-wide column with 16px left padding holding the 480x80 intro copy
 * (20px/700/40px, 0.5px letter-spacing) and, 24px below, the login action.
 * `children` renders that action (button + error notice) so the node order
 * of Frame 550 is preserved.
 *
 * The keyvisual and gradient covers are NOT here: they span the whole
 * canvas including the footer strip, so `(auth)/layout.tsx` paints them
 * once behind everything (see login-keyvisual.tsx).
 *
 * No existing synchronous `@testing-library/react` render covers this
 * component, so `async` + `getTranslations` is safe here -- see
 * `hero-section.tsx`'s docblock for the components where it is not.
 */
export async function LoginHero({ children }: LoginHeroProps) {
  const t = await getTranslations("login");

  return (
    // mm:662:14393
    <section className="mt-[88px] flex flex-1 flex-col items-start px-4 py-24 md:px-36">
      {/* mm:662:14394 */}
      <div className="flex w-full flex-1 flex-col items-start justify-center gap-20">
        {/* mm:662:14395 */}
        <h1>
          {/* mm:2939:9548 */}
          <img
            src="/login/root-further-logo.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            className="h-auto w-[451px] max-w-full"
          />
        </h1>

        {/* mm:662:14755 */}
        <div className="flex w-full max-w-[496px] flex-col items-start gap-6 pl-4">
          {/* mm:662:14753 */}
          <p className="w-full font-body text-[20px] font-bold leading-10 tracking-[0.5px] text-white">
            {t("heroSubtitle")}
            <br />
            {t("heroTagline")}
          </p>

          {/* mm:662:14425 */}
          <div className="flex flex-col items-start gap-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
