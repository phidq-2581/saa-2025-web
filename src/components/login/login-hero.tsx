import type { ReactNode } from "react";

type LoginHeroProps = {
  children: ReactNode;
};

/**
 * mms_B_Bìa (662:14393) -- hero region: full-bleed keyvisual background,
 * ROOT FURTHER wordmark, intro copy. `children` renders the login action
 * (button + error notice) inside the same content column as the tagline,
 * mirroring Frame 550's node order (662:14755: text, then mms_B.3_Login).
 *
 * `pt-20` clears the fixed LoginHeader (h-20 = 80px, same token).
 *
 * The abstract wave background (662:14388 "image 1") carries no
 * MM_MEDIA_* tag and has no URL in get_media_files; get_design_item_image
 * and list_media_nodes don't surface it either, and get_media_file 401s
 * for this fileKey (get_figma_image is the documented 500 case). Per the
 * task's fallback instruction, rendered as a flat --color-canvas fill
 * (the root frame's own 662:14387 backgroundColor) instead of inventing
 * artwork -- reported as a gap.
 *
 * The two gradient overlays (662:14392, 662:14390) are decorative
 * canvas-to-transparent fades painted on top of that same background;
 * copied verbatim from MCP `background` CSS via inline style rather than
 * guessed at Tailwind gradient utility names.
 */
export function LoginHero({ children }: LoginHeroProps) {
  return (
    // mm:662:14393
    <section className="relative flex-1 overflow-hidden pt-20">
      {/* mm:662:14388 -- see gap note above */}
      <div data-testid="login-keyvisual" className="absolute inset-0 bg-canvas" />
      {/* mm:662:14392 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0, 16, 26, 0.00) 100%)",
        }}
      />
      {/* mm:662:14390 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(0deg, #00101A 22.48%, rgba(0, 19, 32, 0.00) 51.74%)",
        }}
      />

      {/* mm:662:14394 */}
      <div className="relative z-10 flex flex-col items-start gap-20 px-4 py-24 md:px-36">
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
        <div className="flex max-w-[496px] flex-col items-start gap-6 pl-4">
          {/* mm:662:14753 */}
          <p className="font-body text-[20px] font-bold leading-[40px] tracking-[0.5px] text-white">
            Bắt đầu hành trình của bạn cùng SAA 2025.
            <br />
            Đăng nhập để khám phá!
          </p>

          <div className="flex flex-col items-start gap-4">{children}</div>
        </div>
      </div>
    </section>
  );
}
