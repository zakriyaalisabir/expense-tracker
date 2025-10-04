import { CurrencyCode, Transaction } from "./types";
import { useAppStore } from "./store";

export const FX: Record<CurrencyCode, number> = {
  THB: 1,
  USD: 36,
  EUR: 39,
  JPY: 0.25
};

export function toBase(amount: number, currency: CurrencyCode, base: CurrencyCode) {
  const rates = useAppStore.getState().settings.exchangeRates || FX;
  const thbVal = amount * (rates[currency] || FX[currency]);
  return base === "THB" ? thbVal : thbVal / (rates[base] || FX[base]);
}

let cachedGroups: { data: any; txLength: number; txHash: string } | null = null;

export function groupByCurrency(transactions: Transaction[]) {
  const txHash = transactions.map(t => t.id).join(',');
  if (cachedGroups && cachedGroups.txHash === txHash) {
    return cachedGroups.data;
  }
  
  const groups: Record<CurrencyCode, { income: number; expense: number; saved: number; savings: number }> = {} as any;
  
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (!groups[t.currency]) {
      groups[t.currency] = { income: 0, expense: 0, saved: 0, savings: 0 };
    }
    if (t.type === "income") {
      groups[t.currency].income += t.amount;
    } else if (t.type === "expense") {
      groups[t.currency].expense += t.amount;
    } else if (t.type === "savings") {
      groups[t.currency].saved += t.amount;
    }
  }
  
  const currencies = Object.keys(groups);
  for (let i = 0; i < currencies.length; i++) {
    const curr = currencies[i] as CurrencyCode;
    groups[curr].savings = groups[curr].income - groups[curr].expense - groups[curr].saved;
  }
  
  cachedGroups = { data: groups, txLength: transactions.length, txHash };
  return groups;
}

export function totalsInCurrency(transactions: Transaction[], currency: CurrencyCode) {
  let income = 0, expense = 0, saved = 0;
  
  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (t.currency !== currency) continue;
    if (t.type === "income") income += t.amount;
    else if (t.type === "expense") expense += t.amount;
    else if (t.type === "savings") saved += t.amount;
  }
  
  const savings = income - expense - saved;
  const savingsPct = income ? ((savings / income) * 100) : 0;
  return { income, expense, saved, savings, savingsPct };
}
