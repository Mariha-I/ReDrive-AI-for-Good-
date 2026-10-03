"use client";

import { useState } from "react";

interface Props {
  codes: string[];
  onChange: (codes: string[]) => void;
}

const OBD_PATTERN = /^[PBCU][0-9A-F]{4}$/;

export default function ObdInput({ codes, onChange }: Props) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  function commit() {
    const parts = draft.toUpperCase().split(/[\s,]+/).filter(Boolean);
    if (parts.length === 0) return;
    const bad = parts.find((p) => !OBD_PATTERN.test(p));
    if (bad) {
      setError(`"${bad}" doesn't look like an OBD code (e.g. P0300).`);
      return;
    }
    onChange(Array.from(new Set([...codes, ...parts])));
    setDraft("");
    setError(null);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2 py-1.5 focus-within:border-lane focus-within:ring-2 focus-within:ring-lane/20">
        {codes.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
            {c}
            <button
              type="button"
              aria-label={`Remove ${c}`}
              onClick={() => onChange(codes.filter((x) => x !== c))}
              className="text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && codes.length) {
              onChange(codes.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={codes.length ? "" : "e.g. P0300, then Enter"}
          className="min-w-[8rem] flex-1 bg-transparent py-0.5 font-mono text-sm uppercase outline-none placeholder:font-sans placeholder:normal-case placeholder:text-slate-400"
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
