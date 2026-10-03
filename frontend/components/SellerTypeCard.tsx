import { CHANNELS, SELLER_TYPES } from "@/lib/channels";
import type { SellerType } from "@/lib/types";
import SellerTypeIcon from "./SellerTypeIcon";

interface Props {
  type: SellerType;
  onSelect: (type: SellerType) => void;
}

export default function SellerTypeCard({ type, onSelect }: Props) {
  const info = SELLER_TYPES[type];
  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-lane hover:shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-lane/25"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-brand transition group-hover:bg-lane-soft group-hover:text-lane">
        <SellerTypeIcon type={type} />
      </span>
      <span className="mt-4 text-xl font-semibold text-slate-900">{info.label}</span>
      <span className="mt-1 text-sm text-slate-600">{info.description}</span>
      <span className="mt-5 border-t border-slate-100 pt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        Available options
      </span>
      <ul className="mt-2 space-y-1">
        {info.channels.map((c) => (
          <li key={c} className="flex items-center gap-2 text-sm text-slate-800">
            <span className="text-lane" aria-hidden="true">✓</span>
            {CHANNELS[c].label}
          </li>
        ))}
      </ul>
      <span className="mt-auto pt-6 text-sm font-semibold text-lane">
        Continue as {info.label.toLowerCase()} <span aria-hidden="true">→</span>
      </span>
    </button>
  );
}
