"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { reconditionVehicle } from "@/lib/api";
import type { Channel, ReconResponse, SellerType } from "@/lib/types";
import { useAppState } from "./AppStateProvider";
import ErrorState from "./ErrorState";
import Header from "./Header";
import LoadingSteps, { type LoadingStep } from "./LoadingSteps";
import ReconResults from "./ReconResults";

interface Props {
  vin: string;
  mileage: number;
  zip: string;
  sellerType: SellerType;
}

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: ReconResponse };

const STEPS: [LoadingStep, LoadingStep, LoadingStep] = [
  { label: "Reading condition report…", detail: "Damage, wear and diagnostic codes" },
  { label: "Pricing repairs…", detail: "Parts and labor near you" },
  { label: "Measuring value added…", detail: "What buyers pay for each fix" },
];

export default function ReconditionView({ vin, mileage, zip, sellerType }: Props) {
  const router = useRouter();
  const { vehicles, resetSellerType } = useAppState();
  const [state, setState] = useState<State>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [selected, setSelected] = useState<Channel | null>(null);

  // Photos and OBD codes only live in memory, so reuse them when the vehicle came from the form.
  const draft = vehicles.find((v) => v.vin === vin);

  useEffect(() => {
    let cancelled = false;
    reconditionVehicle(sellerType, {
      vin,
      mileage,
      zip,
      photos: draft?.photos ?? [],
      obd_codes: draft?.obdCodes ?? [],
    })
      .then((result) => {
        if (cancelled) return;
        setState({ status: "done", result });
        setSelected(result.recommended_channel);
      })
      .catch((err: unknown) => {
        if (!cancelled) setState({ status: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      });
    return () => {
      cancelled = true;
    };
    // draft is read once per load; re-running on every form edit isn't wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vin, mileage, zip, sellerType, attempt]);

  function changeSellerType() {
    resetSellerType();
    router.push("/");
  }

  return (
    <>
      <Header sellerType={sellerType} onChangeSellerType={changeSellerType} />
      <main className="mx-auto w-full max-w-[1200px] flex-1 space-y-5 px-4 py-6 sm:px-6">
        <Link href="/" className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900">
          ← Back to selling options
        </Link>

        {state.status === "loading" && (
          <div className="h-[480px]">
            <LoadingSteps steps={STEPS} />
          </div>
        )}
        {state.status === "error" && (
          <ErrorState
            message={state.message}
            onRetry={() => {
              setState({ status: "loading" });
              setAttempt((a) => a + 1);
            }}
          />
        )}
        {state.status === "done" && (
          <ReconResults result={state.result} selected={selected} onSelect={setSelected} />
        )}
      </main>
    </>
  );
}
