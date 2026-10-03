"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import { routeFleet, routeVehicle } from "@/lib/api";
import { newDraft, toInput, type VehicleDraft } from "@/lib/drafts";
import type { BatchResponse, RouteResponse, SellerType } from "@/lib/types";

export type AnalysisState =
  | { status: "idle" }
  | { status: "loading"; count: number }
  | { status: "error"; message: string }
  | { status: "single"; id: number; result: RouteResponse }
  | { status: "fleet"; id: number; result: BatchResponse };

interface AppState {
  sellerType: SellerType | null;
  setSellerType: (t: SellerType) => void;
  /** Clears the seller type and any results, returning to the seller picker */
  resetSellerType: () => void;
  vehicles: VehicleDraft[];
  setVehicles: (v: VehicleDraft[]) => void;
  analysis: AnalysisState;
  analyze: (drafts: VehicleDraft[]) => Promise<void>;
  retry: () => void;
}

const AppStateContext = createContext<AppState | null>(null);

/**
 * Lives in the root layout so seller type, vehicles (including photo Files) and results
 * survive client-side navigation, e.g. to the reconditioning page and back.
 */
export default function AppStateProvider({ children }: { children: ReactNode }) {
  const [sellerType, setSellerType] = useState<SellerType | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDraft[]>(() => [newDraft()]);
  const [analysis, setAnalysis] = useState<AnalysisState>({ status: "idle" });
  const lastRequest = useRef<VehicleDraft[] | null>(null);
  const requestId = useRef(0);

  function resetSellerType() {
    requestId.current += 1; // drop any in-flight result
    setAnalysis({ status: "idle" });
    setSellerType(null);
  }

  async function analyze(drafts: VehicleDraft[]) {
    if (!sellerType) return;
    lastRequest.current = drafts;
    const id = ++requestId.current;
    setAnalysis({ status: "loading", count: drafts.length });
    try {
      const inputs = drafts.map(toInput);
      const next: AnalysisState =
        inputs.length === 1
          ? { status: "single", id, result: await routeVehicle(sellerType, inputs[0]) }
          : { status: "fleet", id, result: await routeFleet(sellerType, inputs) };
      if (id === requestId.current) setAnalysis(next);
    } catch (err) {
      if (id === requestId.current) {
        setAnalysis({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      }
    }
  }

  function retry() {
    if (lastRequest.current) void analyze(lastRequest.current);
  }

  return (
    <AppStateContext.Provider
      value={{ sellerType, setSellerType, resetSellerType, vehicles, setVehicles, analysis, analyze, retry }}
    >
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}
