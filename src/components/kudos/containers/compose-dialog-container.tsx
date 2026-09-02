"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { HashtagRef, KudosAuthor } from "@/lib/kudos/types";
import { KudosComposeDialog, type KudosDraft } from "@/components/kudos/compose/kudos-compose-dialog";
import { isSelfKudos } from "@/lib/kudos/write/validate-draft";
import { submitKudos } from "@/lib/kudos/write/submit-kudos";

export interface ComposeDialogContainerProps {
  open: boolean;
  onClose: () => void;
  recipients: KudosAuthor[];
  hashtags: HashtagRef[];
  /** The signed-in Sunner's own id -- used for the client-side self-kudos
   * guard below and as `submitKudos`'s storage-path `senderId`. The server
   * action independently re-derives and verifies the real sender via
   * `getClaims()` (Phase 05), so this is a UX fast-path, not the trust
   * boundary. */
  currentViewerId: string;
  /** Fires after a confirmed successful submit, alongside the router
   * refresh this container already performs (e.g. to reset a sibling
   * "pill" open-state if the caller tracks one separately from `onClose`). */
  onSubmitted?: () => void;
}

/** Maps a `submitKudos`/`createKudos` failure code to a translated,
 * user-facing message. `self-kudos-not-allowed` also fires client-side
 * (below) before the network round trip even starts; this covers the case
 * where the server rejects it anyway (client state stale, direct retry). */
const ERROR_MESSAGE_KEY: Record<string, string> = {
  "self-kudos-not-allowed": "selfKudosError",
  "upload-failed": "uploadError",
};

/**
 * Phase 07 (F005/F006): the single client wrapper both the FAB's "Viết
 * KUDOS" and the `/kudos` compose pill open (clarifications.md: one shared
 * modal, real recipients/hashtags, `submitKudos`). Kept as its own
 * container -- rather than inlined in each entry point -- so the
 * self-kudos guard, error-message mapping and post-submit revalidation
 * exist in exactly one place (DRY) no matter which entry point opened it.
 */
export function ComposeDialogContainer({
  open,
  onClose,
  recipients,
  hashtags,
  currentViewerId,
  onSubmitted,
}: ComposeDialogContainerProps) {
  const t = useTranslations("compose");
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(draft: KudosDraft): Promise<void> {
    setErrorMessage(null);

    // Client-side mirror of the server's own rule (Group-3 checkpoint
    // decision, `validate-draft.ts`'s `isSelfKudos`) -- same predicate, no
    // duplicated `===`, just an earlier, friendlier rejection than waiting
    // on a round trip only to get the identical answer back.
    if (isSelfKudos(currentViewerId, draft.receiverId)) {
      setErrorMessage(t("selfKudosError"));
      throw new Error("self-kudos-not-allowed");
    }

    const result = await submitKudos({
      senderId: currentViewerId,
      receiverId: draft.receiverId,
      content: draft.content,
      isAnonymous: draft.isAnonymous,
      anonymousDisplayName: draft.isAnonymous ? draft.anonymousDisplayName : null,
      hashtagIds: draft.hashtagIds,
      images: draft.files,
    });

    if (!result.ok) {
      setErrorMessage(t(ERROR_MESSAGE_KEY[result.code] ?? "genericError"));
      // Thrown (not swallowed): `KudosComposeDialog.handleSubmit` only
      // calls `onClose()` after `onSubmit` resolves without throwing, so
      // this keeps the modal open with the inline error visible.
      throw new Error(result.code);
    }

    // `createKudos` already calls `revalidatePath("/kudos")` server-side;
    // `router.refresh()` is still needed so THIS client stays on `/kudos`
    // without a navigation to pick that revalidation up.
    router.refresh();
    onSubmitted?.();
  }

  return (
    <KudosComposeDialog
      open={open}
      onClose={() => {
        setErrorMessage(null);
        onClose();
      }}
      recipients={recipients}
      hashtags={hashtags}
      onSubmit={handleSubmit}
      errorMessage={errorMessage}
    />
  );
}
