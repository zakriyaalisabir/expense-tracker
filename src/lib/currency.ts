import { CurrencyCode } from "./types";

export const FX: Record<CurrencyCode, number> = {
  THB: 1,
  USD: 36,
  EUR: 39,
  JPY: 0.25
};

export function toBase(amount: number, currency: CurrencyCode, base: CurrencyCode) {
  const thbVal = amount * FX[currency];
  return base === "THB" ? thbVal : thbVal / FX[base];
}
