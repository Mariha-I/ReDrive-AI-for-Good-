import { CHANNELS } from "@/lib/channels";
import { formatMoney } from "@/lib/format";
import type { Channel, ReconResponse } from "@/lib/types";
import RangeChart from "./RangeChart";
import ReconHero from "./ReconHero";
import ReconItemCard from "./ReconItemCard";
import ReconScenarioOption from "./ReconScenarioOption";
import StartSellingBar from "./StartSellingBar";
import VehicleSummary from "./VehicleSummary";

interface Props {
  result: ReconResponse;
  selected: Channel | null;
  onSelect: (c: Channel) => void;
}

export default function ReconResults({ result, selected, onSelect }: Props) {
  const items = [...result.items].sort((a, b) => Number(b.recommended) - Number(a.recommended));
  const scenario = result.scenarios.find((s) => s.channel === selected);
  const doRepairs = scenario ? scenario.net_change > 0 : false;

  return (
    <div className="animate-fade-up space-y-6">
      <VehicleSummary vehicle={result.vehicle} />
      <ReconHero result={result} />

      <section className="space-y-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Repairs and upgrades</h3>
          <p className="text-sm text-slate-500">
            What each one costs, how much it adds to the sale price, and what you keep after paying for it.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((i) => (
            <ReconItemCard key={i.id} item={i} />
          ))}
        </div>
      </section>

      <RangeChart
        title="Net proceeds: as-is vs. reconditioned"
        subtitle="Gray: sold as-is. Green: after the recommended repairs. Bar spans the likely range; dot marks the median."
        rows={result.scenarios.flatMap((s) => [
          {
            id: `${s.channel}-asis`,
            label: `${CHANNELS[s.channel].label} (as-is)`,
            p10: s.as_is.p10,
            p50: s.as_is.p50,
            p90: s.as_is.p90,
            highlight: false,
          },
          {
            id: `${s.channel}-recon`,
            label: `${CHANNELS[s.channel].label} (repaired)`,
            p10: s.reconditioned.net.p10,
            p50: s.reconditioned.net.p50,
            p90: s.reconditioned.net.p90,
            highlight: true,
          },
        ])}
      />

      <section className="space-y-3" aria-labelledby="recon-options-heading">
        <div>
          <h3 id="recon-options-heading" className="text-base font-semibold text-slate-900">
            Where to sell after reconditioning
          </h3>
          <p className="text-sm text-slate-500">Select an option, then press Start Selling.</p>
        </div>
        <div role="radiogroup" aria-labelledby="recon-options-heading" className="space-y-3">
          {result.scenarios.map((s) => (
            <ReconScenarioOption
              key={s.channel}
              scenario={s}
              recommended={result.verdict === "recondition" && s.channel === result.recommended_channel}
              selected={s.channel === selected}
              onSelect={() => onSelect(s.channel)}
            />
          ))}
        </div>
      </section>

      <StartSellingBar
        channel={scenario?.channel ?? null}
        detail={
          scenario
            ? doRepairs
              ? `after repairs · ${formatMoney(scenario.reconditioned.net.p50)}`
              : `sell as-is · ${formatMoney(scenario.as_is.p50)}`
            : undefined
        }
      />
    </div>
  );
}
