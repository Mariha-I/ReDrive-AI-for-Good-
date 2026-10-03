import Link from "next/link";
import ReconditionView from "@/components/ReconditionView";
import { SELLER_TYPE_ORDER } from "@/lib/channels";
import type { SellerType } from "@/lib/types";

export const metadata = { title: "Reconditioning options · ReDrive" };

function one(v: string | string[] | undefined): string {
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export default async function ReconditionPage({ searchParams }: PageProps<"/recondition">) {
  const sp = await searchParams;
  const vin = one(sp.vin).toUpperCase();
  const mileage = Number(one(sp.mileage));
  const zip = one(sp.zip);
  const seller = one(sp.seller) as SellerType;

  if (!vin || !Number.isFinite(mileage) || !SELLER_TYPE_ORDER.includes(seller)) {
    return (
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-semibold text-slate-900">Pick a vehicle first</h1>
        <p className="mt-2 text-slate-600">Analyze a vehicle, then open its reconditioning options from the results.</p>
        <Link href="/" className="mt-4 rounded-lg bg-lane px-4 py-2 text-sm font-semibold text-white">
          Go to ReDrive
        </Link>
      </main>
    );
  }

  return <ReconditionView vin={vin} mileage={mileage} zip={zip} sellerType={seller} />;
}
