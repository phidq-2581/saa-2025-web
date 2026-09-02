"use client";

import type { ComponentType } from "react";
import type { Editor } from "@tiptap/react";
import { useTranslations } from "next-intl";
import {
  IconBold,
  IconItalic,
  IconStrike,
  IconOrderedList,
  IconLink,
  IconQuote,
} from "./compose-icons";

export type EditorToolbarProps = {
  editor: Editor | null;
  onOpenAddLink: () => void;
};

type IconComponent = ComponentType<{ className?: string }>;

type ToolbarButton = {
  testId: string;
  Icon: IconComponent;
  labelKey: "bold" | "italic" | "strike" | "orderedList" | "link" | "quote";
  isActive: (editor: Editor) => boolean;
  run: (editor: Editor) => void;
};

const BUTTONS: ToolbarButton[] = [
  {
    testId: "kudos-compose-toolbar-bold",
    Icon: IconBold,
    labelKey: "bold",
    isActive: (editor) => editor.isActive("bold"),
    run: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    testId: "kudos-compose-toolbar-italic",
    Icon: IconItalic,
    labelKey: "italic",
    isActive: (editor) => editor.isActive("italic"),
    run: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    testId: "kudos-compose-toolbar-strike",
    Icon: IconStrike,
    labelKey: "strike",
    isActive: (editor) => editor.isActive("strike"),
    run: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  {
    testId: "kudos-compose-toolbar-ordered-list",
    Icon: IconOrderedList,
    labelKey: "orderedList",
    isActive: (editor) => editor.isActive("orderedList"),
    run: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
];

/**
 * Editor formatting toolbar (mms_C_Chức năng, 520:9877): Bold/Italic/
 * Stroke/Number/Link/Quote (spec C.1-C.6), plus the inert "Tiêu chuẩn cộng
 * đồng" text (no destination this round, same class as other deferred
 * targets -- clarifications.md). The link button opens the Addlink Box
 * dialog rather than toggling a mark directly (that dialog owns the
 * insert). Left-aligned, flush with the field's left edge: the frame's own
 * `justifyContent: flex-end` only makes sense against its full captured
 * width (1006px), which includes an empty/off-canvas trailing "Title"
 * instance past the dialog's real 672px content edge -- replicating
 * flex-end without that instance just pushes every button off to the
 * right, leaving a large empty leading gap (visual-QA delivery report).
 */
export function EditorToolbar({ editor, onOpenAddLink }: EditorToolbarProps) {
  const t = useTranslations("compose.toolbar");
  if (!editor) return null;

  return (
    // mm:I520:11647;520:9877
    <div className="flex w-full items-center justify-start rounded-t-panel border border-b-0 border-border-gold">
      {BUTTONS.map(({ testId, Icon, labelKey, isActive, run }) => (
        <button
          key={testId}
          type="button"
          onClick={() => run(editor)}
          aria-label={t(labelKey)}
          aria-pressed={isActive(editor)}
          data-testid={testId}
          className={`flex h-10 items-center justify-center border-r border-border-gold px-4 py-2.5 ${
            isActive(editor) ? "bg-gold-10" : ""
          }`}
        >
          <Icon className="h-5 w-5 text-canvas" />
        </button>
      ))}
      <button
        type="button"
        onClick={onOpenAddLink}
        aria-label={t("link")}
        data-testid="kudos-compose-toolbar-link"
        className="flex h-10 items-center justify-center border-r border-border-gold px-4 py-2.5"
      >
        <IconLink className="h-5 w-5 text-canvas" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label={t("quote")}
        aria-pressed={editor.isActive("blockquote")}
        data-testid="kudos-compose-toolbar-blockquote"
        className={`flex h-10 items-center justify-center px-4 py-2.5 ${
          editor.isActive("blockquote") ? "bg-gold-10" : ""
        }`}
      >
        <IconQuote className="h-5 w-5 text-canvas" />
      </button>
      {/* mm:I520:11647;3053:11619 -- decorative, no destination this round */}
      <span
        aria-disabled="true"
        className="ml-2 flex h-10 items-center px-4 font-body text-base font-bold text-[#E46060]"
      >
        {t("communityStandards")}
      </span>
    </div>
  );
}
