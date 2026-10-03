interface Props {
  label: string;
  active: boolean;
}

/** Yes/no condition flag. Uses an icon and text, not color alone. */
export default function FlagBadge({ label, active }: Props) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
        active ? "border-red-200 bg-red-50 text-red-800" : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
          active ? "bg-red-600 text-white" : "bg-slate-100 text-slate-500"
        }`}
      >
        {active ? "!" : "✓"}
      </span>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-xs">{active ? "Detected" : "None found"}</span>
    </div>
  );
}
