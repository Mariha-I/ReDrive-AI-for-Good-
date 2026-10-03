"use client";

import { useState, type FormEvent } from "react";
import { isValid, newDraft, validateDraft, type VehicleDraft } from "@/lib/drafts";
import type { DemoVehicle } from "@/mocks";
import DemoPicker from "./DemoPicker";
import VehicleFields from "./VehicleFields";
import VehicleListItem from "./VehicleListItem";

interface Props {
  vehicles: VehicleDraft[];
  onVehiclesChange: (vehicles: VehicleDraft[]) => void;
  busy: boolean;
  onSubmit: (vehicles: VehicleDraft[]) => void;
}

const MAX_VEHICLES = 25;

export default function IntakeForm({ vehicles, onVehiclesChange, busy, onSubmit }: Props) {
  const [activeId, setActiveId] = useState(vehicles[0]?.id ?? "");
  const [touched, setTouched] = useState(false);

  function update(id: string, patch: Partial<VehicleDraft>) {
    onVehiclesChange(vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }

  function add() {
    // New vehicles usually sit on the same lot, so carry the last ZIP forward.
    const d = newDraft({ zip: vehicles[vehicles.length - 1]?.zip ?? "" });
    onVehiclesChange([...vehicles, d]);
    setActiveId(d.id);
  }

  function remove(id: string) {
    const next = vehicles.filter((v) => v.id !== id);
    onVehiclesChange(next);
    if (activeId === id) setActiveId(next[0]?.id ?? "");
  }

  function submit(e?: FormEvent) {
    e?.preventDefault();
    setTouched(true);
    const firstInvalid = vehicles.find((v) => !isValid(v));
    if (firstInvalid) {
      setActiveId(firstInvalid.id);
      return;
    }
    if (!busy) onSubmit(vehicles);
  }

  function loadDemo(demos: DemoVehicle[]) {
    const drafts = demos.map((d) =>
      newDraft({ vin: d.vin, mileage: d.mileage.toLocaleString("en-US"), zip: d.zip, obdCodes: d.obd_codes }),
    );
    onVehiclesChange(drafts);
    setActiveId(drafts[0].id);
    setTouched(false);
    onSubmit(drafts);
  }

  const count = vehicles.length;

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <DemoPicker onPick={loadDemo} />

      <ul className="space-y-2">
        {vehicles.map((v, i) => (
          <VehicleListItem
            key={v.id}
            index={i}
            draft={v}
            expanded={v.id === activeId}
            invalid={touched && !isValid(v)}
            canRemove={count > 1}
            onExpand={() => setActiveId(v.id === activeId && count > 1 ? "" : v.id)}
            onRemove={() => remove(v.id)}
          >
            <VehicleFields draft={v} errors={touched ? validateDraft(v) : null} onChange={(p) => update(v.id, p)} />
          </VehicleListItem>
        ))}
      </ul>

      {count < MAX_VEHICLES && (
        <button
          type="button"
          onClick={add}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-lane hover:bg-lane-soft hover:text-lane"
        >
          <span aria-hidden="true">+</span> Add another vehicle
        </button>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-lane px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-wait disabled:opacity-60"
      >
        {busy ? "Analyzing…" : count > 1 ? `Analyze ${count} vehicles` : "Find the best option"}
      </button>
    </form>
  );
}
