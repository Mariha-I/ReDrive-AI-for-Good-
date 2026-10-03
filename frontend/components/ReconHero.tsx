import { CHANNELS } from "@/lib/channels";
import { formatMoney, formatSignedMoney } from "@/lib/format";
import type { ReconResponse } from "@/lib/types";

export default function ReconHero({ result }: { result: ReconResponse }) {
  const best = result.scenarios.find((s) => s.channel === result.recommended_channel) ?? result.scenarios[0];
  const worthIt = result.verdict === "recondition";
  const count = result.items.filter((i) => i.recommended).length;

  return (
    <section className="rounded-2xl bg-brand p-6 text-white shadow-lg sm:p-7">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-300">Reconditioning analysis</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {worthIt ? `Do ${count} ${count === 1 ? "repair" : "repairs"} first` : "Sell as-is"}
          </h2>
          <p className="mt-1 text-sm text-white/70">
            {worthIt
              ? `Then sell through ${CHANNELS[best.channel].label}.`
              : "None of the repairs pay for themselves in the options available to you."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-white/60">
            {worthIt ? "Extra net to you" : "Best net, as-is"}
          </p>
          <p className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
            {worthIt ? formatSignedMoney(best.net_change) : formatMoney(best.as_is.p50)}
          </p>
        </div>
      </div>
      {worthIt && (
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
          <span>
            Repair cost <span className="tabular-nums text-white">{formatMoney(result.package_cost)}</span>
          </span>
          <span>
            Net goes from <span className="tabular-nums text-white">{formatMoney(best.as_is.p50)}</span> to{" "}
            <span className="tabular-nums font-semibold text-white">{formatMoney(best.reconditioned.net.p50)}</span>
          </span>
          <span>
            Sells in about <span className="text-white">{best.reconditioned.days_to_sell} days</span>
          </span>
        </div>
      )}
    </section>
  );
}
