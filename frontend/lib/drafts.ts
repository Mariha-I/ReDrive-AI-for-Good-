import type { VehicleInput } from "./types";

/** Form state for one vehicle before it is validated and sent to the API. */
export interface VehicleDraft {
  id: string;
  vin: string;
  /** Display string with thousands separators */
  mileage: string;
  zip: string;
  photos: File[];
  obdCodes: string[];
}

export interface DraftErrors {
  vin: string | null;
  mileage: string | null;
  zip: string | null;
}

// VINs are 17 characters and never contain I, O or Q.
const VIN_PATTERN = /^[A-HJ-NPR-Z0-9]{17}$/;
const ZIP_PATTERN = /^\d{5}$/;

let counter = 0;

export function newDraft(init: Partial<Omit<VehicleDraft, "id">> = {}): VehicleDraft {
  counter += 1;
  return { id: `v${counter}`, vin: "", mileage: "", zip: "", photos: [], obdCodes: [], ...init };
}

export function parseMiles(mileage: string): number {
  return Number(mileage.replace(/,/g, ""));
}

export function validateDraft(d: VehicleDraft): DraftErrors {
  const miles = parseMiles(d.mileage);
  return {
    vin: VIN_PATTERN.test(d.vin) ? null : "Enter the full 17-character VIN (no I, O or Q).",
    mileage: d.mileage && Number.isFinite(miles) && miles >= 0 ? null : "Enter the odometer reading.",
    zip: ZIP_PATTERN.test(d.zip) ? null : "Enter a 5-digit ZIP code.",
  };
}

export function isValid(d: VehicleDraft): boolean {
  const e = validateDraft(d);
  return !e.vin && !e.mileage && !e.zip;
}

export function toInput(d: VehicleDraft): VehicleInput {
  return { vin: d.vin, mileage: parseMiles(d.mileage), zip: d.zip, photos: d.photos, obd_codes: d.obdCodes };
}
