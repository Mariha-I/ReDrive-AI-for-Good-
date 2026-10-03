"use client";

import { useState } from "react";
import { CHANNELS } from "@/lib/channels";
import { formatMoney } from "@/lib/format";
import type { RouteResponse } from "@/lib/types";
import DamageCard from "./DamageCard";
import HeroCard from "./HeroCard";
import RangeChart from "./RangeChart";
import ReconditionCTA from "./ReconditionCTA";
import RouteOption from "./RouteOption";
import StartSellingBar from "./StartSellingBar";
import VehicleSummary from "./VehicleSummary";

interface Props {
  result: RouteResponse;
  /** Shown when this view is a drill-down from the fleet results */
  onBack?: () => void;
}

export default function Results({ result, onBack }: Props) {
  const [selected, setSelected] = useState(result.recommended);
  const selectedRoute = result.routes.find((r) => r.channel === selected);

  return (
    <div className="animate-fade-up space-y-5">
      {onBack && (
        <button type="button" onClick={onBack} className="text-sm font-medium text-slate-600 hover:text-slate-900">
          ← All vehicles
        </button>
      )}
      <VehicleSummary vehicle={result.vehicle} />
      <HeroCard result={result} />

      <div className="grid gap-5 2xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {result.routes.length > 1 && (
            <RangeChart
              title="Net proceeds by option"
              subtitle="Bar spans the likely range (10th–90th percentile); dot marks the median."
              rows={result.routes.map((r) => ({
                id: r.channel,
                label: CHANNELS[r.channel].label,
                p10: r.net.p10,
                p50: r.net.p50,
                p90: r.net.p90,
                highlight: r.channel === result.recommended,
              }))}
            />
          )}
          <section className="space-y-3" aria-labelledby="options-heading">
            <div>
              <h3 id="options-heading" className="text-base font-semibold text-slate-900">
                {result.routes.length > 1 ? "Choose how to sell" : "Your selling option"}
              </h3>
              <p className="text-sm text-slate-500">Select an option, then press Start Selling.</p>
            </div>
            <div role="radiogroup" aria-labelledby="options-heading" className="space-y-3">
              {result.routes.map((r) => (
                <RouteOption
                  key={r.channel}
                  route={r}
                  recommended={r.channel === result.recommended}
                  selected={r.channel === selected}
                  onSelect={() => setSelected(r.channel)}
                />
              ))}
            </div>
            <ReconditionCTA vehicle={result.vehicle} />
          </section>
          <StartSellingBar
            channel={selectedRoute?.channel ?? null}
            detail={selectedRoute ? `${formatMoney(selectedRoute.net.p50)} expected net` : undefined}
          />
        </div>
        <div className="2xl:sticky 2xl:top-6 2xl:self-start">
          <DamageCard damage={result.damage} />
        </div>
      </div>
    </div>
  );
}
