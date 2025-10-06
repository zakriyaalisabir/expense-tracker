"use client";
import { create } from "zustand";
import { Account, Category, Transaction, Goal, Budget, BaseSettings, CurrencyCode } from "./types";
import { differenceInMonths, parseISO } from "date-fns";
import { createClient } from "./supabase/client";

type State = {
  settings: BaseSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  isLoading: boolean;
  userId: string | null;
  error: string | null;
};

type Actions = {
  setUserId: (id: string | null) => void;
  loadData: () => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id" | "user_id">) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (a: Omit<Account, "id" | "user_id">) => Promise<void>;
  updateAccount: (a: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCategory: (c: Omit<Category, "id" | "user_id">) => Promise<void>;
  updateCategory: (c: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addBudget: (b: Omit<Budget, "id" | "user_id">) => Promise<void>;
  updateBudget: (b: Budget) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  addGoal: (g: Omit<Goal, "id" | "user_id">) => Promise<void>;
  updateGoal: (g: Goal) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  setBaseCurrency: (c: CurrencyCode) => Promise<void>;
  setExchangeRate: (currency: string, rate: number) => Promise<void>;
  addCustomCurrency: (code: string, rate: number) => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
};

const initial: State = {
  settings: { baseCurrency: "THB", exchangeRates: { THB: 1, USD: 36, EUR: 39, JPY: 0.25 } },
  accounts: [], categories: [], transactions: [], goals: [], budgets: [],
  isLoading: false, userId: null, error: null
};

function uid(prefix: string) { return `${prefix}_${Math.random().toString(36).slice(2,10)}`; }

export { uid };

export const useAppStore = create<State & Actions>()((set, get) => ({
  ...initial,
  setUserId: (id) => {
    set({ userId: id });
  },
  clearError: () => set({ error: null }),
  resetStore: () => set(initial),
  loadData: async () => {
    const { userId } = get();
    if (!userId) return;
    set({ isLoading: true });
    const supabase = createClient();
    if (!supabase) {
      set({ isLoading: false });
      return;
    }
    try {
      const [settingsRes, accountsRes, categoriesRes, transactionsRes, goalsRes, budgetsRes] = await Promise.all([
        supabase.from("user_settings").select("*").eq("user_id", userId).single(),
        supabase.from("accounts").select("*").eq("user_id", userId),
        supabase.from("categories").select("*").eq("user_id", userId),
        supabase.from("transactions").select("*").eq("user_id", userId),
        supabase.from("goals").select("*").eq("user_id", userId),
        supabase.from("budgets").select("*").eq("user_id", userId)
      ]);
      set({
        settings: settingsRes.data ? {
          baseCurrency: settingsRes.data.base_currency as CurrencyCode,
          exchangeRates: settingsRes.data.exchange_rates || {},
          customCurrencies: settingsRes.data.custom_currencies || []
        } : initial.settings,
        accounts: accountsRes.data || [],
        categories: categoriesRes.data || [],
        transactions: transactionsRes.data || [],
        goals: goalsRes.data || [],
        budgets: (budgetsRes.data || []).map(b => ({ ...b, byCategory: b.by_category })),
        isLoading: false
      });
    } catch (e) {
      console.error("Load error:", e);
      set({ isLoading: false, error: `Failed to load data: ${e instanceof Error ? e.message : 'Unknown error'}` });
    }
  },
  addTransaction: async (t) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("transactions").insert({ ...t, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add transaction: ${error.message}` });
    else if (data) set({ transactions: [...get().transactions, data] });
  },
  updateTransaction: async (t) => {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").update(t).eq("id", t.id);
    if (error) set({ error: `Failed to update transaction: ${error.message}` });
    else set({ transactions: get().transactions.map(x => x.id === t.id ? t : x) });
  },
  deleteTransaction: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) set({ error: `Failed to delete transaction: ${error.message}` });
    else set({ transactions: get().transactions.filter(x => x.id !== id) });
  },
  addAccount: async (a) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("accounts").insert({ ...a, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add account: ${error.message}` });
    else if (data) set({ accounts: [...get().accounts, data] });
  },
  updateAccount: async (a) => {
    const supabase = createClient();
    const { error } = await supabase.from("accounts").update(a).eq("id", a.id);
    if (error) set({ error: `Failed to update account: ${error.message}` });
    else set({ accounts: get().accounts.map(x => x.id === a.id ? a : x) });
  },
  deleteAccount: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("accounts").delete().eq("id", id);
    if (error) set({ error: `Failed to delete account: ${error.message}` });
    else set({ accounts: get().accounts.filter(x => x.id !== id) });
  },
  addCategory: async (c) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("categories").insert({ ...c, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add category: ${error.message}` });
    else if (data) set({ categories: [...get().categories, data] });
  },
  updateCategory: async (c) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").update(c).eq("id", c.id);
    if (error) set({ error: `Failed to update category: ${error.message}` });
    else set({ categories: get().categories.map(x => x.id === c.id ? c : x) });
  },
  deleteCategory: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) set({ error: `Failed to delete category: ${error.message}` });
    else set({ categories: get().categories.filter(x => x.id !== id) });
  },
  addBudget: async (b) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { byCategory, ...rest } = b;
    const payload = { ...rest, by_category: byCategory, user_id: userId };
    const { data, error } = await supabase.from("budgets").insert(payload).select().single();
    if (error) set({ error: `Failed to add budget: ${error.message}` });
    else if (data) set({ budgets: [...get().budgets, { ...data, byCategory: data.by_category }] });
  },
  updateBudget: async (b) => {
    const supabase = createClient();
    const { byCategory, id, user_id: _userId, ...rest } = b;
    const payload = { ...rest, by_category: byCategory };
    const { error } = await supabase.from("budgets").update(payload).eq("id", id);
    if (error) set({ error: `Failed to update budget: ${error.message}` });
    else set({ budgets: get().budgets.map(x => x.id === b.id ? b : x) });
  },
  deleteBudget: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) set({ error: `Failed to delete budget: ${error.message}` });
    else set({ budgets: get().budgets.filter(x => x.id !== id) });
  },
  addGoal: async (g) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("goals").insert({ ...g, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add goal: ${error.message}` });
    else if (data) set({ goals: [...get().goals, data] });
  },
  updateGoal: async (g) => {
    const supabase = createClient();
    const { error } = await supabase.from("goals").update(g).eq("id", g.id);
    if (error) set({ error: `Failed to update goal: ${error.message}` });
    else set({ goals: get().goals.map(x => x.id === g.id ? g : x) });
  },
  deleteGoal: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) set({ error: `Failed to delete goal: ${error.message}` });
    else set({ goals: get().goals.filter(x => x.id !== id) });
  },
  setBaseCurrency: async (c) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { error } = await supabase.from("user_settings").update({ base_currency: c }).eq("user_id", userId);
    if (error) set({ error: `Failed to update base currency: ${error.message}` });
    else set({ settings: { ...get().settings, baseCurrency: c } });
  },
  setExchangeRate: async (currency, rate) => {
    const { userId, settings } = get();
    if (!userId) return;
    const newRates = { ...settings.exchangeRates, [currency]: rate };
    const supabase = createClient();
    const { error } = await supabase.from("user_settings").update({ exchange_rates: newRates }).eq("user_id", userId);
    if (error) set({ error: `Failed to update exchange rate: ${error.message}` });
    else set({ settings: { ...settings, exchangeRates: newRates } });
  },
  addCustomCurrency: async (code, rate) => {
    const { userId, settings } = get();
    if (!userId) return;
    const newCurrencies = [...(settings.customCurrencies || []), code];
    const newRates = { ...settings.exchangeRates, [code]: rate };
    const supabase = createClient();
    const { error } = await supabase.from("user_settings").update({ custom_currencies: newCurrencies, exchange_rates: newRates }).eq("user_id", userId);
    if (error) set({ error: `Failed to add custom currency: ${error.message}` });
    else set({ settings: { ...settings, customCurrencies: newCurrencies, exchangeRates: newRates } });
  }
}));

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