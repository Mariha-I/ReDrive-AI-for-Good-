import type { Damage } from "@/lib/types";
import Card from "./Card";
import FlagBadge from "./FlagBadge";
import SeverityChip from "./SeverityChip";

export default function DamageCard({ damage }: { damage: Damage }) {
  const structural = damage.items.some((i) => i.structural);
  const confidence = Math.round(damage.confidence * 100);

  return (
    <Card title="Condition">
      <p className="text-sm leading-relaxed text-slate-700">{damage.summary}</p>

      <div className="mt-4 grid gap-2">
        <FlagBadge label="Flood" active={damage.flood_risk} />
        <FlagBadge label="Airbags deployed" active={damage.airbags_deployed} />
        <FlagBadge label="Structural damage" active={structural} />
      </div>

      {damage.items.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Damage by panel</p>
          <div className="flex flex-wrap gap-2">
            {damage.items.map((item) => (
              <SeverityChip key={item.panel} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-500">
          <span>Photo analysis confidence</span>
          <span className="tabular-nums font-medium text-slate-700">{confidence}%</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-ink" style={{ width: `${confidence}%` }} />
        </div>
      </div>
    </Card>
  );
}
