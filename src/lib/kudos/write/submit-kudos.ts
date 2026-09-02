import { createClient } from "@/lib/supabase/client";
import type { KudosContentNode } from "../content-schema";
import { type CreateKudosResult, createKudos } from "./create-kudos-action";
import { buildKudosImageStoragePath } from "./storage-path";
import { type ImageValidationReason, validateImages } from "./validate-image";

/**
 * Phase 05 (F005 INT-002, Assumptions; BR-004_ImageMaxCountTypeSize):
 * client orchestration for a Viet Kudo submit. This is the ONLY production
 * call site of `validateImages` -- the compose UI's own inline file
 * filtering is first-line UX only, not a trust boundary; this re-check is
 * what actually stands between a rejected file set and Supabase Storage.
 * Images upload directly to Supabase Storage from the browser, on Submit
 * only (not on file-pick), so a cancelled draft never orphans a storage
 * object. A failed upload stops immediately and names the failing index so
 * the modal can mark that thumbnail without touching the ones that already
 * succeeded.
 */

const IMAGES_BUCKET = "images";

export interface SubmitKudosInput {
  /** The signed-in Sunner's id -- used only to build the storage path
   *  locally; the server independently re-derives and verifies it via
   *  `getClaims()` before trusting any uploaded path. */
  senderId: string;
  receiverId: string;
  content: KudosContentNode;
  isAnonymous: boolean;
  anonymousDisplayName: string | null;
  hashtagIds: string[];
  images: File[];
}

export type SubmitKudosResult =
  | { ok: true; id: string }
  | { ok: false; code: "upload-failed"; failedIndex: number }
  | { ok: false; code: "invalid-images"; reason: "too-many-images" }
  | { ok: false; code: "invalid-images"; reason: "unsupported-type" | "too-large"; index: number }
  | Extract<CreateKudosResult, { ok: false }>;

/** Every `SubmitKudosResult` failure carries `code` as its top-level
 *  discriminant (matching `CreateKudosResult`'s convention) so a consumer
 *  can branch on `.code` uniformly -- `validateImages`'s own result uses
 *  `reason` as ITS discriminant, so it is wrapped here, not returned raw. */
function toInvalidImagesResult(
  reason: ImageValidationReason,
  index?: number,
): Extract<SubmitKudosResult, { code: "invalid-images" }> {
  return reason === "too-many-images"
    ? { ok: false, code: "invalid-images", reason }
    : { ok: false, code: "invalid-images", reason, index: index as number };
}

export async function submitKudos(input: SubmitKudosInput): Promise<SubmitKudosResult> {
  const imageValidation = validateImages(input.images);
  if (!imageValidation.ok) {
    return toInvalidImagesResult(
      imageValidation.reason,
      "index" in imageValidation ? imageValidation.index : undefined,
    );
  }

  const kudosId = crypto.randomUUID();
  const supabase = createClient();
  const uploadedImages: { storagePath: string; position: number }[] = [];

  for (let index = 0; index < input.images.length; index += 1) {
    const file = input.images[index];
    const storagePath = buildKudosImageStoragePath({
      senderId: input.senderId,
      kudosId,
      position: index,
      fileName: file.name,
    });

    const { error } = await supabase.storage.from(IMAGES_BUCKET).upload(storagePath, file);

    if (error) {
      console.error("submitKudos: image upload failed", { index, error });
      return { ok: false, code: "upload-failed", failedIndex: index };
    }

    uploadedImages.push({ storagePath, position: index });
  }

  return createKudos({
    id: kudosId,
    receiverId: input.receiverId,
    content: input.content,
    isAnonymous: input.isAnonymous,
    anonymousDisplayName: input.anonymousDisplayName,
    hashtagIds: input.hashtagIds,
    images: uploadedImages,
  });
}
