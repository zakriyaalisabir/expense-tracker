"use client";
import { create } from "zustand";
import { Account, Category, Transaction, Goal, Budget, BaseSettings, CurrencyCode, Achievement, Challenge, HealthScore, Streak, Debt, Investment, Asset, DashboardWidget, SyncQueueItem } from "./types";
import { differenceInMonths, parseISO } from "date-fns";
import { createClient } from "./supabase/client";

type State = {
  settings: BaseSettings;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  achievements: Achievement[];
  challenges: Challenge[];
  healthScores: HealthScore[];
  streaks: Streak[];
  debts: Debt[];
  investments: Investment[];
  assets: Asset[];
  dashboardWidgets: DashboardWidget[];
  syncQueue: SyncQueueItem[];
  isLoading: boolean;
  isOffline: boolean;
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
  toggleGoal: (id: string) => Promise<void>;
  setBaseCurrency: (c: CurrencyCode) => Promise<void>;
  setExchangeRate: (currency: string, rate: number) => Promise<void>;
  addCustomCurrency: (code: string, rate: number) => Promise<void>;
  // Gamification
  addAchievement: (a: Omit<Achievement, "id" | "user_id">) => Promise<void>;
  addChallenge: (c: Omit<Challenge, "id" | "user_id">) => Promise<void>;
  updateChallenge: (c: Challenge) => Promise<void>;
  completeChallenge: (id: string) => Promise<void>;
  updateStreak: (type: string, increment: boolean) => Promise<void>;
  calculateHealthScore: (month: string) => Promise<void>;
  // Financial Tracking
  addDebt: (d: Omit<Debt, "id" | "user_id">) => Promise<void>;
  updateDebt: (d: Debt) => Promise<void>;
  deleteDebt: (id: string) => Promise<void>;
  addInvestment: (i: Omit<Investment, "id" | "user_id">) => Promise<void>;
  updateInvestment: (i: Investment) => Promise<void>;
  deleteInvestment: (id: string) => Promise<void>;
  addAsset: (a: Omit<Asset, "id" | "user_id">) => Promise<void>;
  updateAsset: (a: Asset) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
  // Dashboard
  updateDashboardWidget: (w: DashboardWidget) => Promise<void>;
  toggleWidgetVisibility: (id: string) => Promise<void>;
  // Offline
  setOfflineMode: (offline: boolean) => void;
  syncOfflineData: () => Promise<void>;
  clearError: () => void;
  resetStore: () => void;
};

