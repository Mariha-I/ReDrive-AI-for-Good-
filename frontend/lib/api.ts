import type {
  BatchResponse,
  ChannelSummary,
  NetRange,
  RouteResponse,
  SellerType,
  VehicleInput,
} from "./types";
import { SELLER_TYPES } from "./channels";
import { DEMO_VEHICLES } from "@/mocks";

/**
 * Single entry point to the backend. Components never call fetch directly.
 * Flip USE_MOCKS off (or set NEXT_PUBLIC_USE_MOCKS=false) once FastAPI is running.
 */
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

/** Simulated latency so the stepwise loading state is visible during demos. */
const MOCK_DELAY_MS = 2700;

export async function routeVehicle(sellerType: SellerType, v: VehicleInput): Promise<RouteResponse> {
  if (USE_MOCKS) {
    await delay();
    return mockRoute(sellerType, v);
  }

  const body = new FormData();
  body.append("seller_type", sellerType);
  body.append("vin", v.vin);
  body.append("mileage", String(v.mileage));
  body.append("zip", v.zip);
  v.photos.forEach((p) => body.append("photos", p));
  v.obd_codes.forEach((c) => body.append("obd_codes", c));
  return post<RouteResponse>("/route", body);
}

export async function routeFleet(sellerType: SellerType, vehicles: VehicleInput[]): Promise<BatchResponse> {
  if (USE_MOCKS) {
    await delay();
    return mockBatch(sellerType, vehicles);
  }

  const body = new FormData();
  body.append("seller_type", sellerType);
  body.append(
    "vehicles",
    JSON.stringify(vehicles.map(({ vin, mileage, zip, obd_codes }) => ({ vin, mileage, zip, obd_codes }))),
  );
  vehicles.forEach((v, i) => v.photos.forEach((p) => body.append(`photos_${i}`, p)));
  return post<BatchResponse>("/route/batch", body);
}

async function post<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(detail || `Routing service returned ${res.status}`);
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Mock backend. Everything below stands in for server logic and goes away
// when the real API is live; it is not used by any component directly.
// ---------------------------------------------------------------------------

function delay() {
  return new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
}

function mockRoute(sellerType: SellerType, v: VehicleInput): RouteResponse {
  const vin = v.vin.trim().toUpperCase();
  // Demo VINs return their own scenario; any other VIN falls back to the first demo.
  const base = (DEMO_VEHICLES.find((d) => d.vin === vin) ?? DEMO_VEHICLES[0]).response;
  const allowed = SELLER_TYPES[sellerType].channels;
  const routes = base.routes.filter((r) => allowed.includes(r.channel));
  return {
    ...base,
    routes,
    recommended: routes[0].channel,
    delta_vs_next_best: routes.length > 1 ? routes[0].net.p50 - routes[1].net.p50 : null,
  };
}

function mockBatch(sellerType: SellerType, vehicles: VehicleInput[]): BatchResponse {
  const results = vehicles.map((v) => mockRoute(sellerType, v));
  const best = results.map((r) => r.routes[0]);
  const sum = (items: NetRange[]): NetRange => ({
    p10: items.reduce((s, n) => s + n.p10, 0),
    p50: items.reduce((s, n) => s + n.p50, 0),
    p90: items.reduce((s, n) => s + n.p90, 0),
  });

  const channels = Array.from(new Set(best.map((r) => r.channel)));
  const by_channel: ChannelSummary[] = channels
    .map((channel) => {
      const group = best.filter((r) => r.channel === channel);
      return { channel, units: group.length, net: sum(group.map((r) => r.net)) };
    })
    .sort((a, b) => b.net.p50 - a.net.p50);

  return {
    results,
    summary: {
      units: results.length,
      total_net: sum(best.map((r) => r.net)),
      days_to_sell_all: Math.max(...best.map((r) => r.days_to_sell)),
      by_channel,
    },
  };
}
