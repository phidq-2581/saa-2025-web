/**
 * mms_C_Keyvisual (662:14388) plus the two gradient covers, 662:14392
 * "Rectangle 57" and 662:14390 "Cover". All three span the whole Login
 * canvas (662:14387, 1440x1024) -- including the strip under the footer --
 * so they are painted once here, behind header/main/footer, rather than
 * inside the hero. Boxes are the node positions from
 * `list_frame_styles("GzbNeVGJHz")`; horizontal extents use `inset-x-0`
 * (1440 vs the nodes' 1441/1442, sub-pixel at the canvas width) so wider
 * viewports stay covered.
 *
 * "image 1" (662:14389) carries no MM_MEDIA tag and no MoMorph download
 * path (get_media_file 401, get_figma_image 500): per clarifications.md
 * 2026-09-03 the user exports the node from Figma to
 * /login/keyvisual-bg.png. A Figma export is the node as rendered -- the
 * fill's own offset/scale is already applied -- so it is drawn
 * edge-to-edge with `cover`, not re-cropped. A CSS background, not <img>,
 * so a not-yet-exported file degrades to the canvas colour, never a broken
 * image icon.
 */
export function LoginKeyvisual() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* mm:662:14389 -- 1441x1022 at (0,2) */}
      <div
        data-testid="login-keyvisual"
        className="absolute inset-x-0 top-[2px] h-[1022px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/login/keyvisual-bg.png)" }}
      />
      {/* mm:662:14392 -- 1442x1024 at (1,0) */}
      <div
        className="absolute inset-x-0 top-0 h-[1024px]"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, #00101A 25.41%, rgba(0, 16, 26, 0.00) 100%)",
        }}
      />
      {/* mm:662:14390 -- 1440x1093 at (0,138) */}
      <div
        className="absolute inset-x-0 top-[138px] h-[1093px]"
        style={{ background: "linear-gradient(0deg, #00101A 22.48%, rgba(0, 19, 32, 0.00) 51.74%)" }}
      />
    </div>
  );
}
