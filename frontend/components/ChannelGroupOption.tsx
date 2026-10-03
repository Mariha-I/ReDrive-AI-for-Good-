import { CHANNELS } from "@/lib/channels";
import { formatMoney } from "@/lib/format";
import type { ChannelSummary, Vehicle } from "@/lib/types";
import SelectableCard from "./SelectableCard";

interface Props {
  group: ChannelSummary;
  vehicles: Vehicle[];
  selected: boolean;
  onSelect: () => void;
}

/** One marketplace and the vehicles that should go there. */
export default function ChannelGroupOption({ group, vehicles, selected, onSelect }: Props) {
  const info = CHANNELS[group.channel];
  return (
    <SelectableCard name="channel-group" value={group.channel} selected={selected} onSelect={onSelect}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h4 className="font-semibold text-slate-900">{info.label}</h4>
          <p className="text-xs text-slate-500">
            {group.units} {group.units === 1 ? "vehicle" : "vehicles"} · {info.blurb}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold tabular-nums text-slate-900">{formatMoney(group.net.p50)}</p>
          <p className="text-xs tabular-nums text-slate-500">
            {formatMoney(group.net.p10)} – {formatMoney(group.net.p90)}
          </p>
        </div>
      </div>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {vehicles.map((v, i) => (
          <li key={`${v.vin}-${i}`} className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {v.year} {v.make} {v.model}
          </li>
        ))}
      </ul>
    </SelectableCard>
  );
}
