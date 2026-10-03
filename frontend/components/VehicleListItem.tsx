import type { ReactNode } from "react";
import type { VehicleDraft } from "@/lib/drafts";

interface Props {
  index: number;
  draft: VehicleDraft;
  expanded: boolean;
  invalid: boolean;
  canRemove: boolean;
  onExpand: () => void;
  onRemove: () => void;
  children: ReactNode;
}

/** One vehicle in the intake list: a summary row that expands into its fields. */
export default function VehicleListItem({ index, draft, expanded, invalid, canRemove, onExpand, onRemove, children }: Props) {
  const summary = draft.vin ? (
    <span className="font-mono text-xs tracking-wider text-slate-600">{draft.vin}</span>
  ) : (
    <span className="text-xs text-slate-400">No VIN yet</span>
  );

  return (
    <li className={`rounded-xl border ${invalid ? "border-red-300" : expanded ? "border-slate-300" : "border-slate-200"} bg-white`}>
      <div className="flex items-center gap-3 px-3 py-2.5">
        <button type="button" onClick={onExpand} className="flex min-w-0 flex-1 items-center gap-3 text-left" aria-expanded={expanded}>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-slate-900">Vehicle {index + 1}</span>
            <span className="block truncate">{summary}</span>
          </span>
          {invalid && <span className="ml-auto text-xs font-medium text-red-600">Needs info</span>}
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove vehicle ${index + 1}`}
            className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            Remove
          </button>
        )}
      </div>
      {expanded && <div className="border-t border-slate-100 px-3 pb-4 pt-3">{children}</div>}
    </li>
  );
}
