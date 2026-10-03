import { formatMiles } from "@/lib/format";
import type { Vehicle } from "@/lib/types";

export default function VehicleSummary({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
        {vehicle.year} {vehicle.make} {vehicle.model}{" "}
        <span className="font-normal text-slate-500">{vehicle.trim}</span>
      </h2>
      <p className="text-sm text-slate-500">
        <span className="font-mono">{vehicle.vin}</span> · {formatMiles(vehicle.mileage)}
      </p>
    </div>
  );
}
