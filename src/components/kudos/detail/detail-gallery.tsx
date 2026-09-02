/**
 * Phase 06 (F006) full-size image gallery for `/kudos/[id]`. No MoMorph
 * frame of its own (decision-sourced, clarifications.md 2026-08-31
 * "render 1 card đầy đủ ... full ảnh") -- reuses the board card's own
 * bordered-frame visual language (`CardAttachedImages`, border-border-gold
 * outer / border-gold inner, mm:I3127:21871;256:5177) at gallery scale
 * instead of that component's fixed 88x88 thumbnail row, since the detail
 * screen shows every image full-size rather than a capped preview strip.
 */
export interface DetailGalleryProps {
  imagePaths: string[];
}

export function DetailGallery({ imagePaths }: DetailGalleryProps) {
  if (imagePaths.length === 0) return null;

  return (
    <div data-testid="kudos-detail-gallery" className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3">
      {imagePaths.map((path, index) => (
        <span
          key={`${path}-${index}`}
          className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-[18px] border border-border-gold bg-white p-1"
        >
          <img
            data-testid="kudos-detail-gallery-image"
            src={path}
            alt=""
            className="h-full w-full rounded-[4px] border border-gold object-cover"
          />
        </span>
      ))}
    </div>
  );
}
