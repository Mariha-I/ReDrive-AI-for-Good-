"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, formatMoneyShort } from "@/lib/format";
import Card from "./Card";

export interface RangeRow {
  id: string;
  label: string;
  p10: number;
  p50: number;
  p90: number;
  /** Drawn in the accent color; others are neutral */
  highlight: boolean;
}

interface Props {
  title: string;
  subtitle?: string;
  rows: RangeRow[];
}

interface Row extends RangeRow {
  range: [number, number];
}

const COLOR_BEST = "#047857";
const COLOR_OTHER = "#94a3b8";
const ROW_HEIGHT = 52;

export default function RangeChart({ title, subtitle, rows }: Props) {
  const data: Row[] = rows.map((r) => ({ ...r, range: [r.p10, r.p90] }));
  const labels = new Map(rows.map((r) => [r.id, r.label]));

  const { ref, width } = useWidth<HTMLDivElement>();
  const narrow = width > 0 && width < 520;

  const lo = Math.min(...data.map((d) => d.p10));
  const hi = Math.max(...data.map((d) => d.p90));
  const step = niceStep((hi - Math.max(0, lo)) / (narrow ? 3 : 5));
  const start = Math.max(0, Math.floor(lo / step) * step);
  const end = Math.ceil(hi / step) * step;
  const ticks: number[] = [];
  for (let t = start; t <= end; t += step) ticks.push(t);

  return (
    <Card title={title} subtitle={subtitle}>
      <div ref={ref} style={{ height: data.length * ROW_HEIGHT + 40 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 60, bottom: 4, left: 0 }} barCategoryGap={14}>
            <CartesianGrid horizontal={false} stroke="#e2e8f0" />
            <XAxis
              type="number"
              domain={[start, end]}
              ticks={ticks}
              interval={0}
              tickFormatter={formatMoneyShort}
              tick={{ fill: "#64748b", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="id"
              tickFormatter={(id: string) => labels.get(id) ?? id}
              width={narrow ? 104 : 180}
              tick={{ fill: "#334155", fontSize: narrow ? 11 : 13 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip cursor={{ fill: "#f1f5f9" }} content={<RangeTooltip />} />
            <Bar dataKey="range" shape={<RangeBar />} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

/** Rounds a raw tick interval up to a readable step ($1k, $2k, $2.5k, $5k, ...). */
function niceStep(raw: number): number {
  const mag = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const n = raw / mag;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return Math.max(1000, nice * mag);
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, width };
}

interface ShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: Row;
}

/** Draws the p10–p90 bar, a median dot, and a direct label with the median value. */
function RangeBar({ x = 0, y = 0, width = 0, height = 0, payload }: ShapeProps) {
  if (!payload) return null;
  const color = payload.highlight ? COLOR_BEST : COLOR_OTHER;
  const span = payload.p90 - payload.p10;
  const medianX = span > 0 ? x + ((payload.p50 - payload.p10) / span) * width : x;
  const cy = y + height / 2;
  const barH = Math.min(14, height);

  return (
    <g>
      <rect x={x} y={cy - barH / 2} width={Math.max(width, 2)} height={barH} rx={4} fill={color} opacity={payload.highlight ? 0.9 : 0.55} />
      <circle cx={medianX} cy={cy} r={7} fill="#ffffff" stroke={color} strokeWidth={3} />
      <text
        x={x + width + 10}
        y={cy}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={payload.highlight ? 600 : 500}
        fill={payload.highlight ? "#0f172a" : "#475569"}
      >
        {formatMoneyShort(payload.p50)}
      </text>
    </g>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { payload: Row }[];
}

function RangeTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-slate-900">{row.label}</p>
      <dl className="mt-1 grid grid-cols-[auto_auto] gap-x-4 tabular-nums text-slate-600">
        <dt>Low (p10)</dt>
        <dd className="text-right">{formatMoney(row.p10)}</dd>
        <dt className="font-medium text-slate-900">Median</dt>
        <dd className="text-right font-medium text-slate-900">{formatMoney(row.p50)}</dd>
        <dt>High (p90)</dt>
        <dd className="text-right">{formatMoney(row.p90)}</dd>
      </dl>
    </div>
  );
}
