/**
 * "MM_MEDIA_Send" (componentSet 178:1020, B.3.4/C.3.2 "Icon mũi tên" /
 * "Icon sent" -- the static, non-interactive arrow between the sender and
 * receiver avatar blocks). Inlined per code-rules 2a: solid `fill="white"`
 * swapped for `currentColor` so the card can set its color via text color.
 */
export function IconSend(props: React.SVGProps<SVGSVGElement>) {
  return (
    // mm:I3127:21871;256:5147
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2.9043 20.4797V4.47974L21.9043 12.4797M4.9043 17.4797L16.7543 12.4797L4.9043 7.47974V10.9797L10.9043 12.4797L4.9043 13.9797M4.9043 17.4797V7.47974V13.9797V17.4797Z"
        fill="currentColor"
      />
    </svg>
  );
}
