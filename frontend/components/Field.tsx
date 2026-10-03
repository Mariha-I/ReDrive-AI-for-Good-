import type { ReactNode } from "react";

interface Props {
  label: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  optional?: boolean;
  children: ReactNode;
}

export default function Field({ label, htmlFor, hint, error, optional, children }: Props) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 flex items-baseline justify-between text-sm font-medium text-slate-800">
        <span>
          {label}
          {optional && <span className="ml-1 font-normal text-slate-400">(optional)</span>}
        </span>
        {hint && !error && <span className="text-xs font-normal text-slate-500">{hint}</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
