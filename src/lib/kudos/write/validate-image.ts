/**
 * Phase 05 (F005 BR-004_ImageMaxCountTypeSize): jpg/png/webp, <=5MB each,
 * <=5 files -- checked client-side (submit-kudos.ts) before any upload
 * starts, so a rejected file never reaches Supabase Storage.
 */

export const MAX_IMAGE_COUNT = 5;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** Structural shape a `File` satisfies -- kept decoupled from the DOM lib
 *  so this module stays trivially unit-testable without a real `File`. */
export interface ImageFileLike {
  name: string;
  type: string;
  size: number;
}

export type ImageValidationResult =
  | { ok: true }
  | { ok: false; reason: "too-many-images" }
  | { ok: false; reason: "unsupported-type"; index: number }
  | { ok: false; reason: "too-large"; index: number };

function isAllowedImageMimeType(value: string): value is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(value);
}

export function validateImages(files: readonly ImageFileLike[]): ImageValidationResult {
  if (files.length > MAX_IMAGE_COUNT) {
    return { ok: false, reason: "too-many-images" };
  }

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];

    if (!isAllowedImageMimeType(file.type)) {
      return { ok: false, reason: "unsupported-type", index };
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return { ok: false, reason: "too-large", index };
    }
  }

  return { ok: true };
}
