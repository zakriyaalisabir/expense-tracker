import { CurrencyCode, Transaction } from "./types";

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

export function groupByCurrency(transactions: Transaction[]) {
  const groups: Record<CurrencyCode, { income: number; expense: number; savings: number }> = {} as any;
  
  transactions.forEach(t => {
    if (!groups[t.currency]) {
      groups[t.currency] = { income: 0, expense: 0, savings: 0 };
    }
    if (t.type === "income") {
      groups[t.currency].income += t.amount;
    } else {
      groups[t.currency].expense += t.amount;
    }
  });
  
  Object.keys(groups).forEach(currency => {
    const curr = currency as CurrencyCode;
    groups[curr].savings = groups[curr].income - groups[curr].expense;
  });
  
  return groups;
}

export function totalsInCurrency(transactions: Transaction[], currency: CurrencyCode) {
  const filtered = transactions.filter(t => t.currency === currency);
  const income = filtered.filter(t => t.type === "income").reduce((a, b) => a + b.amount, 0);
  const expense = filtered.filter(t => t.type === "expense").reduce((a, b) => a + b.amount, 0);
  const savings = income - expense;
  const savingsPct = income ? ((savings / income) * 100) : 0;
  return { income, expense, savings, savingsPct };
}
