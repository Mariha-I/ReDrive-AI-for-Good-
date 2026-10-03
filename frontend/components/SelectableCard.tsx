import type { ReactNode } from "react";

interface Props {
  name: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}

/** A radio-button card. The whole card is the click target. */
export default function SelectableCard({ name, value, selected, onSelect, children }: Props) {
  return (
    <label
      className={`relative block cursor-pointer rounded-2xl border bg-white p-5 shadow-sm transition ${
        selected ? "border-lane ring-2 ring-lane/30" : "border-slate-200 hover:border-slate-300"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`absolute left-5 top-5 flex h-5 w-5 items-center justify-center rounded-full border-2 peer-focus-visible:ring-4 peer-focus-visible:ring-lane/25 ${
          selected ? "border-lane" : "border-slate-300"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-lane" />}
      </span>
      <div className="pl-8">{children}</div>
    </label>
  );
}
