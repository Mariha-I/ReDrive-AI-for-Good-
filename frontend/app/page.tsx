"use client";

import { useRef } from "react";
import { useAppState } from "@/components/AppStateProvider";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import FleetResults from "@/components/FleetResults";
import Header from "@/components/Header";
import IntakeForm from "@/components/IntakeForm";
import LoadingSteps from "@/components/LoadingSteps";
import Results from "@/components/Results";
import SellerTypeScreen from "@/components/SellerTypeScreen";
import type { VehicleDraft } from "@/lib/drafts";

export default function Home() {
  const { sellerType, setSellerType, resetSellerType, vehicles, setVehicles, analysis, analyze, retry } =
    useAppState();
  const resultsRef = useRef<HTMLDivElement>(null);

  function run(drafts: VehicleDraft[]) {
    // On narrow screens results sit below the form; bring them into view.
    if (window.innerWidth < 1024) resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    void analyze(drafts);
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
      <Header sellerType={sellerType} onChangeSellerType={resetSellerType} />
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
              busy={analysis.status === "loading"}
              onSubmit={run}
            />
          </div>
        </aside>

        <div ref={resultsRef} className="min-h-[520px] scroll-mt-4">
          {analysis.status === "idle" && <EmptyState sellerType={sellerType} />}
          {analysis.status === "loading" && <LoadingSteps count={analysis.count} />}
          {analysis.status === "error" && <ErrorState message={analysis.message} onRetry={retry} />}
          {analysis.status === "single" && <Results key={analysis.id} result={analysis.result} />}
          {analysis.status === "fleet" && <FleetResults key={analysis.id} result={analysis.result} />}
        </div>
      </main>
    </>
  );
}
