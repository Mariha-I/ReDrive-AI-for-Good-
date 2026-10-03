import type { Channel, SellerType } from "./types";

export interface ChannelInfo {
  /** Seller-facing name. Never mention the marketplace brand in the UI. */
  label: string;
  blurb: string;
  /** Where "Start Selling" sends the seller */
  href: string;
}

export const CHANNELS: Record<Channel, ChannelInfo> = {
  acv_wholesale: {
    label: "Dealer Wholesale Auction",
    blurb: "Sell to licensed dealers in a fast digital auction.",
    href: "https://www.acvauctions.com/",
  },
  copart_salvage: {
    label: "Salvage Auction",
    blurb: "Sell as-is to rebuilders, dismantlers and exporters, whatever the condition.",
    href: "https://www.copart.com/",
  },
};

export interface SellerTypeInfo {
  label: string;
  description: string;
  /** Display only; the backend enforces eligibility. */
  channels: Channel[];
}

export const SELLER_TYPES: Record<SellerType, SellerTypeInfo> = {
  individual: {
    label: "Individual",
    description: "Selling a car you personally own.",
    channels: ["copart_salvage"],
  },
  business: {
    label: "Business",
    description: "Fleet, rental, leasing, or company-owned vehicles.",
    channels: ["acv_wholesale", "copart_salvage"],
  },
  dealer: {
    label: "Dealer",
    description: "Licensed dealer selling inventory or trade-ins.",
    channels: ["acv_wholesale", "copart_salvage"],
  },
};

export const SELLER_TYPE_ORDER: SellerType[] = ["individual", "business", "dealer"];
