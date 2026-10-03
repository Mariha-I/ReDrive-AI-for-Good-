"use client";

import { useState } from "react";
import { formatMiles, formatPanel } from "@/lib/format";
import type { Damage, Vehicle } from "@/lib/types";

interface Props {
  vehicle: Vehicle;
  damage: Damage;
}

/** Copies a condition summary the seller can paste into a marketplace listing form. */
export default function CopyDisclosureButton({ vehicle, damage }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const flags = [
      damage.flood_risk && "Flood indicators present",
      damage.airbags_deployed && "Airbags deployed",
      damage.items.some((i) => i.structural) && "Structural damage",
    ].filter(Boolean);
    const lines = [
      `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`,
      `VIN: ${vehicle.vin}`,
      `Mileage: ${formatMiles(vehicle.mileage)}`,
      `Condition: ${damage.summary}`,
      ...damage.items.map((i) => `- ${formatPanel(i.panel)}: severity ${i.severity}/5${i.structural ? " (structural)" : ""}`),
      ...(flags.length ? [`Disclosures: ${flags.join("; ")}`] : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-white/10"
    >
      {copied ? "Copied ✓" : "Copy condition report"}
    </button>
  );
}
