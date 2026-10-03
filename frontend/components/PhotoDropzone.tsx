"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  photos: File[];
  onChange: (photos: File[]) => void;
}

const MAX_PHOTOS = 12;

export default function PhotoDropzone({ photos, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function add(files: FileList | null) {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    onChange([...photos, ...images].slice(0, MAX_PHOTOS));
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging
            ? "border-lane bg-lane-soft"
            : "border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white"
        }`}
      >
        <CameraIcon />
        <span className="mt-2 text-sm font-medium text-slate-700">
          Drag photos here or <span className="text-lane underline">browse</span>
        </span>
        <span className="mt-1 text-xs text-slate-500">
          Front, rear, both sides, interior, odometer · up to {MAX_PHOTOS}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />

      {photos.length > 0 && (
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {photos.map((file, i) => (
            <li key={`${file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob previews */}
              <img src={previews[i]} alt={file.name} className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                onClick={() => onChange(photos.filter((_, j) => j !== i))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-xs text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-slate-400" aria-hidden="true">
      <path d="M4 8h3l2-2.5h6L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
