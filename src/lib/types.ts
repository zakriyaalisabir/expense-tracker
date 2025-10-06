export type AccountType = "cash" | "bank" | "credit" | "ewallet" | "savings";
export type CurrencyCode = "THB" | "USD" | "EUR" | "JPY";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  opening_balance: number;
  current_balance?: number;
};

export type CategoryType = "income" | "expense" | "savings";
export type Category = {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  parent_id?: string;
  currency?: CurrencyCode;
};

export type Transaction = {
  id: string;
  user_id: string;
  date: string; // ISO
  type: CategoryType;
  amount: number;
  currency: CurrencyCode;
  account_id: string;
  category_id: string;
  subcategory_id?: string;
  tags: string[];
  description?: string;
  fx_rate: number;
  base_amount: number;
  debt_id?: string;
  investment_id?: string;
  is_debt_payment?: boolean;
  is_investment?: boolean;
};

export type Goal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  target_date: string; // ISO
  monthly_contribution: number;
  source_account_id: string;
  progress_cached?: number;
  enabled?: boolean;
};

export type Budget = {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  total?: number;
  byCategory?: { [category_id: string]: number };
};

export type BaseSettings = {
  baseCurrency: CurrencyCode;
  exchangeRates?: Record<string, number>;
  customCurrencies?: string[];
  visiblePages?: Record<string, boolean>;
};

// Gamification & Motivation Types
export type BadgeType = 
  | "budget_keeper" | "saver" | "goal_achiever" | "streak_master"
  | "first_transaction" | "first_budget" | "first_goal" | "big_saver"
  | "consistent_tracker" | "expense_cutter" | "income_booster";

export type Achievement = {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  title: string;
  description: string;
  earned_at: string;
  progress: number;
};

export type ChallengeType = 
  | "monthly_savings" | "expense_reduction" | "budget_adherence"
  | "no_spend_days" | "category_limit" | "streak_challenge";

export type Challenge = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  challenge_type: ChallengeType;
  target_amount?: number;
  target_days?: number;
  start_date: string;
  end_date: string;
  current_progress: number;
  is_completed: boolean;
  reward_points: number;
};

export type HealthScore = {
  id: string;
  user_id: string;
  month: string;
  overall_score: number;
  budget_adherence_score: number;
  savings_rate_score: number;
  expense_consistency_score: number;
  goal_progress_score: number;
  debt_management_score: number;
  calculated_at: string;
};

export type StreakType = 
  | "daily_tracking" | "budget_adherence" | "no_overspend"
  | "savings_goal" | "expense_logging" | "goal_contribution";

export type Streak = {
  id: string;
  user_id: string;
  streak_type: StreakType;
  current_count: number;
  best_count: number;
  last_activity_date?: string;
  is_active: boolean;
};

// Financial Tracking Types
export type DebtType = 
  | "credit_card" | "personal_loan" | "mortgage" | "student_loan"
  | "car_loan" | "business_loan" | "other";

export type Debt = {
  id: string;
  user_id: string;
  name: string;
  debt_type: DebtType;
  original_amount: number;
  current_balance: number;
  interest_rate: number;
  minimum_payment: number;
  due_date: number;
  account_id?: string;
  target_payoff_date?: string;
  is_active: boolean;
};

export type InvestmentType = 
  | "stock" | "bond" | "crypto" | "mutual_fund" | "etf"
  | "real_estate" | "commodity" | "other";

export type Investment = {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  investment_type: InvestmentType;
  quantity: number;
  purchase_price: number;
  current_price?: number;
  purchase_date: string;
  account_id?: string;
  currency: CurrencyCode;
  is_active: boolean;
};

export type AssetType = 
  | "real_estate" | "vehicle" | "jewelry" | "art" | "collectibles"
  | "business_equity" | "other_assets";

export type Asset = {
  id: string;
  user_id: string;
  name: string;
  asset_type: AssetType;
  current_value: number;
  purchase_value?: number;
  purchase_date?: string;
  currency: CurrencyCode;
  is_active: boolean;
};

// UI Enhancement Types
export type WidgetType = 
  | "balance_summary" | "monthly_spending" | "budget_progress" | "goal_progress"
  | "recent_transactions" | "spending_by_category" | "financial_health"
  | "achievements" | "challenges" | "streaks" | "net_worth" | "investment_summary";

export type DashboardWidget = {
  id: string;
  user_id: string;
  widget_type: WidgetType;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  is_visible: boolean;
  config: Record<string, any>;
};

export type SyncQueueItem = {
  id: string;
  user_id: string;
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  record_id?: string;
  data: Record<string, any>;
  created_at: string;
  synced_at?: string;
  is_synced: boolean;
};
