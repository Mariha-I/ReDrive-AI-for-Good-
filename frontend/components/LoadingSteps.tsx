"use client";

import { useEffect, useState } from "react";

const STEP_MS = 900;

export interface LoadingStep {
  label: string;
  detail: string;
}

interface Props {
  count?: number;
  /** Overrides the default three steps */
  steps?: [LoadingStep, LoadingStep, LoadingStep];
}

export default function LoadingSteps({ count = 1, steps }: Props) {
  const many = count > 1;
  const STEPS = steps ?? [
    { label: many ? `Decoding ${count} VINs…` : "Decoding VIN…", detail: "Year, make, model and trim" },
    { label: "Reading damage…", detail: "Checking photos panel by panel" },
    { label: "Pricing routes…", detail: many ? "Building your multi-unit projection" : "Comparing your selling options" },
  ];
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timers = [1, 2].map((step) => setTimeout(() => setActive(step), STEP_MS * step));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-8" role="status" aria-live="polite">
      <ol className="w-full max-w-sm space-y-5">
        {STEPS.map((s, i) => {
          const state = i < active ? "done" : i === active ? "active" : "pending";
          return (
            <li key={s.label} className="flex items-start gap-4">
              <StepDot state={state} />
              <div className={state === "pending" ? "opacity-40" : ""}>
                <p className="font-medium text-slate-900">{s.label}</p>
                <p className="text-sm text-slate-500">{s.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StepDot({ state }: { state: "done" | "active" | "pending" }) {
  if (state === "done") {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lane text-sm text-white">✓</span>
    );
  }
  if (state === "active") {
    return (
      <span className="h-7 w-7 shrink-0 animate-spin rounded-full border-[3px] border-emerald-100 border-t-lane" />
    );
  }
  return <span className="h-7 w-7 shrink-0 rounded-full border-2 border-slate-200" />;
}
