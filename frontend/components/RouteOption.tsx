import { CHANNELS } from "@/lib/channels";
import { formatMoney } from "@/lib/format";
import type { Route } from "@/lib/types";
import CostBreakdown from "./CostBreakdown";
import SelectableCard from "./SelectableCard";

interface Props {
  route: Route;
  recommended: boolean;
  selected: boolean;
  onSelect: () => void;
}

export default function RouteOption({ route, recommended, selected, onSelect }: Props) {
  const info = CHANNELS[route.channel];

  return (
    <SelectableCard name="route" value={route.channel} selected={selected} onSelect={onSelect}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="flex flex-wrap items-center gap-2 font-semibold text-slate-900">
            {info.label}
            {recommended && (
              <span className="rounded-full bg-lane-soft px-2 py-0.5 text-xs font-medium text-lane">Recommended</span>
            )}
          </h4>
          <p className="text-xs text-slate-500">
            {info.blurb} Sells in about {route.days_to_sell} days.
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold tabular-nums text-slate-900">{formatMoney(route.net.p50)}</p>
          <p className="text-xs tabular-nums text-slate-500">
            {formatMoney(route.net.p10)} – {formatMoney(route.net.p90)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-slate-600">{route.explanation}</p>

      {/* details is interactive content, so clicks inside it don't toggle the surrounding radio label */}
      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900">
          <span className="transition-transform group-open:rotate-90" aria-hidden="true">›</span>
          Cost breakdown
        </summary>
        <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2">
          <CostBreakdown breakdown={route.breakdown} medianNet={route.net.p50} />
        </div>
      </details>
    </SelectableCard>
  );
}
