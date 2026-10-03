import { formatMoney } from "@/lib/format";
import type { BatchSummary } from "@/lib/types";

export default function FleetSummary({ summary }: { summary: BatchSummary }) {
  return (
    <section className="rounded-2xl bg-brand p-6 text-white shadow-lg sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Multi-unit projection</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {summary.units} vehicles
          </h2>
          <p className="text-sm text-white/60">Using the best option for each vehicle</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-white/60">Projected total net</p>
          <p className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
            {formatMoney(summary.total_net.p50)}
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
        <span>
          Likely range{" "}
          <span className="tabular-nums text-white">
            {formatMoney(summary.total_net.p10)} – {formatMoney(summary.total_net.p90)}
          </span>
        </span>
        <span>
          All sold in about <span className="text-white">{summary.days_to_sell_all} days</span>
        </span>
      </div>
    </section>
  );
}
