import { CHANNELS } from "@/lib/channels";
import { formatMoney, formatSignedMoney } from "@/lib/format";
import type { ReconScenario } from "@/lib/types";
import CostBreakdown from "./CostBreakdown";
import SelectableCard from "./SelectableCard";

interface Props {
  scenario: ReconScenario;
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
}

export default function ReconScenarioOption({ scenario, recommended, selected, onSelect }: Props) {
  const info = CHANNELS[scenario.channel];
  const gain = scenario.net_change > 0;
  const after = scenario.reconditioned;

  return (
    <SelectableCard name="recon-scenario" value={scenario.channel} selected={selected} onSelect={onSelect}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
            {info.label}
            {recommended && (
              <span className="rounded-full bg-lane-soft px-2 py-0.5 text-xs font-medium text-lane">Best after repairs</span>
            )}
          </h4>
          <p className="text-xs text-slate-500">Sells in about {after.days_to_sell} days, including repair time.</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums ${
            gain ? "bg-lane-soft text-lane" : "bg-red-50 text-red-700"
          }`}
        >
          {formatSignedMoney(scenario.net_change)} vs as-is
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 tabular-nums">
        <div>
          <p className="text-xs text-slate-500">Sell as-is</p>
          <p className="text-lg font-semibold text-slate-700">{formatMoney(scenario.as_is.p50)}</p>
          <p className="text-xs text-slate-500">
            {formatMoney(scenario.as_is.p10)} – {formatMoney(scenario.as_is.p90)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">After reconditioning</p>
          <p className="text-lg font-semibold text-slate-900">{formatMoney(after.net.p50)}</p>
          <p className="text-xs text-slate-500">
            {formatMoney(after.net.p10)} – {formatMoney(after.net.p90)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{scenario.explanation}</p>

      {/* details is interactive content, so clicks inside it don't toggle the surrounding radio label */}
      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
          <span className="transition-transform group-open:rotate-90" aria-hidden="true">›</span>
          Cost breakdown after reconditioning
        </summary>
        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
          <CostBreakdown breakdown={after.breakdown} medianNet={after.net.p50} />
        </div>
      </details>
    </SelectableCard>
  );
}
