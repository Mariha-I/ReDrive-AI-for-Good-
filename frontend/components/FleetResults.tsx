"use client";

import { useState } from "react";
import { formatMoney } from "@/lib/format";
import type { BatchResponse, Channel } from "@/lib/types";
import ChannelGroupOption from "./ChannelGroupOption";
import FleetSummary from "./FleetSummary";
import FleetVehicleList from "./FleetVehicleList";
import RangeChart from "./RangeChart";
import Results from "./Results";
import StartSellingBar from "./StartSellingBar";

export default function FleetResults({ result }: { result: BatchResponse }) {
  const { results, summary } = result;
  const [selected, setSelected] = useState<Channel | null>(summary.by_channel[0]?.channel ?? null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (openIndex !== null) {
    return <Results key={openIndex} result={results[openIndex]} onBack={() => setOpenIndex(null)} />;
  }

  const group = summary.by_channel.find((g) => g.channel === selected);

  return (
    <div className="animate-fade-up space-y-5">
      <FleetSummary summary={summary} />

      <RangeChart
        title="Expected net per vehicle"
        subtitle="Best option for each vehicle. Bar spans the likely range; dot marks the median."
        rows={results.map((r, i) => {
          const best = r.routes.find((x) => x.channel === r.recommended) ?? r.routes[0];
          return {
            id: String(i),
            label: `${r.vehicle.year} ${r.vehicle.make} ${r.vehicle.model}`,
            p10: best.net.p10,
            p50: best.net.p50,
            p90: best.net.p90,
            highlight: true,
          };
        })}
      />

      <section className="space-y-3" aria-labelledby="groups-heading">
        <div>
          <h3 id="groups-heading" className="text-base font-semibold text-slate-900">
            Choose where to start selling
          </h3>
          <p className="text-sm text-slate-500">
            Vehicles are grouped by their best option. Select a group, then press Start Selling.
          </p>
        </div>
        <div role="radiogroup" aria-labelledby="groups-heading" className="space-y-3">
          {summary.by_channel.map((g) => (
            <ChannelGroupOption
              key={g.channel}
              group={g}
              vehicles={results.filter((r) => r.recommended === g.channel).map((r) => r.vehicle)}
              selected={g.channel === selected}
              onSelect={() => setSelected(g.channel)}
            />
          ))}
        </div>
      </section>

      <StartSellingBar
        channel={group?.channel ?? null}
        detail={group ? `${group.units} ${group.units === 1 ? "vehicle" : "vehicles"} · ${formatMoney(group.net.p50)}` : undefined}
      />

      <FleetVehicleList results={results} onOpen={setOpenIndex} />
    </div>
  );
}
