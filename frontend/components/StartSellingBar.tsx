import { CHANNELS } from "@/lib/channels";
import type { Channel } from "@/lib/types";

interface Props {
  channel: Channel | null;
  /** e.g. "$29,200 expected net" or "2 vehicles · $45,700" */
  detail?: string;
}

/** Sticky action bar. "Start Selling" sends the seller to the marketplace for the selected option. */
export default function StartSellingBar({ channel, detail }: Props) {
  const info = channel ? CHANNELS[channel] : null;

  return (
    <div className="sticky bottom-4 z-10">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-brand px-5 py-4 text-white shadow-xl ring-1 ring-black/5">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-white/60">Selected option</p>
          <p className="truncate font-semibold">
            {info ? info.label : "Choose an option above"}
            {info && detail && <span className="font-normal text-white/70"> · {detail}</span>}
          </p>
        </div>
        {info ? (
          <a
            href={info.href}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-emerald-400"
          >
            Start Selling <span aria-hidden="true">→</span>
          </a>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center rounded-xl bg-white/10 px-6 py-3 text-base font-semibold text-white/50">
            Start Selling
          </span>
        )}
      </div>
    </div>
  );
}
