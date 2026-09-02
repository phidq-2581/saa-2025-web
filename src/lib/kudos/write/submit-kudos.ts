import { createClient } from "@/lib/supabase/client";
import type { KudosContentNode } from "../content-schema";
import { type CreateKudosResult, createKudos } from "./create-kudos-action";
import { buildKudosImageStoragePath } from "./storage-path";

/**
 * Phase 05 (F005 INT-002, Assumptions): client orchestration for a Viet
 * Kudo submit. Images upload directly to Supabase Storage from the
 * browser, on Submit only (not on file-pick), so a cancelled draft never
 * orphans a storage object. A failed upload stops immediately and names
 * the failing index so the modal can mark that thumbnail without touching
 * the ones that already succeeded.
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
  | Extract<CreateKudosResult, { ok: false }>;

export async function submitKudos(input: SubmitKudosInput): Promise<SubmitKudosResult> {
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
