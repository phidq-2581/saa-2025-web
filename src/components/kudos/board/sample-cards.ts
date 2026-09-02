import type { FeedPage, HashtagRef } from "@/lib/kudos/types";
import type { KudosCardSample } from "./kudos-board-types";
import { CARD_CONTENT_HASHTAGS, CURRENT_VIEWER_ID, findPerson } from "./sample-reference-data";

/**
 * Phase 04 (F006) sample kudos cards for the Highlight carousel and the All
 * Kudos feed. Content text is the one placeholder paragraph the MoMorph
 * frame repeats across every card mockup (B.4.2/C.3.5 `character`,
 * verbatim) -- reused rather than invented, same precedent as the round-1
 * Homepage award-card placeholder sentence.
 */

const PLACEHOLDER_CONTENT =
  "Cảm ơn người em bình thường nhưng phi thường :D Cảm ơn sự chăm chỉ, cần mẫn của em đã tạo động lực rất nhiều cho team, để luôn nhắc mình luôn phải nỗ lực hơn nữa trong công việc. <3 và cuộc sống...";

function paragraph(text: string) {
  return {
    type: "doc" as const,
    content: [
      { type: "paragraph" as const, content: [{ type: "text" as const, text }] },
    ],
  };
}

/** Cycles the two design-sourced content tags (B.4.3/C.3.7 `character`:
 * "#Dedicated #Inspring...") to `count` chips, some cards intentionally
 * over 5 to exercise the 1-line truncation rule (spec B.3/C.3.7). */
function contentHashtags(count: number): HashtagRef[] {
  return Array.from({ length: count }, (_, index) => {
    const base = CARD_CONTENT_HASHTAGS[index % CARD_CONTENT_HASHTAGS.length];
    return { id: `${base.id}-${index}`, name: base.name };
  });
}

let cardSeq = 0;
function buildCard(
  senderId: string,
  receiverId: string,
  opts: { heartCount: number; hashtagCount: number; images: number; hoursAgo: number },
): KudosCardSample {
  cardSeq += 1;
  const sender = findPerson(senderId);
  const receiver = findPerson(receiverId);
  const createdAt = new Date(Date.UTC(2025, 9, 30, 10, 0) - opts.hoursAgo * 3600_000).toISOString();
  return {
    id: `sample-kudos-${cardSeq}`,
    sender: { id: sender.id, fullName: sender.fullName, avatarUrl: sender.avatarUrl },
    receiver: { id: receiver.id, fullName: receiver.fullName, avatarUrl: receiver.avatarUrl },
    content: paragraph(PLACEHOLDER_CONTENT),
    isAnonymous: false,
    anonymousDisplayName: null,
    createdAt,
    heartCount: opts.heartCount,
    hashtags: contentHashtags(opts.hashtagCount),
    imagePaths: Array.from({ length: opts.images }, () => "/kudos-board/sample-attachment.png"),
    senderMeta: sender.meta,
    receiverMeta: receiver.meta,
  };
}

/** 5 cards for the Highlight carousel (spec B.2: "5 card kudos có nhiều
 * tim nhất", RED assertion 2 requires exactly 5 `kudos-board-carousel-slide`
 * elements). Ordered by descending heart count, matching "nhiều tim nhất". */
export const HIGHLIGHT_SLIDES: KudosCardSample[] = [
  buildCard("u-hiep", "u-an", { heartCount: 1280, hashtagCount: 2, images: 0, hoursAgo: 2 }),
  buildCard("u-chuc", "u-trang", { heartCount: 964, hashtagCount: 3, images: 0, hoursAgo: 5 }),
  buildCard("u-thuy", "u-linh", { heartCount: 812, hashtagCount: 2, images: 0, hoursAgo: 9 }),
  buildCard("u-quy", "u-xuan", { heartCount: 705, hashtagCount: 4, images: 0, hoursAgo: 14 }),
  buildCard("u-an", "u-hiep", { heartCount: 611, hashtagCount: 2, images: 0, hoursAgo: 20 }),
];

/** One page of the All Kudos feed (spec C.2: "Danh sách 'Kudos' dạng thẻ").
 * `nextOffset: null` -- Phase 07 wires real infinite scroll against the
 * live `kudos_card_view` query; this sample never has a second page.
 * One card (index 3) is authored by `CURRENT_VIEWER_ID` so the heart
 * button renders disabled on the sender's own kudos (spec C.4.1). */
const FEED_ITEMS: KudosCardSample[] = [
  buildCard("u-xuan", "u-hiep", { heartCount: 342, hashtagCount: 2, images: 5, hoursAgo: 1 }),
  buildCard("u-trang", "u-quy", { heartCount: 210, hashtagCount: 6, images: 2, hoursAgo: 3 }),
  buildCard("u-linh", "u-thuy", { heartCount: 156, hashtagCount: 1, images: 0, hoursAgo: 6 }),
  buildCard(CURRENT_VIEWER_ID, "u-chuc", { heartCount: 98, hashtagCount: 2, images: 0, hoursAgo: 8 }),
  buildCard("u-an", "u-xuan", { heartCount: 87, hashtagCount: 3, images: 1, hoursAgo: 11 }),
  buildCard("u-hiep", "u-linh", { heartCount: 64, hashtagCount: 2, images: 0, hoursAgo: 15 }),
  buildCard("u-quy", "u-an", { heartCount: 51, hashtagCount: 5, images: 3, hoursAgo: 19 }),
  buildCard("u-chuc", "u-trang", { heartCount: 33, hashtagCount: 2, images: 0, hoursAgo: 24 }),
];

export const FEED_PAGES: FeedPage[] = [{ items: FEED_ITEMS, nextOffset: null }];

/** Empty variant for the Vitest unit (spec C.2 "Trường hợp không có Kudos
 * nào, hiển thị text 'Hiện tại chưa có Kudos nào.'", TC 926d92a5/d035e3b8). */
export const EMPTY_FEED_PAGES: FeedPage[] = [];
