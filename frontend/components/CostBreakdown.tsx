import { formatMoney } from "@/lib/format";
import type { Breakdown } from "@/lib/types";

interface Props {
  breakdown: Breakdown;
  medianNet: number;
}

const COSTS: { key: keyof Omit<Breakdown, "expected_price">; label: string; hint: string }[] = [
  { key: "fees", label: "Selling fees", hint: "Auction, buyer and listing fees" },
  { key: "transport", label: "Transport", hint: "Getting the car to the buyer or yard" },
  { key: "recon", label: "Reconditioning", hint: "Repairs, detailing and inspection" },
  { key: "holding", label: "Holding cost", hint: "Floorplan interest and lot time" },
  { key: "risk", label: "Risk adjustment", hint: "Arbitration, no-sale and price risk" },
];

export default function CostBreakdown({ breakdown, medianNet }: Props) {
  return (
    <table className="w-full text-sm tabular-nums">
      <tbody>
        <tr>
          <td className="py-1.5 text-slate-700">Expected sale price</td>
          <td className="py-1.5 text-right font-medium text-slate-900">{formatMoney(breakdown.expected_price)}</td>
        </tr>
        {COSTS.map((c) => (
          <tr key={c.key} className="border-t border-slate-100">
            <td className="py-1.5 text-slate-600">
              {c.label}
              <span className="ml-2 hidden text-xs text-slate-400 sm:inline">{c.hint}</span>
            </td>
            <td className="py-1.5 text-right text-slate-600">
              {breakdown[c.key] === 0 ? "—" : `−${formatMoney(breakdown[c.key])}`}
            </td>
          </tr>
        ))}
        <tr className="border-t-2 border-slate-200">
          <td className="pt-2 font-semibold text-slate-900">Expected net to you</td>
          <td className="pt-2 text-right font-semibold text-slate-900">{formatMoney(medianNet)}</td>
        </tr>
      </tbody>
    </table>
  );
}
