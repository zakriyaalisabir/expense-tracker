"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Account, Category, Transaction, Goal, Budget, BaseSettings, CurrencyCode } from "./types";
import { differenceInMonths, parseISO } from "date-fns";

type State = {
  settings: BaseSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
};

type Actions = {
  seed: () => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (a: Account) => void;
  addBudget: (b: Budget) => void;
  addGoal: (g: Goal) => void;
  setBaseCurrency: (c: CurrencyCode) => void;
};

const initial: State = {
  settings: { baseCurrency: "THB" },
  accounts: [], categories: [], transactions: [], goals: [], budgets: []
};

function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2,10)}`; }

export const useAppStore = create<State & Actions>()(persist((set, get) => ({
  ...initial,
  seed: () => {
    if (get().accounts.length) return;
    const accounts: Account[] = [
      { id: "acc_cash", name: "Cash", type: "cash", currency: "THB", opening_balance: 3000 },
      { id: "acc_kbank", name: "KBank", type: "bank", currency: "THB", opening_balance: 25000 },
      { id: "acc_visa", name: "VISA", type: "credit", currency: "THB", opening_balance: -12000 },
      { id: "acc_wise", name: "Wise USD", type: "bank", currency: "USD", opening_balance: 500 },
      { id: "acc_savings", name: "Savings Account", type: "savings", currency: "THB", opening_balance: 50000 }
    ];
    const categories: Category[] = [
      { id: "cat_salary", name: "Salary", type: "income" },
      { id: "cat_bonus", name: "Bonus", type: "income" },
      { id: "cat_food", name: "Food", type: "expense" },
      { id: "cat_food_lunch", name: "Lunch", type: "expense", parent_id: "cat_food" },
      { id: "cat_food_dinner", name: "Dinner", type: "expense", parent_id: "cat_food" },
      { id: "cat_food_groceries", name: "Groceries", type: "expense", parent_id: "cat_food" },
      { id: "cat_rent", name: "Rent", type: "expense" },
      { id: "cat_transport", name: "Transport", type: "expense" },
      { id: "cat_transport_fuel", name: "Fuel", type: "expense", parent_id: "cat_transport" },
      { id: "cat_transport_public", name: "Public Transit", type: "expense", parent_id: "cat_transport" },
      { id: "cat_health", name: "Health", type: "expense" },
      { id: "cat_shopping", name: "Shopping", type: "expense" },
      { id: "cat_shopping_clothes", name: "Clothes", type: "expense", parent_id: "cat_shopping" },
      { id: "cat_shopping_electronics", name: "Electronics", type: "expense", parent_id: "cat_shopping" },
      { id: "cat_emergency", name: "Emergency Fund", type: "savings" },
      { id: "cat_investment", name: "Investment", type: "savings" },
      { id: "cat_retirement", name: "Retirement", type: "savings" }
    ];
    const transactions: Transaction[] = [
      { id: uid("t"), date: new Date().toISOString(), type: "income", amount: 60000, currency: "THB",
        account_id: "acc_kbank", category_id: "cat_salary", tags: ["monthly"], description: "Salary",
        fx_rate: 1, base_amount: 60000 },
      { id: uid("t"), date: new Date().toISOString(), type: "expense", amount: 350, currency: "THB",
        account_id: "acc_cash", category_id: "cat_food", subcategory_id: "cat_food_lunch", tags: ["lunch"], description: "Pad Krapow",
        fx_rate: 1, base_amount: 350 },
      { id: uid("t"), date: new Date().toISOString(), type: "expense", amount: 15000, currency: "THB",
        account_id: "acc_kbank", category_id: "cat_rent", tags: ["condo"], description: "Monthly rent",
        fx_rate: 1, base_amount: 15000 },
      { id: uid("t"), date: new Date().toISOString(), type: "expense", amount: 20, currency: "USD",
        account_id: "acc_wise", category_id: "cat_shopping", tags: ["online"], description: "Domain",
        fx_rate: 36, base_amount: 720 },
      { id: uid("t"), date: new Date().toISOString(), type: "savings", amount: 10000, currency: "THB",
        account_id: "acc_savings", category_id: "cat_emergency", tags: ["monthly"], description: "Emergency fund contribution",
        fx_rate: 1, base_amount: 10000 }
    ];
    const goals: Goal[] = [
      { id: "goal_car", name: "Buy a Car", target_amount: 500000, target_date: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        monthly_contribution: 10000, source_account_id: "acc_kbank", progress_cached: 60000 }
    ];
    const budgets: Budget[] = [
      { id: "bud_ym", month: new Date().toISOString().slice(0,7), total: 30000, byCategory: { "cat_food": 5000, "cat_shopping": 8000, "cat_transport": 3000 } }
    ];
    set({ accounts, categories, transactions, goals, budgets });
  },
  addTransaction: (t) => set({ transactions: [...get().transactions, t] }),
  updateTransaction: (t) => set({ transactions: get().transactions.map(x => x.id === t.id ? t : x) }),
  deleteTransaction: (id) => set({ transactions: get().transactions.filter(x => x.id !== id) }),
  addAccount: (a) => set({ accounts: [...get().accounts, a] }),
  addBudget: (b) => set({ budgets: [...get().budgets, b] }),
  addGoal: (g) => set({ goals: [...get().goals, g] }),
  setBaseCurrency: (c) => set({ settings: { ...get().settings, baseCurrency: c } })
}), { name: "expense-tracker-v1" }));

export function totalsForRange(startISO?: string, endISO?: string) {
  const tx = useAppStore.getState().transactions;
  const inRange = tx.filter(t => {
    const d = new Date(t.date).getTime();
    const okStart = startISO ? d >= new Date(startISO).getTime() : true;
    const okEnd = endISO ? d <= new Date(endISO).getTime() : true;
    return okStart && okEnd;
  });
  const income = inRange.filter(t => t.type === "income").reduce((a,b)=>a+b.base_amount,0);
  const expense = inRange.filter(t => t.type === "expense").reduce((a,b)=>a+b.base_amount,0);
  const saved = inRange.filter(t => t.type === "savings").reduce((a,b)=>a+b.base_amount,0);
  const netSavings = income - expense - saved;
  return { income, expense, saved, savings: netSavings, savingsPct: income ? ((netSavings)/income)*100 : 0 };
}

export function totalsForRangeByCurrency(startISO?: string, endISO?: string, currency?: CurrencyCode) {
  const tx = useAppStore.getState().transactions;
  const inRange = tx.filter(t => {
    const d = new Date(t.date).getTime();
    const okStart = startISO ? d >= new Date(startISO).getTime() : true;
    const okEnd = endISO ? d <= new Date(endISO).getTime() : true;
    const okCurrency = currency ? t.currency === currency : true;
    return okStart && okEnd && okCurrency;
  });
  
  if (currency) {
    const income = inRange.filter(t => t.type === "income").reduce((a,b)=>a+b.amount,0);
    const expense = inRange.filter(t => t.type === "expense").reduce((a,b)=>a+b.amount,0);
    return { income, expense, savings: income - expense, savingsPct: income ? ((income - expense)/income)*100 : 0, currency };
  }
  
  const byCurrency: Record<CurrencyCode, { income: number; expense: number; savings: number; savingsPct: number }> = {} as any;
  inRange.forEach(t => {
    if (!byCurrency[t.currency]) {
      byCurrency[t.currency] = { income: 0, expense: 0, savings: 0, savingsPct: 0 };
    }
    if (t.type === "income") {
      byCurrency[t.currency].income += t.amount;
    } else {
      byCurrency[t.currency].expense += t.amount;
    }
  });
  
  Object.keys(byCurrency).forEach(curr => {
    const currency = curr as CurrencyCode;
    const { income, expense } = byCurrency[currency];
    byCurrency[currency].savings = income - expense;
    byCurrency[currency].savingsPct = income ? ((income - expense)/income)*100 : 0;
  });
  
  return byCurrency;
}

export function goalProgress(g: Goal) {
  const months = Math.max(1, differenceInMonths(parseISO(g.target_date), new Date()));
  const neededMonthly = Math.max(0, (g.target_amount - (g.progress_cached ?? 0)) / months);
  const pct = Math.min(100, ((g.progress_cached ?? 0) / g.target_amount) * 100);
  return { months, neededMonthly, pct };
}
