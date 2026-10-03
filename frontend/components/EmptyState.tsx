import { CHANNELS, SELLER_TYPES } from "@/lib/channels";
import type { SellerType } from "@/lib/types";

export default function EmptyState({ sellerType }: { sellerType: SellerType }) {
  const channels = SELLER_TYPES[sellerType].channels;
  return (
    <div className="flex h-full flex-col justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lane">Step 2 of 2</p>
      <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Add your vehicles and we&apos;ll show what each one will net you.
      </h2>
      <p className="mt-3 max-w-xl text-slate-600">
        We account for fees, transport, reconditioning, time to sell and risk, then explain the result in plain
        English. Selling several cars? Add them all and get one combined projection.
      </p>
      <p className="mt-8 text-xs font-medium uppercase tracking-wide text-slate-500">
        Options for {SELLER_TYPES[sellerType].label.toLowerCase()} sellers
      </p>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {channels.map((c) => (
          <li key={c} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="font-medium text-slate-900">{CHANNELS[c].label}</p>
            <p className="mt-1 text-sm text-slate-600">{CHANNELS[c].blurb}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
