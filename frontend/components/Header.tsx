import { USE_MOCKS } from "@/lib/api";
import { SELLER_TYPES } from "@/lib/channels";
import type { SellerType } from "@/lib/types";

interface Props {
  sellerType?: SellerType | null;
  onChangeSellerType?: () => void;
}

export default function Header({ sellerType, onChangeSellerType }: Props) {
  return (
    <header className="bg-brand text-white">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <LaneMark />
          <div>
            <p className="text-lg font-semibold tracking-tight">ReDrive</p>
            <p className="hidden text-xs text-white/60 sm:block">Find the best way to sell every vehicle</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {sellerType && (
            <button
              type="button"
              onClick={onChangeSellerType}
              className="rounded-full border border-white/25 px-3 py-1 text-xs text-white/85 transition hover:bg-white/10"
            >
              Selling as <span className="font-semibold text-white">{SELLER_TYPES[sellerType].label}</span>
              <span className="ml-1.5 text-emerald-300">Change</span>
            </button>
          )}
          {USE_MOCKS && (
            <span className="hidden rounded-full border border-white/20 px-2.5 py-1 text-xs text-white/70 sm:inline">
              Demo data
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

function LaneMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <rect width="34" height="34" rx="8" fill="#13315c" />
      <path d="M11 28 L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M19 6 L23 28" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 3.5" />
    </svg>
  );
}
