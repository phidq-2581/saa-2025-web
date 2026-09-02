/**
 * "MM_MEDIA_Heart" (componentSet 178:1020, B.4.4/C.4.1 "Hearts"). Design
 * fill is `#D4271D` (the active/hearted state); inlined per code-rules 2a
 * with solid fill swapped for `currentColor` so the caller can pick the
 * color -- this round always renders the gray/inactive state (no persisted
 * "did I heart this" flag yet, see kudos-card.tsx heart-button usage).
 */
export function IconHeart(props: React.SVGProps<SVGSVGElement>) {
  return (
    // mm:I3127:21871;256:5171
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12.3364 21.1076L10.8864 19.7876C5.73643 15.1176 2.33643 12.0276 2.33643 8.25757C2.33643 5.16757 4.75643 2.75757 7.83643 2.75757C9.57643 2.75757 11.2464 3.56757 12.3364 4.83757C13.4264 3.56757 15.0964 2.75757 16.8364 2.75757C19.9164 2.75757 22.3364 5.16757 22.3364 8.25757C22.3364 12.0276 18.9364 15.1176 13.7864 19.7876L12.3364 21.1076Z"
        fill="currentColor"
      />
    </svg>
  );
}
