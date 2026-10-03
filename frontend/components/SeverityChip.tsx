import { formatPanel } from "@/lib/format";
import type { DamageItem } from "@/lib/types";

const LEVELS: Record<number, { label: string; className: string }> = {
  1: { label: "Minor", className: "bg-slate-100 text-slate-700 ring-slate-200" },
  2: { label: "Light", className: "bg-amber-50 text-amber-800 ring-amber-200" },
  3: { label: "Moderate", className: "bg-amber-100 text-amber-900 ring-amber-300" },
  4: { label: "Heavy", className: "bg-red-50 text-red-800 ring-red-200" },
  5: { label: "Severe", className: "bg-red-100 text-red-900 ring-red-300" },
};

export default function SeverityChip({ item }: { item: DamageItem }) {
  const level = LEVELS[Math.min(5, Math.max(1, Math.round(item.severity)))];
  return (
    <span className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1 text-sm ring-1 ${level.className}`}>
      <span className="font-medium">{formatPanel(item.panel)}</span>
      <span className="text-xs opacity-80">
        {level.label} · {item.severity}/5
      </span>
      {item.structural && <span className="text-xs font-semibold">Structural</span>}
    </span>
  );
}
