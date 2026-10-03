import { SELLER_TYPE_ORDER } from "@/lib/channels";
import type { SellerType } from "@/lib/types";
import SellerTypeCard from "./SellerTypeCard";

interface Props {
  onSelect: (type: SellerType) => void;
}

export default function SellerTypeScreen({ onSelect }: Props) {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-lane">Step 1 of 2</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        What type of seller are you?
      </h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        This decides which auctions you can sell in. You can change it at any time.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {SELLER_TYPE_ORDER.map((t) => (
          <SellerTypeCard key={t} type={t} onSelect={onSelect} />
        ))}
      </div>
    </main>
  );
}
