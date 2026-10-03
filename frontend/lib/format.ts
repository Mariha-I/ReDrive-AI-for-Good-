const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const numK = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export function formatMoney(value: number): string {
  return usd.format(value);
}

/** Compact label, e.g. $12k or $11.4k */
export function formatMoneyShort(value: number): string {
  if (Math.abs(value) >= 1000) return `$${numK.format(value / 1000)}k`;
  return usd.format(value);
}

export function formatMiles(value: number): string {
  return `${num.format(value)} mi`;
}

export function formatPanel(panel: string): string {
  return panel
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
