"use client";

import type { DraftErrors, VehicleDraft } from "@/lib/drafts";
import Field from "./Field";
import ObdInput from "./ObdInput";
import PhotoDropzone from "./PhotoDropzone";

interface Props {
  draft: VehicleDraft;
  errors: DraftErrors | null;
  onChange: (patch: Partial<VehicleDraft>) => void;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lane focus:outline-none focus:ring-2 focus:ring-lane/20";

export default function VehicleFields({ draft, errors, onChange }: Props) {
  const id = draft.id;
  return (
    <div className="space-y-4">
      <Field label="VIN" htmlFor={`${id}-vin`} hint={`${draft.vin.length}/17`} error={errors?.vin}>
        <input
          id={`${id}-vin`}
          value={draft.vin}
          onChange={(e) => onChange({ vin: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17) })}
          placeholder="Driver-side dash or door jamb"
          autoComplete="off"
          spellCheck={false}
          className={`${inputClass} font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal`}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mileage" htmlFor={`${id}-mileage`} error={errors?.mileage}>
          <input
            id={`${id}-mileage`}
            inputMode="numeric"
            value={draft.mileage}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
              onChange({ mileage: digits ? Number(digits).toLocaleString("en-US") : "" });
            }}
            placeholder="e.g. 42,000"
            className={inputClass}
          />
        </Field>
        <Field label="Vehicle ZIP" htmlFor={`${id}-zip`} error={errors?.zip}>
          <input
            id={`${id}-zip`}
            inputMode="numeric"
            value={draft.zip}
            onChange={(e) => onChange({ zip: e.target.value.replace(/\D/g, "").slice(0, 5) })}
            placeholder="Where it's parked"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Photos">
        <PhotoDropzone photos={draft.photos} onChange={(photos) => onChange({ photos })} />
      </Field>
      <Field label="OBD-II codes" optional hint="From a scan tool">
        <ObdInput codes={draft.obdCodes} onChange={(obdCodes) => onChange({ obdCodes })} />
      </Field>
    </div>
  );
}