const initial: State = {
  settings: { baseCurrency: "THB", exchangeRates: { THB: 1, USD: 36, EUR: 39, JPY: 0.25 } },
  accounts: [], categories: [], transactions: [], goals: [], budgets: [],
  achievements: [], challenges: [], healthScores: [], streaks: [],
  debts: [], investments: [], assets: [], dashboardWidgets: [], syncQueue: [],
  isLoading: false, isOffline: false, userId: null, error: null
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
      const [settingsRes, accountsRes, categoriesRes, transactionsRes, goalsRes, budgetsRes, achievementsRes, challengesRes, healthScoresRes, streaksRes, debtsRes, investmentsRes, assetsRes, widgetsRes] = await Promise.all([
        supabase.from("user_settings").select("*").eq("user_id", userId).single(),
        supabase.from("accounts").select("*").eq("user_id", userId),
        supabase.from("categories").select("*").eq("user_id", userId),
        supabase.from("transactions").select("*").eq("user_id", userId),
        supabase.from("goals").select("*").eq("user_id", userId),
        supabase.from("budgets").select("*").eq("user_id", userId),
        supabase.from("achievements").select("*").eq("user_id", userId),
        supabase.from("challenges").select("*").eq("user_id", userId),
        supabase.from("health_scores").select("*").eq("user_id", userId),
        supabase.from("streaks").select("*").eq("user_id", userId),
        supabase.from("debts").select("*").eq("user_id", userId),
        supabase.from("investments").select("*").eq("user_id", userId),
        supabase.from("assets").select("*").eq("user_id", userId),
        supabase.from("dashboard_widgets").select("*").eq("user_id", userId)
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
        budgets: (budgetsRes.data || []).map((b: any) => ({ ...b, byCategory: b.by_category })),
        achievements: achievementsRes.data || [],
        challenges: challengesRes.data || [],
        healthScores: healthScoresRes.data || [],
        streaks: streaksRes.data || [],
        debts: debtsRes.data || [],
        investments: investmentsRes.data || [],
        assets: assetsRes.data || [],
        dashboardWidgets: widgetsRes.data || [],
        isLoading: false
      });
    } catch (e) {
      console.error("Load error:", e);
      set({ isLoading: false, error: `Failed to load data: ${e instanceof Error ? e.message : 'Unknown error'}` });
    }
  },
  addTransaction: async (t) => {
    const { userId, settings, transactions, achievements } = get();
    if (!userId) return;
    
    // Calculate fx_rate and base_amount if not provided
    const fx_rate = t.fx_rate || (settings.exchangeRates?.[t.currency] || 1);
    const base_amount = t.base_amount || (t.amount * fx_rate);
    
    const supabase = createClient();
    const transactionData = { ...t, fx_rate, base_amount, user_id: userId };
    const { data, error } = await supabase.from("transactions").insert(transactionData).select().single();
    if (error) set({ error: `Failed to add transaction: ${error.message}` });
    else if (data) {
      set({ transactions: [...transactions, data] });
      
      // Auto-earn achievements
      const newTransactions = [...transactions, data];
      
      // First transaction badge
      if (newTransactions.length === 1 && !achievements.find(a => a.badge_type === 'first_transaction')) {
        await get().addAchievement({
          badge_type: 'first_transaction',
          title: 'First Steps',
          description: 'Added your first transaction',
          earned_at: new Date().toISOString(),
          progress: 100
        });
      }
      
      // Consistent tracker badge (30+ transactions)
      if (newTransactions.length >= 30 && !achievements.find(a => a.badge_type === 'consistent_tracker')) {
        await get().addAchievement({
          badge_type: 'consistent_tracker',
          title: 'Consistent Tracker',
          description: 'Tracked 30+ transactions',
          earned_at: new Date().toISOString(),
          progress: 100
        });
      }
      
      // Big saver badge (saved $1000+ in one transaction)
      if (t.type === 'savings' && t.amount >= 1000 && !achievements.find(a => a.badge_type === 'big_saver')) {
        await get().addAchievement({
          badge_type: 'big_saver',
          title: 'Big Saver',
          description: 'Saved $1000+ in a single transaction',
          earned_at: new Date().toISOString(),
          progress: 100
        });
      }
      
      // Update streaks
      await get().updateStreak('daily_tracking', true);
      await get().updateStreak('expense_logging', true);
    }
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
    const { userId, budgets, achievements } = get();
    if (!userId) return;
    
    // Check if budget already exists for this month
    const existingBudget = budgets.find(budget => budget.month === b.month);
    if (existingBudget) {
      set({ error: `Budget for ${b.month} already exists. Please edit the existing budget instead.` });
      return;
    }
    
    const supabase = createClient();
    const { byCategory, ...rest } = b;
    const payload = { ...rest, by_category: byCategory, user_id: userId };
    const { data, error } = await supabase.from("budgets").insert(payload).select().single();
    if (error) set({ error: `Failed to add budget: ${error.message}` });
    else if (data) {
      set({ budgets: [...budgets, { ...data, byCategory: data.by_category }] });
      
      // First budget badge
      if (budgets.length === 0 && !achievements.find(a => a.badge_type === 'first_budget')) {
        await get().addAchievement({
          badge_type: 'first_budget',
          title: 'Budget Planner',
          description: 'Created your first budget',
          earned_at: new Date().toISOString(),
          progress: 100
        });
      }
    }
  },
  updateBudget: async (b) => {
    const { budgets } = get();
    
    // Check if another budget exists for this month (excluding current one)
    const existingBudget = budgets.find(budget => budget.month === b.month && budget.id !== b.id);
    if (existingBudget) {
      set({ error: `Budget for ${b.month} already exists. Cannot change month to one that already has a budget.` });
      return;
    }
    
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
    const { userId, goals, achievements } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("goals").insert({ ...g, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add goal: ${error.message}` });
    else if (data) {
      set({ goals: [...goals, data] });
      
      // First goal badge
      if (goals.length === 0 && !achievements.find(a => a.badge_type === 'first_goal')) {
        await get().addAchievement({
          badge_type: 'first_goal',
          title: 'Goal Setter',
          description: 'Set your first financial goal',
          earned_at: new Date().toISOString(),
          progress: 100
        });
      }
    }
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
  toggleGoal: async (id) => {
    const goal = get().goals.find(g => g.id === id);
    if (!goal) return;
    const supabase = createClient();
    const newEnabled = !goal.enabled;
    const { error } = await supabase.from("goals").update({ enabled: newEnabled }).eq("id", id);
    if (error) set({ error: `Failed to toggle goal: ${error.message}` });
    else set({ goals: get().goals.map(x => x.id === id ? { ...x, enabled: newEnabled } : x) });
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
  },
  
  // Gamification Actions
  addAchievement: async (a) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("achievements").insert({ ...a, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add achievement: ${error.message}` });
    else if (data) set({ achievements: [...get().achievements, data] });
  },
  
  addChallenge: async (c) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("challenges").insert({ ...c, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add challenge: ${error.message}` });
    else if (data) set({ challenges: [...get().challenges, data] });
  },
  
  updateChallenge: async (c) => {
    const supabase = createClient();
    const { error } = await supabase.from("challenges").update(c).eq("id", c.id);
    if (error) set({ error: `Failed to update challenge: ${error.message}` });
    else set({ challenges: get().challenges.map(x => x.id === c.id ? c : x) });
  },
  
  completeChallenge: async (id) => {
    const challenge = get().challenges.find(c => c.id === id);
    if (!challenge) return;
    const supabase = createClient();
    const { error } = await supabase.from("challenges").update({ is_completed: true }).eq("id", id);
    if (error) set({ error: `Failed to complete challenge: ${error.message}` });
    else set({ challenges: get().challenges.map(x => x.id === id ? { ...x, is_completed: true } : x) });
  },
  
  updateStreak: async (type, increment) => {
    const { userId, streaks, achievements } = get();
    if (!userId) return;
    const supabase = createClient();
    const existing = streaks.find(s => s.streak_type === type);
    
    if (existing) {
      const newCount = increment ? existing.current_count + 1 : 0;
      const newBest = Math.max(existing.best_count, newCount);
      const { error } = await supabase.from("streaks").update({ 
        current_count: newCount, 
        best_count: newBest,
        last_activity_date: new Date().toISOString().split('T')[0]
      }).eq("id", existing.id);
      if (error) set({ error: `Failed to update streak: ${error.message}` });
      else {
        set({ streaks: streaks.map(s => s.id === existing.id ? { ...s, current_count: newCount, best_count: newBest } : s) });
        
        // Streak master badge (7+ day streak)
        if (newCount >= 7 && !achievements.find(a => a.badge_type === 'streak_master')) {
          await get().addAchievement({
            badge_type: 'streak_master',
            title: 'Streak Master',
            description: 'Maintained a 7+ day tracking streak',
            earned_at: new Date().toISOString(),
            progress: 100
          });
        }
      }
    } else {
      const { data, error } = await supabase.from("streaks").insert({ 
        user_id: userId, 
        streak_type: type, 
        current_count: increment ? 1 : 0,
        best_count: increment ? 1 : 0,
        last_activity_date: new Date().toISOString().split('T')[0]
      }).select().single();
      if (error) set({ error: `Failed to create streak: ${error.message}` });
      else if (data) set({ streaks: [...streaks, data] });
    }
  },
  
  calculateHealthScore: async (month) => {
    const { userId, transactions, budgets, goals, debts, achievements } = get();
    if (!userId) return;
    
    // Simple health score calculation
    const monthTransactions = transactions.filter(t => t.date.startsWith(month));
    const monthBudget = budgets.find(b => b.month === month);
    
    let budgetScore = 50;
    let savingsScore = 50;
    let expenseScore = 50;
    let goalScore = 50;
    let debtScore = 50;
    
    // Calculate scores based on financial behavior
    if (monthBudget && monthTransactions.length > 0) {
      const totalExpenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.base_amount, 0);
      const budgetTotal = monthBudget.total || 0;
      budgetScore = budgetTotal > 0 ? Math.max(0, Math.min(100, ((budgetTotal - totalExpenses) / budgetTotal) * 100)) : 50;
      
      // Budget keeper badge (stayed within budget)
      if (budgetScore >= 90 && !achievements.find(a => a.badge_type === 'budget_keeper')) {
        await get().addAchievement({
          badge_type: 'budget_keeper',
          title: 'Budget Keeper',
          description: 'Stayed within budget for a full month',
          earned_at: new Date().toISOString(),
          progress: 100
        });
      }
    }
    
    const overallScore = Math.round((budgetScore + savingsScore + expenseScore + goalScore + debtScore) / 5);
    
    const supabase = createClient();
    const { data, error } = await supabase.from("health_scores").upsert({ 
      user_id: userId,
      month,
      overall_score: overallScore,
      budget_adherence_score: Math.round(budgetScore),
      savings_rate_score: Math.round(savingsScore),
      expense_consistency_score: Math.round(expenseScore),
      goal_progress_score: Math.round(goalScore),
      debt_management_score: Math.round(debtScore)
    }).select().single();
    
    if (error) set({ error: `Failed to calculate health score: ${error.message}` });
    else if (data) {
      const existing = get().healthScores.find(h => h.month === month);
      if (existing) {
        set({ healthScores: get().healthScores.map(h => h.month === month ? data : h) });
      } else {
        set({ healthScores: [...get().healthScores, data] });
      }
    }
  },
  
  // Financial Tracking Actions
  addDebt: async (d) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("debts").insert({ ...d, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add debt: ${error.message}` });
    else if (data) set({ debts: [...get().debts, data] });
  },
  
  updateDebt: async (d) => {
    const supabase = createClient();
    const { error } = await supabase.from("debts").update(d).eq("id", d.id);
    if (error) set({ error: `Failed to update debt: ${error.message}` });
    else set({ debts: get().debts.map(x => x.id === d.id ? d : x) });
  },
  
  deleteDebt: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("debts").delete().eq("id", id);
    if (error) set({ error: `Failed to delete debt: ${error.message}` });
    else set({ debts: get().debts.filter(x => x.id !== id) });
  },
  
  addInvestment: async (i) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("investments").insert({ ...i, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add investment: ${error.message}` });
    else if (data) set({ investments: [...get().investments, data] });
  },
  
  updateInvestment: async (i) => {
    const supabase = createClient();
    const { error } = await supabase.from("investments").update(i).eq("id", i.id);
    if (error) set({ error: `Failed to update investment: ${error.message}` });
    else set({ investments: get().investments.map(x => x.id === i.id ? i : x) });
  },
  
  deleteInvestment: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("investments").delete().eq("id", id);
    if (error) set({ error: `Failed to delete investment: ${error.message}` });
    else set({ investments: get().investments.filter(x => x.id !== id) });
  },
  
  addAsset: async (a) => {
    const { userId } = get();
    if (!userId) return;
    const supabase = createClient();
    const { data, error } = await supabase.from("assets").insert({ ...a, user_id: userId }).select().single();
    if (error) set({ error: `Failed to add asset: ${error.message}` });
    else if (data) set({ assets: [...get().assets, data] });
  },
  
  updateAsset: async (a) => {
    const supabase = createClient();
    const { error } = await supabase.from("assets").update(a).eq("id", a.id);
    if (error) set({ error: `Failed to update asset: ${error.message}` });
    else set({ assets: get().assets.map(x => x.id === a.id ? a : x) });
  },
  
  deleteAsset: async (id) => {
    const supabase = createClient();
    const { error } = await supabase.from("assets").delete().eq("id", id);
    if (error) set({ error: `Failed to delete asset: ${error.message}` });
    else set({ assets: get().assets.filter(x => x.id !== id) });
  },
  
  // Dashboard Actions
  updateDashboardWidget: async (w) => {
    const supabase = createClient();
    const { error } = await supabase.from("dashboard_widgets").upsert(w).eq("id", w.id);
    if (error) set({ error: `Failed to update widget: ${error.message}` });
    else {
      const existing = get().dashboardWidgets.find(widget => widget.id === w.id);
      if (existing) {
        set({ dashboardWidgets: get().dashboardWidgets.map(widget => widget.id === w.id ? w : widget) });
      } else {
        set({ dashboardWidgets: [...get().dashboardWidgets, w] });
      }
    }
  },
  
  toggleWidgetVisibility: async (id) => {
    const widget = get().dashboardWidgets.find(w => w.id === id);
    if (!widget) return;
    const supabase = createClient();
    const newVisibility = !widget.is_visible;
    const { error } = await supabase.from("dashboard_widgets").update({ is_visible: newVisibility }).eq("id", id);
    if (error) set({ error: `Failed to toggle widget: ${error.message}` });
    else set({ dashboardWidgets: get().dashboardWidgets.map(w => w.id === id ? { ...w, is_visible: newVisibility } : w) });
  },
  
  // Offline Actions
  setOfflineMode: (offline) => {
    set({ isOffline: offline });
  },
  
  syncOfflineData: async () => {
    const { syncQueue, userId } = get();
    if (!userId || syncQueue.length === 0) return;
    
    const supabase = createClient();
    for (const item of syncQueue.filter(i => !i.is_synced)) {
      try {
        if (item.operation === 'INSERT') {
          await supabase.from(item.table_name).insert(item.data);
        } else if (item.operation === 'UPDATE') {
          await supabase.from(item.table_name).update(item.data).eq('id', item.record_id);
        } else if (item.operation === 'DELETE') {
          await supabase.from(item.table_name).delete().eq('id', item.record_id);
        }
        
        // Mark as synced
        await supabase.from('sync_queue').update({ is_synced: true, synced_at: new Date().toISOString() }).eq('id', item.id);
      } catch (error) {
        console.error('Sync error:', error);
      }
    }
    
    // Reload data after sync
    await get().loadData();
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
  if (g.enabled === false) {
    return { months: 0, neededMonthly: 0, pct: 0 };
  }
  
  // Use cached progress if available, otherwise calculate from transactions
  const actualProgress = g.progress_cached || 0;
  const months = Math.max(1, differenceInMonths(parseISO(g.target_date), new Date()));
  const neededMonthly = Math.max(0, (g.target_amount - actualProgress) / months);
  const pct = Math.min(100, (actualProgress / g.target_amount) * 100);
  return { months, neededMonthly, pct };
}