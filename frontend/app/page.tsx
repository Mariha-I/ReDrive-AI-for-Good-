"use client";

import { useRef, useState } from "react";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import FleetResults from "@/components/FleetResults";
import Header from "@/components/Header";
import IntakeForm from "@/components/IntakeForm";
import LoadingSteps from "@/components/LoadingSteps";
import Results from "@/components/Results";
import SellerTypeScreen from "@/components/SellerTypeScreen";
import { routeFleet, routeVehicle } from "@/lib/api";
import { newDraft, toInput, type VehicleDraft } from "@/lib/drafts";
import type { BatchResponse, RouteResponse, SellerType } from "@/lib/types";

type State =
  | { status: "idle" }
  | { status: "loading"; count: number }
  | { status: "error"; message: string }
  | { status: "single"; id: number; result: RouteResponse }
  | { status: "fleet"; id: number; result: BatchResponse };

export default function Home() {
  const [sellerType, setSellerType] = useState<SellerType | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDraft[]>(() => [newDraft()]);
  const [state, setState] = useState<State>({ status: "idle" });
  const lastRequest = useRef<VehicleDraft[] | null>(null);
  const requestId = useRef(0);
  const resultsRef = useRef<HTMLDivElement>(null);

  function changeSellerType() {
    requestId.current += 1; // drop any in-flight result
    setState({ status: "idle" });
    setSellerType(null);
  }

  async function run(drafts: VehicleDraft[]) {
    if (!sellerType) return;
    lastRequest.current = drafts;
    const id = ++requestId.current;
    setState({ status: "loading", count: drafts.length });
    // On narrow screens results sit below the form; bring them into view.
    if (window.innerWidth < 1024) resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    try {
      const inputs = drafts.map(toInput);
      const next: State =
        inputs.length === 1
          ? { status: "single", id, result: await routeVehicle(sellerType, inputs[0]) }
          : { status: "fleet", id, result: await routeFleet(sellerType, inputs) };
      if (id === requestId.current) setState(next);
    } catch (err) {
      if (id === requestId.current) {
        setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      }
    }
  }

  if (!sellerType) {
    return (
      <>
        <Header />
        <SellerTypeScreen onSelect={setSellerType} />
      </>
    );
  }

  return (
    <>
      <Header sellerType={sellerType} onChangeSellerType={changeSellerType} />
      <main className="mx-auto grid w-full max-w-[1440px] flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[400px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">Your vehicles</h1>
            <p className="mb-5 mt-0.5 text-sm text-slate-500">
              Add one car or a whole lot. Photos make the damage read more accurate.
            </p>
            <IntakeForm
              vehicles={vehicles}
              onVehiclesChange={setVehicles}
              busy={state.status === "loading"}
              onSubmit={run}
            />
          </div>
        </aside>

        <div ref={resultsRef} className="min-h-[520px] scroll-mt-4">
          {state.status === "idle" && <EmptyState sellerType={sellerType} />}
          {state.status === "loading" && <LoadingSteps count={state.count} />}
          {state.status === "error" && (
            <ErrorState message={state.message} onRetry={() => lastRequest.current && run(lastRequest.current)} />
          )}
          {state.status === "single" && <Results key={state.id} result={state.result} />}
          {state.status === "fleet" && <FleetResults key={state.id} result={state.result} />}
        </div>
      </main>
    </>
  );
}
