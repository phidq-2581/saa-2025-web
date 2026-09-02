import { computePosition, flip, shift, offset } from "@floating-ui/dom";
import type { SuggestionOptions } from "@tiptap/suggestion";

type MentionItem = { id: string; fullName: string | null };

/**
 * TipTap `Mention` suggestion (`@` + name, spec D "Cho phép '@' + tên để
 * nhắc đồng nghiệp", TC ID-12/13). Filters the same design-sourced
 * recipient pool as the recipient field. Positioned with `@floating-ui/dom`
 * (installed Phase 01 for exactly this) against TipTap's caret rect --
 * plain DOM (no React portal) since Suggestion's `render()` callback runs
 * outside React's tree.
 */
export function createMentionSuggestion(
  recipients: MentionItem[],
): Partial<SuggestionOptions<MentionItem>> {
  let popup: HTMLDivElement | null = null;
  let activeCommand: ((item: MentionItem) => void) | null = null;

  function destroy() {
    popup?.remove();
    popup = null;
  }

  function renderList(items: MentionItem[], emptyLabel: string) {
    if (!popup) return;
    popup.innerHTML = "";
    if (items.length === 0) {
      const empty = document.createElement("p");
      empty.className = "px-4 py-2 font-body text-sm font-bold text-[#999999]";
      empty.textContent = emptyLabel;
      popup.appendChild(empty);
      return;
    }
    for (const item of items) {
      const button = document.createElement("button");
      button.type = "button";
      button.className =
        "w-full rounded-xs px-4 py-2 text-left font-body text-base font-bold text-white hover:bg-gold-10";
      button.textContent = item.fullName ?? "";
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        activeCommand?.(item);
      });
      popup.appendChild(button);
    }
  }

  async function updatePosition(getRect: () => DOMRect | null) {
    if (!popup) return;
    const rect = getRect();
    if (!rect) return;
    const virtualEl = { getBoundingClientRect: () => rect };
    const { x, y } = await computePosition(virtualEl, popup, {
      placement: "bottom-start",
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });
    Object.assign(popup.style, { left: `${x}px`, top: `${y}px` });
  }

  return {
    items: ({ query }) =>
      recipients
        .filter((person) => (person.fullName ?? "").toLowerCase().includes(query.toLowerCase()))
        .slice(0, 8),
    render: () => ({
      onStart: (props) => {
        activeCommand = props.command;
        popup = document.createElement("div");
        popup.setAttribute("data-testid", "kudos-compose-mention-list");
        popup.className =
          "fixed z-30 flex w-60 flex-col gap-1 rounded-panel border border-border-gold bg-panel p-1.5";
        document.body.appendChild(popup);
        renderList(props.items, "");
        void updatePosition(props.clientRect ?? (() => null));
      },
      onUpdate: (props) => {
        activeCommand = props.command;
        renderList(props.items, "");
        void updatePosition(props.clientRect ?? (() => null));
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          destroy();
          return true;
        }
        return false;
      },
      onExit: () => destroy(),
    }),
  };
}
