import type { ReconResponse, RouteResponse } from "@/lib/types";
import rav4 from "./rav4.json";
import accord from "./accord.json";
import f150 from "./f150.json";
import rav4Recon from "./recon/rav4.json";
import accordRecon from "./recon/accord.json";
import f150Recon from "./recon/f150.json";

export interface DemoVehicle {
  id: string;
  label: string;
  vin: string;
  mileage: number;
  zip: string;
  obd_codes: string[];
  /** Full response for a seller who can use every channel; the mock API filters by seller type. */
  response: RouteResponse;
  /** Full reconditioning analysis for a seller who can use every channel */
  recon: ReconResponse;
}

export const DEMO_VEHICLES: DemoVehicle[] = [
  {
    id: "rav4",
    label: "2023 Toyota RAV4 · clean · 28k mi",
    vin: rav4.vehicle.vin,
    mileage: rav4.vehicle.mileage,
    zip: "30303",
    obd_codes: [],
    response: rav4 as RouteResponse,
    recon: rav4Recon as ReconResponse,
  },
  {
    id: "accord",
    label: "2020 Honda Accord · hail · 64k mi",
    vin: accord.vehicle.vin,
    mileage: accord.vehicle.mileage,
    zip: "75201",
    obd_codes: [],
    response: accord as RouteResponse,
    recon: accordRecon as ReconResponse,
  },
  {
    id: "f150",
    label: "2022 Ford F-150 · flood · 161k mi",
    vin: f150.vehicle.vin,
    mileage: f150.vehicle.mileage,
    zip: "77002",
    obd_codes: ["P0300", "B1318"],
    response: f150 as RouteResponse,
    recon: f150Recon as ReconResponse,
  },
];
