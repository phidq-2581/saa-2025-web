"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { IconPlus } from "./compose-icons";

export type ImageAttachmentGridProps = {
  files: File[];
  onChange: (files: File[]) => void;
};

const MAX_IMAGES = 5;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Caches one `URL.createObjectURL` per `File` (keyed by File identity, not
 * index) instead of calling it inline in JSX on every render -- that leaked
 * one blob URL per attachment per keystroke for the life of the tab
 * (reviewer High finding). The authoritative cache lives in a ref but is
 * only ever read/written inside effects, never during render (`
 * react-hooks/refs` forbids ref access in the render body even when it
 * would be safe) -- render reads a plain `useState` snapshot mirrored from
 * that ref instead. Revocation happens for any file no longer present in
 * `files`, and for every remaining URL on unmount.
 */
function useObjectUrls(files: File[]): Map<File, string> {
  const cacheRef = useRef<Map<File, string>>(new Map());
  const [snapshot, setSnapshot] = useState<Map<File, string>>(() => new Map());

  useEffect(() => {
    const cache = cacheRef.current;
    for (const file of files) {
      if (!cache.has(file)) {
        cache.set(file, URL.createObjectURL(file));
      }
    }
    for (const [file, url] of cache) {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url);
        cache.delete(file);
      }
    }
    setSnapshot(new Map(cache));
  }, [files]);

  useEffect(() => {
    const cache = cacheRef.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  return snapshot;
}

/**
 * "Image" attachment field (mms_F_Frame 537, 520:9896): up to 5 thumbnails
 * (80x80, radius 18) each with a small red remove button, "+ Image" add
 * button (hidden at 5, spec F.5), hidden native file input. Label 'Image'
 * sits to the LEFT of the row, same row pattern as Người nhận/Hashtag --
 * visual-QA delivery report corrected the earlier column-stack reading of
 * spec F.1's "phía trên" text; the reference screenshot settles it.
 * Client-side validation only: jpg/png/webp, <=5MB (clarifications.md
 * assumption, logged).
 */
export function ImageAttachmentGrid({ files, onChange }: ImageAttachmentGridProps) {
  const t = useTranslations("compose.image");
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const previewUrls = useObjectUrls(files);

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = [...files];
    let firstError: string | null = null;

    for (const file of Array.from(selected)) {
      if (next.length >= MAX_IMAGES) break;
      if (!ALLOWED_TYPES.includes(file.type)) {
        firstError = t("invalidFormatError");
        continue;
      }
      if (file.size > MAX_SIZE_BYTES) {
        firstError = t("tooLargeError");
        continue;
      }
      next.push(file);
    }

    setError(firstError);
    onChange(next);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    // mm:520:9896
    <div className="flex w-full flex-col items-start gap-2">
      <div className="flex w-full items-center gap-4">
        {/* mm:I520:11647;520:9897 */}
        <span className="shrink-0 font-body text-[22px] font-bold text-canvas">{t("label")}</span>

        <div className="flex flex-1 flex-wrap items-center gap-4" data-testid="kudos-compose-image-grid">
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="relative h-20 w-20 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrls.get(file)}
                alt=""
                data-testid="kudos-compose-image-thumb"
                className="h-20 w-20 rounded-[18px] border border-border-gold bg-white object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
                aria-label="remove"
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-pill bg-badge"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/kudos-compose/icon-image-remove.svg" alt="" width={14} height={14} aria-hidden="true" />
              </button>
            </div>
          ))}

          {files.length < MAX_IMAGES && (
            // mm:I520:11647;662:9132
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              data-testid="kudos-compose-image-add"
              className="flex h-12 items-center gap-2 rounded-panel border border-border-gold bg-white px-2 py-1 font-body text-[11px] font-bold leading-4 tracking-[0.5px] text-[#999999]"
            >
              <IconPlus className="h-6 w-6 shrink-0 text-[#999999]" />
              <span className="whitespace-pre-line text-left">
                {t("addButtonLabel")}
                {"\n"}
                {t("addButtonNote")}
              </span>
            </button>
          )}

          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleFiles(event.target.files)}
            data-testid="kudos-compose-image-input"
            className="sr-only"
          />
        </div>
      </div>

      {error && (
        <p data-testid="kudos-compose-image-error" className="font-body text-sm font-bold text-[#CF1322]">
          {error}
        </p>
      )}
    </div>
  );
}
