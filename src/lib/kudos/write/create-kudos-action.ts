"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { KudosContentNode } from "../content-schema";
import { type DraftValidationReason, isSelfKudos, validateDraft } from "./validate-draft";
import { verifyKudosImageStoragePath } from "./storage-path";

/**
 * Phase 05 (F005 INT-003_KudosInsert; data-model.md `create_kudos` RPC).
 * Re-validates everything the client already gated (DEC-001) plus the two
 * trust-boundary checks a client cannot be trusted to have done honestly:
 * the content allow-list and the storage-path ownership prefix. Identity
 * comes only from `getClaims()` -- `sender_id` is resolved inside the RPC
 * via `auth.uid()`, never taken from the request body.
 */

const KUDOS_PATH = "/kudos";

export interface CreateKudosImageInput {
  storagePath: string;
  position: number;
}

export interface CreateKudosInput {
  id: string;
  receiverId: string;
  content: KudosContentNode;
  isAnonymous: boolean;
  anonymousDisplayName: string | null;
  hashtagIds: string[];
  images: CreateKudosImageInput[];
}

export type CreateKudosResult =
  | { ok: true; id: string }
  | { ok: false; code: "invalid-input" }
  | { ok: false; code: "unauthenticated" }
  | { ok: false; code: "self-kudos-not-allowed" }
  | { ok: false; code: "invalid-draft"; reason: DraftValidationReason }
  | { ok: false; code: "invalid-image-path" }
  | { ok: false; code: "insert-failed" };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCreateKudosImageInput(value: unknown): value is CreateKudosImageInput {
  return isPlainObject(value) && typeof value.storagePath === "string" && typeof value.position === "number";
}

/** Runtime boundary guard: a Server Action is callable over the network
 *  with an arbitrary JSON body, so the declared TS parameter type alone
 *  does not protect this function -- every field is checked at runtime. */
function isCreateKudosInput(value: unknown): value is CreateKudosInput {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.receiverId === "string" &&
    isPlainObject(value.content) &&
    typeof value.isAnonymous === "boolean" &&
    (value.anonymousDisplayName === null || typeof value.anonymousDisplayName === "string") &&
    Array.isArray(value.hashtagIds) &&
    value.hashtagIds.every((hashtagId) => typeof hashtagId === "string") &&
    Array.isArray(value.images) &&
    value.images.every(isCreateKudosImageInput)
  );
}

export async function createKudos(input: CreateKudosInput): Promise<CreateKudosResult> {
  if (!isCreateKudosInput(input)) {
    return { ok: false, code: "invalid-input" };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub as string | undefined;

  if (claimsError || !userId) {
    return { ok: false, code: "unauthenticated" };
  }

  // Group-3 checkpoint decision: self-kudos is BLOCKED. This is the only
  // place the authenticated sender id is known server-side, so it is the
  // sole enforcement point (no RLS/DB constraint backs it -- data-model.md
  // deliberately left sender==receiver unconstrained at the schema level).
  if (isSelfKudos(userId, input.receiverId)) {
    return { ok: false, code: "self-kudos-not-allowed" };
  }

  const draftValidation = validateDraft({
    receiverId: input.receiverId,
    content: input.content,
    hashtagIds: input.hashtagIds,
    isAnonymous: input.isAnonymous,
    anonymousDisplayName: input.anonymousDisplayName,
    imagePaths: input.images.map((image) => image.storagePath),
  });

  if (!draftValidation.ok) {
    return { ok: false, code: "invalid-draft", reason: draftValidation.reason };
  }

  const sortedImages = [...input.images].sort((a, b) => a.position - b.position);

  for (const image of sortedImages) {
    if (!verifyKudosImageStoragePath({ storagePath: image.storagePath, senderId: userId, kudosId: input.id })) {
      return { ok: false, code: "invalid-image-path" };
    }
  }

  const { data, error } = await supabase.rpc("create_kudos", {
    p_id: input.id,
    p_receiver: input.receiverId,
    p_content: input.content,
    p_is_anonymous: input.isAnonymous,
    p_display_name: input.isAnonymous ? input.anonymousDisplayName : null,
    p_hashtag_ids: input.hashtagIds,
    p_image_paths: sortedImages.map((image) => image.storagePath),
  });

  if (error || !data) {
    console.error("createKudos: create_kudos RPC failed", error);
    return { ok: false, code: "insert-failed" };
  }

  revalidatePath(KUDOS_PATH);

  return { ok: true, id: data as string };
}
