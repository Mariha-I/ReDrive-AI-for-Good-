import { CHANNELS } from "@/lib/channels";
import { formatMoney } from "@/lib/format";
import type { RouteResponse } from "@/lib/types";
import CopyDisclosureButton from "./CopyDisclosureButton";

export default function HeroCard({ result }: { result: RouteResponse }) {
  const route = result.routes.find((r) => r.channel === result.recommended) ?? result.routes[0];
  const info = CHANNELS[route.channel];

  return (
    <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white shadow-lg sm:p-7">
      <LaneStripes />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">Best option</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{info.label}</h2>
            <p className="text-sm text-white/60">{info.blurb}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-white/60">Expected net to you</p>
            <p className="text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
              {formatMoney(route.net.p50)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          {result.delta_vs_next_best !== null && (
            <span className="rounded-full bg-emerald-400/15 px-3 py-1 font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              +{formatMoney(result.delta_vs_next_best)} vs next best
            </span>
          )}
          <span className="text-white/75">
            Likely range{" "}
            <span className="tabular-nums text-white">
              {formatMoney(route.net.p10)} – {formatMoney(route.net.p90)}
            </span>
          </span>
          <span className="text-white/75">
            Sells in about <span className="text-white">{route.days_to_sell} days</span>
          </span>
        </div>

        <p className="mt-4 max-w-3xl text-[15px] leading-relaxed text-white/85">{route.explanation}</p>

        <div className="mt-5">
          <CopyDisclosureButton vehicle={result.vehicle} damage={result.damage} />
        </div>
      </div>
    </section>
  );
}

function LaneStripes() {
  return (
    <svg className="pointer-events-none absolute -right-10 top-0 h-full w-64 opacity-[0.08]" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true">
      <path d="M60 200 L110 0" stroke="white" strokeWidth="6" />
      <path d="M120 200 L170 0" stroke="white" strokeWidth="6" strokeDasharray="18 14" />
    </svg>
  );
}
