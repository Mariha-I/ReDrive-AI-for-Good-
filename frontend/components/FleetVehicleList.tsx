import { CHANNELS } from "@/lib/channels";
import { formatMiles, formatMoney } from "@/lib/format";
import type { RouteResponse } from "@/lib/types";
import Card from "./Card";

interface Props {
  results: RouteResponse[];
  onOpen: (index: number) => void;
}

export default function FleetVehicleList({ results, onOpen }: Props) {
  return (
    <Card title="Vehicles" subtitle="Open a vehicle to compare its options and see the condition report.">
      <ul className="divide-y divide-slate-100">
        {results.map((r, i) => {
          const best = r.routes.find((x) => x.channel === r.recommended) ?? r.routes[0];
          return (
            <li key={`${r.vehicle.vin}-${i}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
              <div className="min-w-0 flex-1 basis-56">
                <p className="font-medium text-slate-900">
                  {r.vehicle.year} {r.vehicle.make} {r.vehicle.model}{" "}
                  <span className="font-normal text-slate-500">{r.vehicle.trim}</span>
                </p>
                <p className="truncate text-xs text-slate-500">
                  <span className="font-mono">{r.vehicle.vin}</span> · {formatMiles(r.vehicle.mileage)}
                </p>
              </div>
              <div className="basis-44 text-sm text-slate-700">
                {CHANNELS[best.channel].label}
                <p className="text-xs text-slate-500">about {best.days_to_sell} days</p>
              </div>
              <div className="basis-28 text-right">
                <p className="font-semibold tabular-nums text-slate-900">{formatMoney(best.net.p50)}</p>
                <p className="text-xs tabular-nums text-slate-500">
                  {formatMoney(best.net.p10)} – {formatMoney(best.net.p90)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onOpen(i)}
                className="ml-auto rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              >
                Details
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
