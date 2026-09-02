import { Fragment, type ReactNode } from "react";
import {
  isAllowedLinkScheme,
  isAllowedMarkType,
  isAllowedNodeType,
  type KudosContentMark,
  type KudosContentNode,
} from "@/lib/kudos/content-schema";

/**
 * Phase 04 (F006) recursive renderer for `kudos.content` TipTap JSON
 * (clarifications.md 2026-08-31 "TipTap JSON thắng ... render an toàn").
 * Defense in depth: even though the write layer (Phase 05) already
 * sanitizes against `ALLOWED_NODE_TYPES`/`ALLOWED_MARK_TYPES`, this walker
 * re-checks every node/mark/link-scheme itself and silently skips anything
 * off the allow-list -- never `dangerouslySetInnerHTML`.
 */

function applyMarks(text: string, marks: KudosContentMark[]): ReactNode {
  return marks.reduce<ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "strike":
        return <s>{acc}</s>;
      case "link": {
        const href = typeof mark.attrs?.href === "string" ? mark.attrs.href : "";
        let scheme = "";
        try {
          scheme = new URL(href).protocol;
        } catch {
          scheme = "";
        }
        if (href && isAllowedLinkScheme(scheme)) {
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
              {acc}
            </a>
          );
        }
        // Disallowed/invalid scheme (e.g. javascript:, data:) -- render as plain text.
        return acc;
      }
      default:
        return acc;
    }
  }, text);
}

function renderChildren(node: KudosContentNode): ReactNode {
  return (node.content ?? []).map((child, index) => renderNode(child, index));
}

function renderMention(node: KudosContentNode, key: number | string): ReactNode {
  const label = typeof node.attrs?.label === "string" ? node.attrs.label : null;
  if (!label) return null;
  return (
    <span key={key} className="font-bold">
      @{label}
    </span>
  );
}

function renderNode(node: KudosContentNode, key: number | string): ReactNode {
  if (!isAllowedNodeType(node.type)) return null;

  switch (node.type) {
    case "doc":
      return <Fragment key={key}>{renderChildren(node)}</Fragment>;
    case "paragraph":
      return <p key={key}>{renderChildren(node)}</p>;
    case "blockquote":
      return (
        <blockquote key={key} className="border-l-2 border-gold pl-3 italic">
          {renderChildren(node)}
        </blockquote>
      );
    case "orderedList":
      return (
        <ol key={key} className="list-decimal pl-5">
          {renderChildren(node)}
        </ol>
      );
    case "listItem":
      return <li key={key}>{renderChildren(node)}</li>;
    case "mention":
      return renderMention(node, key);
    case "text": {
      const marks = (node.marks ?? []).filter((mark) => isAllowedMarkType(mark.type));
      return <Fragment key={key}>{applyMarks(node.text ?? "", marks)}</Fragment>;
    }
    default:
      return null;
  }
}

export interface KudosContentRendererProps {
  content: KudosContentNode;
}

/** Cheap runtime guard before trusting the `KudosContentNode` cast --
 * `content` ultimately comes from a `jsonb` column (Phase 01), so a
 * malformed/null value at runtime is a real possibility the compile-time
 * type alone can't rule out. Renders nothing rather than throwing. */
function isContentNodeShaped(value: unknown): value is KudosContentNode {
  return typeof value === "object" && value !== null && typeof (value as { type?: unknown }).type === "string";
}

/** Safe TipTap JSON -> React renderer, walks only `ALLOWED_NODE_TYPES`. */
export function KudosContentRenderer({ content }: KudosContentRendererProps) {
  if (!isContentNodeShaped(content) || !isAllowedNodeType(content.type)) return null;
  return <>{renderNode(content, "root")}</>;
}
