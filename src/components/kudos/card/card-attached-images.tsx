/**
 * C.3.6 "Image đính kèm" -- up to 5 attached images, feed variant only (the
 * highlight-carousel card mockup has no images row). Nested double-border:
 * an 88x88 outer frame (border 1px `--color-border-gold` #998C5F, radius
 * 18px, white bg) wraps an 88x88 inner asset (border 1px `--color-gold`
 * #FFEA9E, radius 4px) -- per code-rules 2b the outer wrapper clips
 * (`overflow: hidden`) to its own 18px radius so the tighter-radius inner
 * asset never leaks a square corner past the frame.
 */
export function CardAttachedImages({ imagePaths }: { imagePaths: string[] }) {
  if (imagePaths.length === 0) return null;

  return (
    // mm:I3127:21871;256:5176
    <div className="flex items-center gap-4">
      {imagePaths.slice(0, 5).map((path, index) => (
        // mm:I3127:21871;256:5177
        <span
          key={`${path}-${index}`}
          className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded-[18px] border border-border-gold bg-white"
        >
          {/* mm:I3127:21871;256:5177;513:8436 */}
          <img src={path} alt="" className="h-full w-full rounded-[4px] border border-gold object-cover" />
        </span>
      ))}
    </div>
  );
}
