"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import cloud from "d3-cloud";
import { select } from "d3-selection";
import { zoom, type D3ZoomEvent } from "d3-zoom";
import type { SpotlightNode } from "./kudos-board-types";

const WORD_FONT_SIZE = 20;
const CLOUD_PADDING = 4;
const DEFAULT_WIDTH = 1060;
const DEFAULT_HEIGHT = 380;

interface SpotlightWord {
  text: string;
  size: number;
  kudosId: string;
  receivedAt: string | null;
  x?: number;
  y?: number;
  rotate?: number;
}

export interface SpotlightCloudCanvasProps {
  nodes: SpotlightNode[];
  onNodeClick: (kudosId: string) => void;
}

/**
 * B.7_Spotlight word cloud (2940:14174 region, `spec B.7`: "Bảng tương tác
 * hiển thị tên người nhận Kudos dưới dạng word cloud... Hover: tooltip tên +
 * thời gian... Click node: mở chi tiết... Pan/Zoom: hỗ trợ pan và zoom bằng
 * nút 'Pan/Zoom' và thao tác chuột"). `SpotlightNode` (src/lib/kudos/types.ts)
 * is `{ kudosId, recipientName, receivedAt }` -- one row per kudos, with no
 * numeric weight field -- so every node renders as its own cloud word at a
 * uniform base size, which also matches the mockup's near-uniform
 * repeated-name tiles (~6.6-8px at design scale, e.g. nodes 2995:15926 /
 * 2940:14186), rather than inventing a size-by-count scheme.
 *
 * KNOWN TRAP: d3-cloud measures text on an offscreen `<canvas>` and touches
 * `document`, so the layout call only ever runs inside an effect (client
 * mount), never at render/SSR time; this file's own `"use client"` plus that
 * effect boundary is sufficient -- no `next/dynamic(..., { ssr: false })`
 * needed since nothing here runs synchronously during the render pass.
 *
 * BUG FOUND (empty cloud in visual review): a single `getBoundingClientRect()`
 * read at mount time raced the page's own layout settling (many client
 * components mounting together, the Montserrat webfont loading async) --
 * `rect?.width || DEFAULT_WIDTH` only falls back when width is exactly `0`
 * (falsy), so a small-but-nonzero early measurement was used as-is, handing
 * d3-cloud too cramped a canvas to place any of the words (confirmed:
 * d3-cloud itself places 14/14 sample words correctly in an isolated
 * real-Chromium check at the intended 1060x380 size -- the layout algorithm
 * was never the problem). Fixed with `ResizeObserver`, which reports the
 * container's REAL settled size (fires once immediately on `.observe()`,
 * then again on any later resize) instead of a single early snapshot.
 */
export function SpotlightCloudCanvas({ nodes, onNodeClick }: SpotlightCloudCanvasProps) {
  const t = useTranslations("kudos");
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const [words, setWords] = useState<SpotlightWord[]>([]);
  const [dimensions, setDimensions] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const [hovered, setHovered] = useState<SpotlightWord | null>(null);
  const [mode, setMode] = useState<"pan" | "zoom">("pan");

  // mm:2940:14174 -- d3-cloud layout, client-only (canvas text measurement),
  // re-run whenever the container's real size settles or changes.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const runLayout = (width: number, height: number) => {
      setDimensions({ width, height });

      if (nodes.length === 0) {
        setWords([]);
        return;
      }

      const layout = cloud<SpotlightWord>()
        .size([width, height])
        .words(
          nodes.map((node) => ({
            text: node.recipientName ?? "",
            size: WORD_FONT_SIZE,
            kudosId: node.kudosId,
            receivedAt: node.receivedAt,
          })),
        )
        .padding(CLOUD_PADDING)
        .rotate(0)
        .font("Montserrat")
        .fontSize((word) => word.size ?? WORD_FONT_SIZE)
        .on("end", (placed) => setWords(placed));

      layout.start();
    };

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) runLayout(width, height);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [nodes]);

  // mm:3007:17479 -- d3-zoom pan/zoom on the word <g>, toggled pan vs zoom
  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    if (!svg || !group) return;

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent(mode === "zoom" ? [0.6, 3] : [1, 1])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        select(group).attr("transform", event.transform.toString());
      });

    select(svg).call(zoomBehavior);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, [mode]);

  return (
    <div className="relative mt-6">
      {/* mm:2940:14174 */}
      <div ref={containerRef} data-testid="spotlight-cloud" className="h-95 w-full">
        <svg ref={svgRef} className="h-full w-full">
          <g ref={groupRef} transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}>
            {words.map((word) => (
              <text
                key={word.kudosId}
                x={word.x}
                y={word.y}
                fontFamily="Montserrat"
                fontWeight={700}
                fontSize={word.size}
                textAnchor="middle"
                className="cursor-pointer fill-white transition-opacity hover:opacity-80"
                onClick={() => onNodeClick(word.kudosId)}
                onMouseEnter={() => setHovered(word)}
                onMouseLeave={() =>
                  setHovered((current) => (current?.kudosId === word.kudosId ? null : current))
                }
              >
                {word.text}
              </text>
            ))}
          </g>
        </svg>
      </div>

      {hovered ? (
        <div
          role="tooltip"
          className="pointer-events-none absolute top-2 left-1/2 -translate-x-1/2 rounded-chip bg-panel px-3 py-1.5 font-body text-xs text-white shadow-glow-gold"
        >
          {hovered.text}
          {hovered.receivedAt ? ` · ${new Date(hovered.receivedAt).toLocaleString("vi-VN")}` : null}
        </div>
      ) : null}

      {/* mm:3007:17479 -- no mm_media_* child node in MoMorph (empty 30x30
          frame); standard "move" pan/zoom icon used as a documented fallback */}
      <button
        type="button"
        data-testid="spotlight-pan-zoom-toggle"
        aria-pressed={mode === "zoom"}
        title={t("spotlight.panZoomLabel")}
        onClick={() => setMode((current) => (current === "pan" ? "zoom" : "pan"))}
        className="absolute right-4 bottom-4 flex h-7.5 w-7.5 items-center justify-center rounded-full border border-border-gold bg-gold-10 text-white"
      >
        <PanZoomIcon className="h-4 w-4" />
        <span className="sr-only">{t("spotlight.panZoomLabel")}</span>
      </button>
    </div>
  );
}

function PanZoomIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <g stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <polyline points="5 9 2 12 5 15" />
        <polyline points="9 5 12 2 15 5" />
        <polyline points="15 19 12 22 9 19" />
        <polyline points="19 9 22 12 19 15" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <line x1="12" y1="2" x2="12" y2="22" />
      </g>
    </svg>
  );
}
