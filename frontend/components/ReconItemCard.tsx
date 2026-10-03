import { formatMoney, formatSignedMoney } from "@/lib/format";
import type { ReconItem } from "@/lib/types";

export default function ReconItemCard({ item }: { item: ReconItem }) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border bg-white p-5 shadow-sm ${
        item.recommended ? "border-lane/50" : "border-slate-200"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
          {item.kind === "repair" ? "Repair" : "Upgrade"}
        </span>
        {item.recommended ? (
          <span className="rounded-md bg-lane-soft px-2 py-0.5 text-xs font-semibold text-lane">✓ Worth doing</span>
        ) : (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">✕ Skip</span>
        )}
      </div>
      <h4 className="mt-2 font-semibold text-slate-900">{item.name}</h4>
      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
      <p className="mt-2 text-sm italic text-slate-500">{item.reason}</p>

      <dl className="mt-auto grid grid-cols-4 gap-2 border-t border-slate-100 pt-3 text-center tabular-nums">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Cost</dt>
          <dd className="font-medium text-slate-900">{formatMoney(item.cost)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Adds</dt>
          <dd className="font-medium text-slate-900">{formatMoney(item.value_lift)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Net</dt>
          <dd className={`font-semibold ${item.net_gain > 0 ? "text-lane" : "text-red-700"}`}>
            {formatSignedMoney(item.net_gain)}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-slate-500">Time</dt>
          <dd className="font-medium text-slate-900">
            {item.days_added === 0 ? "—" : `+${item.days_added}d`}
          </dd>
        </div>
      </dl>
    </article>
  );
}
