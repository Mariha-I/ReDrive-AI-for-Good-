"use client";

import { DEMO_VEHICLES, type DemoVehicle } from "@/mocks";

interface Props {
  onPick: (demos: DemoVehicle[]) => void;
}

const FLEET = "fleet";

export default function DemoPicker({ onPick }: Props) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
        Load demo vehicle
      </span>
      <select
        className="mt-1 w-full rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-lane focus:outline-none focus:ring-2 focus:ring-lane/20"
        value=""
        onChange={(e) => {
          if (e.target.value === FLEET) return onPick(DEMO_VEHICLES);
          const demo = DEMO_VEHICLES.find((d) => d.id === e.target.value);
          if (demo) onPick([demo]);
        }}
      >
        <option value="" disabled>
          Choose a sample vehicle…
        </option>
        {DEMO_VEHICLES.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
        <option value={FLEET}>All three vehicles (multi-unit)</option>
      </select>
    </label>
  );
}
