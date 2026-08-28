/**
 * "MM_MEDIA_Up" (component 178:1020, exported hash 961e7e07...svg) -- the
 * shared external-link arrow reused on B3.1 "ABOUT AWARDS", every award
 * card's "Chi tiết" link (C2.1.4-C2.6.4) and the Kudos "Chi tiết" button
 * (D2.1). Inlined per code-rules 2a: solid `fill="white"` swapped for
 * `currentColor` so each caller can set the icon color via its own text
 * color (dark on gold CTAs, white on outline/ghost CTAs).
 */
export function IconLinkArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    // mm:I2167:9063;186:1766
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M8.49945 18.3104L5.68945 15.5004L12.0595 9.12043H7.10945V5.69043H18.3095V16.8904H14.8895V11.9404L8.49945 18.3104Z"
        fill="currentColor"
      />
    </svg>
  );
}
