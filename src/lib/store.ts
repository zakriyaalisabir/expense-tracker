"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Account, Category, Transaction, Goal, Budget, BaseSettings, CurrencyCode } from "./types";
import { differenceInMonths, parseISO } from "date-fns";
import { STORAGE_KEY } from "./constants";

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
  updateAccount: (a: Account) => void;
  deleteAccount: (id: string) => void;
  addCategory: (c: Category) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  addBudget: (b: Budget) => void;
  updateBudget: (b: Budget) => void;
  deleteBudget: (id: string) => void;
  addGoal: (g: Goal) => void;
  updateGoal: (g: Goal) => void;
  setBaseCurrency: (c: CurrencyCode) => void;
  setExchangeRate: (currency: string, rate: number) => void;
  addCustomCurrency: (code: string, rate: number) => void;
};

const initial: State = {
  settings: { baseCurrency: "THB", exchangeRates: { THB: 1, USD: 36, EUR: 39, JPY: 0.25 } },
  accounts: [], categories: [], transactions: [], goals: [], budgets: []
};

function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2,10)}`; }

export { uid };

export const useAppStore = create<State & Actions>()(persist((set, get) => ({
  ...initial,
  seed: () => {
    if (get().accounts.length) return;
    const userId = "demo";
    const accounts: Account[] = [
      { id: "acc_cash", user_id: userId, name: "Cash", type: "cash", currency: "THB", opening_balance: 3000 },
      { id: "acc_kbank", user_id: userId, name: "KBank", type: "bank", currency: "THB", opening_balance: 25000 },
      { id: "acc_visa", user_id: userId, name: "VISA", type: "credit", currency: "THB", opening_balance: -12000 },
      { id: "acc_wise", user_id: userId, name: "Wise USD", type: "bank", currency: "USD", opening_balance: 500 },
      { id: "acc_savings", user_id: userId, name: "Savings Account", type: "savings", currency: "THB", opening_balance: 50000 }
    ];
    const categories: Category[] = [
      { id: "cat_salary", user_id: userId, name: "Salary", type: "income" },
      { id: "cat_bonus", user_id: userId, name: "Bonus", type: "income" },
      { id: "cat_food", user_id: userId, name: "Food", type: "expense" },
      { id: "cat_food_lunch", user_id: userId, name: "Lunch", type: "expense", parent_id: "cat_food" },
      { id: "cat_food_dinner", user_id: userId, name: "Dinner", type: "expense", parent_id: "cat_food" },
      { id: "cat_food_groceries", user_id: userId, name: "Groceries", type: "expense", parent_id: "cat_food" },
      { id: "cat_rent", user_id: userId, name: "Rent", type: "expense" },
      { id: "cat_transport", user_id: userId, name: "Transport", type: "expense" },
      { id: "cat_transport_fuel", user_id: userId, name: "Fuel", type: "expense", parent_id: "cat_transport" },
      { id: "cat_transport_public", user_id: userId, name: "Public Transit", type: "expense", parent_id: "cat_transport" },
      { id: "cat_health", user_id: userId, name: "Health", type: "expense" },
      { id: "cat_shopping", user_id: userId, name: "Shopping", type: "expense" },
      { id: "cat_shopping_clothes", user_id: userId, name: "Clothes", type: "expense", parent_id: "cat_shopping" },
      { id: "cat_shopping_electronics", user_id: userId, name: "Electronics", type: "expense", parent_id: "cat_shopping" },
      { id: "cat_emergency", user_id: userId, name: "Emergency Fund", type: "savings" },
      { id: "cat_investment", user_id: userId, name: "Investment", type: "savings" },
      { id: "cat_retirement", user_id: userId, name: "Retirement", type: "savings" }
    ];
    const transactions: Transaction[] = [
      { id: uid("t"), user_id: userId, date: new Date().toISOString(), type: "income", amount: 60000, currency: "THB",
        account_id: "acc_kbank", category_id: "cat_salary", tags: ["monthly"], description: "Salary",
        fx_rate: 1, base_amount: 60000 },
      { id: uid("t"), user_id: userId, date: new Date().toISOString(), type: "expense", amount: 350, currency: "THB",
        account_id: "acc_cash", category_id: "cat_food", subcategory_id: "cat_food_lunch", tags: ["lunch"], description: "Pad Krapow",
        fx_rate: 1, base_amount: 350 },
      { id: uid("t"), user_id: userId, date: new Date().toISOString(), type: "expense", amount: 15000, currency: "THB",
        account_id: "acc_kbank", category_id: "cat_rent", tags: ["condo"], description: "Monthly rent",
        fx_rate: 1, base_amount: 15000 },
      { id: uid("t"), user_id: userId, date: new Date().toISOString(), type: "expense", amount: 20, currency: "USD",
        account_id: "acc_wise", category_id: "cat_shopping", tags: ["online"], description: "Domain",
        fx_rate: 36, base_amount: 720 },
      { id: uid("t"), user_id: userId, date: new Date().toISOString(), type: "savings", amount: 10000, currency: "THB",
        account_id: "acc_savings", category_id: "cat_emergency", tags: ["monthly"], description: "Emergency fund contribution",
        fx_rate: 1, base_amount: 10000 }
    ];
    const goals: Goal[] = [
      { id: "goal_car", user_id: userId, name: "Buy a Car", target_amount: 500000, target_date: new Date(new Date().getFullYear(), 11, 31).toISOString(),
        monthly_contribution: 10000, source_account_id: "acc_kbank", progress_cached: 60000 }
    ];
    const budgets: Budget[] = [
      { id: "bud_ym", user_id: userId, month: new Date().toISOString().slice(0,7), total: 30000, byCategory: { "cat_food": 5000, "cat_shopping": 8000, "cat_transport": 3000 } }
    ];
    set({ accounts, categories, transactions, goals, budgets });
  },
  addTransaction: (t) => set({ transactions: [...get().transactions, t] }),
  updateTransaction: (t) => set({ transactions: get().transactions.map(x => x.id === t.id ? t : x) }),
  deleteTransaction: (id) => set({ transactions: get().transactions.filter(x => x.id !== id) }),
  addAccount: (a) => set({ accounts: [...get().accounts, a] }),
  updateAccount: (a) => set({ accounts: get().accounts.map(x => x.id === a.id ? a : x) }),
  deleteAccount: (id) => set({ accounts: get().accounts.filter(x => x.id !== id) }),
  addCategory: (c) => set({ categories: [...get().categories, c] }),
  updateCategory: (c) => set({ categories: get().categories.map(x => x.id === c.id ? c : x) }),
  deleteCategory: (id) => set({ categories: get().categories.filter(x => x.id !== id) }),
  addBudget: (b) => set({ budgets: [...get().budgets, b] }),
  updateBudget: (b) => set({ budgets: get().budgets.map(x => x.id === b.id ? b : x) }),
  deleteBudget: (id) => set({ budgets: get().budgets.filter(x => x.id !== id) }),
  addGoal: (g) => set({ goals: [...get().goals, g] }),
  updateGoal: (g) => set({ goals: get().goals.map(x => x.id === g.id ? g : x) }),
  setBaseCurrency: (c) => set({ settings: { ...get().settings, baseCurrency: c } }),
  setExchangeRate: (currency, rate) => set({ settings: { ...get().settings, exchangeRates: { ...get().settings.exchangeRates, [currency]: rate } } }),
  addCustomCurrency: (code, rate) => set({ 
    settings: { 
      ...get().settings, 
      customCurrencies: [...(get().settings.customCurrencies || []), code],
      exchangeRates: { ...get().settings.exchangeRates, [code]: rate }
    } 
  })
}), { name: STORAGE_KEY }));

export function totalsForRange(startISO?: string, endISO?: string) {
  const tx = useAppStore.getState().transactions;
  const startTime = startISO ? new Date(startISO).getTime() : 0;
  const endTime = endISO ? new Date(endISO).getTime() : Infinity;
  
  let income = 0, expense = 0, saved = 0;
  
  for (let i = 0; i < tx.length; i++) {
    const t = tx[i];
    const d = new Date(t.date).getTime();
    if (d < startTime || d > endTime) continue;
    
    if (t.type === "income") income += t.base_amount;
    else if (t.type === "expense") expense += t.base_amount;
    else if (t.type === "savings") saved += t.base_amount;
  }
  
  const netSavings = income - expense - saved;
  return { income, expense, saved, savings: netSavings, savingsPct: income ? ((netSavings)/income)*100 : 0 };
}

export function totalsForRangeByCurrency(startISO?: string, endISO?: string, currency?: CurrencyCode) {
  const tx = useAppStore.getState().transactions;
  const startTime = startISO ? new Date(startISO).getTime() : 0;
  const endTime = endISO ? new Date(endISO).getTime() : Infinity;
  
  if (currency) {
    let income = 0, expense = 0;
    for (let i = 0; i < tx.length; i++) {
      const t = tx[i];
      if (t.currency !== currency) continue;
      const d = new Date(t.date).getTime();
      if (d < startTime || d > endTime) continue;
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expense += t.amount;
    }
    return { income, expense, savings: income - expense, savingsPct: income ? ((income - expense)/income)*100 : 0, currency };
  }
  
  const byCurrency: Record<CurrencyCode, { income: number; expense: number; savings: number; savingsPct: number }> = {} as any;
  
  for (let i = 0; i < tx.length; i++) {
    const t = tx[i];
    const d = new Date(t.date).getTime();
    if (d < startTime || d > endTime) continue;
    
    if (!byCurrency[t.currency]) {
      byCurrency[t.currency] = { income: 0, expense: 0, savings: 0, savingsPct: 0 };
    }
    if (t.type === "income") byCurrency[t.currency].income += t.amount;
    else if (t.type === "expense") byCurrency[t.currency].expense += t.amount;
  }
  
  const currencies = Object.keys(byCurrency);
  for (let i = 0; i < currencies.length; i++) {
    const curr = currencies[i] as CurrencyCode;
    const { income, expense } = byCurrency[curr];
    byCurrency[curr].savings = income - expense;
    byCurrency[curr].savingsPct = income ? ((income - expense)/income)*100 : 0;
  }
  
  return byCurrency;
}

export function goalProgress(g: Goal) {
  const months = Math.max(1, differenceInMonths(parseISO(g.target_date), new Date()));
  const neededMonthly = Math.max(0, (g.target_amount - (g.progress_cached ?? 0)) / months);
  const pct = Math.min(100, ((g.progress_cached ?? 0) / g.target_amount) * 100);
  return { months, neededMonthly, pct };
}
