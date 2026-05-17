import { PRICES } from "./constants";

export const RUB_PER_USDT = Number(process.env.NEXT_PUBLIC_USDT_RUB_RATE || "92") || 92;

export function previewUsdt(rub: number): string {
  const usdt = Math.ceil((rub / RUB_PER_USDT) * 100) / 100;
  return usdt.toFixed(2);
}

export const PLAN_PRICES = [
  { id: "MONTH" as const, rub: PRICES.MONTH, popular: false },
  { id: "YEAR" as const, rub: PRICES.YEAR, popular: true },
  { id: "LIFETIME" as const, rub: PRICES.LIFETIME, popular: false },
];
