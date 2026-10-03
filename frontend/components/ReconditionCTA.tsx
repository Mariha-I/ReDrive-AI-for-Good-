"use client";

import Link from "next/link";
import type { Vehicle } from "@/lib/types";
import { useAppState } from "./AppStateProvider";

/** The third option: a link out to the reconditioning analysis, styled apart from the selectable sale options. */
export default function ReconditionCTA({ vehicle }: { vehicle: Vehicle }) {
  const { sellerType, vehicles } = useAppState();
  const draft = vehicles.find((v) => v.vin === vehicle.vin);
  const query = new URLSearchParams({
    vin: vehicle.vin,
    mileage: String(vehicle.mileage),
    zip: draft?.zip ?? "",
    seller: sellerType ?? "dealer",
  });

  return (
    <Link
      href={`/recondition?${query}`}
      className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-brand-ink/30 bg-gradient-to-r from-slate-50 to-amber-50/60 p-5 transition hover:border-brand-ink hover:from-white hover:to-amber-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-lane/25"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
        <WrenchIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-slate-900">Analyze Reconditioning Options</span>
        <span className="block text-sm text-slate-600">
          See which repairs or upgrades would raise the sale price by more than they cost.
        </span>
      </span>
      <span className="shrink-0 text-xl text-brand-ink transition group-hover:translate-x-1" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

function WrenchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L4 16.8V20h3.2l5.3-5.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4 2.6-2.6Z" />
    </svg>
  );
}
