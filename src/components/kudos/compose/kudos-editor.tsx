"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import { useTranslations } from "next-intl";
import type { KudosContentNode } from "@/lib/kudos/content-schema";
import type { KudosAuthor } from "@/lib/kudos/types";
import { EditorToolbar } from "./editor-toolbar";
import { AddlinkDialog } from "./addlink-dialog";
import { createMentionSuggestion } from "./mention-suggestion";

export type KudosEditorProps = {
  recipients: KudosAuthor[];
  onContentChange: (content: KudosContentNode, isEmpty: boolean) => void;
};

/**
 * TipTap-backed "Nhập nội dung" field (mms_D_text filed, 520:9886 + toolbar
 * 520:9877). `immediatelyRender: false` avoids the Next.js SSR hydration
 * mismatch (Known trap). StarterKit disables everything outside the
 * `content-schema.ts` allow-list (heading/codeBlock/code/bulletList/
 * horizontalRule/underline/hardBreak) and keeps its already-bundled `link`
 * + `orderedList`/`listItem` -- adding `@tiptap/extension-link` on top
 * would throw a duplicate-extension-name error at mount (Known trap).
 */
export function KudosEditor({ recipients, onContentChange }: KudosEditorProps) {
  const t = useTranslations("compose.editor");
  const [isEmpty, setIsEmpty] = useState(true);
  const [touched, setTouched] = useState(false);
  const [addLinkOpen, setAddLinkOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        code: false,
        bulletList: false,
        horizontalRule: false,
        underline: false,
        hardBreak: false,
        link: {
          openOnClick: false,
          autolink: false,
          HTMLAttributes: { rel: "noopener noreferrer nofollow" },
        },
      }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: createMentionSuggestion(recipients),
      }),
    ],
    editorProps: {
      attributes: {
        "data-testid": "kudos-compose-editor",
        class: "min-h-[200px] w-full px-6 py-4 font-body text-base font-bold text-canvas outline-none",
      },
    },
    onCreate: ({ editor }) => setIsEmpty(editor.isEmpty),
    onUpdate: ({ editor }) => {
      setIsEmpty(editor.isEmpty);
      onContentChange(editor.getJSON() as KudosContentNode, editor.isEmpty);
    },
    onBlur: () => setTouched(true),
  });

  const invalid = touched && isEmpty;

  return (
    // mm:I520:11647;520:9876
    <div className="flex w-full flex-col items-start gap-1">
      <EditorToolbar editor={editor} onOpenAddLink={() => setAddLinkOpen(true)} />
      <div
        className={`relative w-full rounded-b-panel border bg-white ${
          invalid ? "border-[#CF1322]" : "border-border-gold"
        }`}
      >
        {isEmpty && (
          <p className="pointer-events-none absolute left-6 top-4 font-body text-base font-bold text-[#999999]">
            {t("placeholder")}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* mm:I520:11647;520:9887 -- node position is centered within the
          672px row (109px symmetric gaps either side of the 454px text
          box), not space-between */}
      <div className="flex w-full flex-col items-center gap-1">
        <p className="text-center font-body text-base font-bold text-canvas">{t("hint")}</p>
        {invalid && (
          <p className="font-body text-sm font-bold text-[#CF1322]">{t("requiredError")}</p>
        )}
      </div>

      <AddlinkDialog
        open={addLinkOpen}
        onCancel={() => setAddLinkOpen(false)}
        onSave={(text, link) => {
          editor
            ?.chain()
            .focus()
            .insertContent({ type: "text", text, marks: [{ type: "link", attrs: { href: link } }] })
            .run();
          setAddLinkOpen(false);
        }}
      />
    </div>
  );
}
