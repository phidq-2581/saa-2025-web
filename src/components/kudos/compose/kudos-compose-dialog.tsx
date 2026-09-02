"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { HashtagRef, KudosAuthor } from "@/lib/kudos/types";
import type { KudosContentNode } from "@/lib/kudos/content-schema";
import { RecipientAutocomplete } from "./recipient-autocomplete";
import { KudosEditor } from "./kudos-editor";
import { HashtagPicker } from "./hashtag-picker";
import { ImageAttachmentGrid } from "./image-attachment-grid";
import { AnonymousToggle } from "./anonymous-toggle";
import { ComposeFooter } from "./compose-footer";

/** Track A's fully client-side draft shape (Phase 03 integration contract).
 * Phase 05 wires the real insert/upload; component internals stay unchanged. */
export type KudosDraft = {
  receiverId: string;
  content: KudosContentNode;
  hashtagIds: string[];
  files: File[];
  isAnonymous: boolean;
  anonymousDisplayName: string;
};

export type KudosComposeDialogProps = {
  open: boolean;
  onClose: () => void;
  recipients: KudosAuthor[];
  hashtags: HashtagRef[];
  onSubmit: (draft: KudosDraft) => Promise<void>;
  /** Phase 07: a submit-time error surfaced inline (e.g. self-kudos
   * rejected, upload failure) -- the dialog itself never calls `onClose()`
   * when `onSubmit` throws (see `handleSubmit` below), so this renders
   * alongside the still-open form rather than a page-level toast. `null`/
   * omitted renders nothing. */
  errorMessage?: string | null;
};

const EMPTY_DOC: KudosContentNode = { type: "doc", content: [] };

/**
 * Viết Kudo compose modal (520:11647, 752x1012, padding 40, gap 32, radius
 * 24, bg #FFF8E1). Fully client-side per Phase 03 -- the real insert,
 * storage upload and `sender_id` recording are Phase 05's job. A design-
 * only "Danh hiệu" field (node 1688:10448) sits between recipient and
 * editor in the frame but has no row in `specs.csv`, no test-case
 * coverage, and no field in this contract's `KudosDraft` -- treated as an
 * unfinished/removed design element and not implemented (design gap,
 * delivery report), matching the "render only for spec_status=completed"
 * precedent used elsewhere in this project.
 */
export function KudosComposeDialog({
  open,
  onClose,
  recipients,
  hashtags,
  onSubmit,
  errorMessage,
}: KudosComposeDialogProps) {
  const t = useTranslations("compose");
  const [recipient, setRecipient] = useState<KudosAuthor | null>(null);
  const [content, setContent] = useState<KudosContentNode>(EMPTY_DOC);
  const [contentEmpty, setContentEmpty] = useState(true);
  const [selectedHashtags, setSelectedHashtags] = useState<HashtagRef[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [anonymousDisplayName, setAnonymousDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const canSubmit = !!recipient && !contentEmpty && selectedHashtags.length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!recipient || !canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({
        receiverId: recipient.id,
        content,
        hashtagIds: selectedHashtags.map((tag) => tag.id),
        files,
        isAnonymous,
        anonymousDisplayName: isAnonymous ? anonymousDisplayName : "",
      });
      onClose();
    } catch (error) {
      // `ComposeFooter`'s "Gửi" button binds this handler directly to
      // `onClick` (React never awaits an onClick handler), so a rejection
      // that reached here would otherwise surface as an unhandled promise
      // rejection instead of the caller's own `errorMessage` UI (Phase 07:
      // `onSubmit` throws on purpose to skip the `onClose()` above -- this
      // catch is what makes that a controlled skip instead of a silent
      // async failure). The caller is responsible for its own user-facing
      // message; this only logs for diagnostics and keeps the modal open.
      console.error("KudosComposeDialog: onSubmit rejected", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // mm:520:11647
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("title")}
      data-testid="kudos-compose-dialog"
      className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black/50 p-6"
    >
      <div className="flex w-full max-w-[752px] flex-col items-start gap-8 rounded-[24px] bg-[#FFF8E1] p-10">
        {/* mm:I520:11647;520:9870 */}
        <h2 className="w-full text-center font-body text-[32px] font-bold leading-10 text-canvas">
          {t("title")}
        </h2>

        <RecipientAutocomplete value={recipient} recipients={recipients} onChange={setRecipient} />

        {/* mm:I520:11647;520:9874 */}
        <div className="flex w-full flex-col items-start gap-6">
          <KudosEditor
            recipients={recipients}
            onContentChange={(doc, isEmpty) => {
              setContent(doc);
              setContentEmpty(isEmpty);
            }}
          />
          <HashtagPicker selected={selectedHashtags} options={hashtags} onChange={setSelectedHashtags} />
          <ImageAttachmentGrid files={files} onChange={setFiles} />
        </div>

        <AnonymousToggle
          checked={isAnonymous}
          displayName={anonymousDisplayName}
          onCheckedChange={setIsAnonymous}
          onDisplayNameChange={setAnonymousDisplayName}
        />

        {errorMessage ? (
          <p data-testid="kudos-compose-submit-error" role="alert" className="w-full font-body text-sm font-bold text-badge">
            {errorMessage}
          </p>
        ) : null}

        <ComposeFooter submitDisabled={!canSubmit} onCancel={onClose} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
