// Mirrors the API contract in /CLAUDE.md. Keep in sync with the FastAPI backend.

export type Channel = "acv_wholesale" | "copart_salvage";

export type SellerType = "individual" | "business" | "dealer";

export interface Vehicle {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  mileage: number;
}

export interface DamageItem {
  panel: string;
  /** 1 (cosmetic) to 5 (severe) */
  severity: number;
  structural: boolean;
}

export interface Damage {
  summary: string;
  items: DamageItem[];
  flood_risk: boolean;
  airbags_deployed: boolean;
  /** 0 to 1 */
  confidence: number;
}

export interface NetRange {
  p10: number;
  p50: number;
  p90: number;
}

export interface Breakdown {
  expected_price: number;
  fees: number;
  transport: number;
  recon: number;
  holding: number;
  risk: number;
}

export interface Route {
  channel: Channel;
  net: NetRange;
  breakdown: Breakdown;
  days_to_sell: number;
  explanation: string;
}

export interface RouteResponse {
  vehicle: Vehicle;
  damage: Damage;
  /** Only channels eligible for the seller type, sorted by net.p50 descending */
  routes: Route[];
  recommended: Channel;
  /** null when only one route is eligible */
  delta_vs_next_best: number | null;
}

export interface ChannelSummary {
  channel: Channel;
  units: number;
  net: NetRange;
}

export interface BatchSummary {
  units: number;
  total_net: NetRange;
  days_to_sell_all: number;
  /** Sorted by net.p50 descending */
  by_channel: ChannelSummary[];
}

export interface BatchResponse {
  /** Same order as the request */
  results: RouteResponse[];
  summary: BatchSummary;
}

export interface VehicleInput {
  vin: string;
  mileage: number;
  zip: string;
  photos: File[];
  obd_codes: string[];
}

export interface ReconItem {
  id: string;
  name: string;
  kind: "repair" | "upgrade";
  description: string;
  cost: number;
  /** Increase in expected sale price from this item alone */
  value_lift: number;
  /** value_lift − cost, computed by the backend */
  net_gain: number;
  days_added: number;
  /** Part of the recommended package */
  recommended: boolean;
  reason: string;
}

export interface ReconScenario {
  channel: Channel;
  as_is: NetRange;
  reconditioned: {
    net: NetRange;
    breakdown: Breakdown;
    days_to_sell: number;
  };
  /** reconditioned.net.p50 − as_is.p50 */
  net_change: number;
  explanation: string;
}

export interface ReconResponse {
  vehicle: Vehicle;
  /** Every candidate repair or upgrade, recommended or not */
  items: ReconItem[];
  /** Eligible channels only, sorted by reconditioned.net.p50 descending */
  scenarios: ReconScenario[];
  recommended_channel: Channel;
  verdict: "recondition" | "sell_as_is";
  /** Total cost of the recommended items */
  package_cost: number;
}
