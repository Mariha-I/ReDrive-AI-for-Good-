import type { SellerType } from "@/lib/types";

export default function SellerTypeIcon({ type }: { type: SellerType }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "individual") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
      </svg>
    );
  }
  if (type === "business") {
    return (
      <svg {...common}>
        <rect x="4" y="7" width="16" height="13" rx="1.5" />
        <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 12h16" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M3 10 12 4l9 6" />
      <path d="M5 9v11h14V9" />
      <path d="M8 20v-5h8v5" />
    </svg>
  );
}
