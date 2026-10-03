import type { ReactNode } from "react";

interface Props {
  title?: string;
  subtitle?: string;
  className?: string;
  children: ReactNode;
}

export default function Card({ title, subtitle, className = "", children }: Props) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {title && (
        <header className="mb-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
