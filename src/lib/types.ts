export type AccountType = "cash" | "bank" | "credit" | "ewallet" | "savings";
export type CurrencyCode = "THB" | "USD" | "EUR" | "JPY";

export type Account = {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  opening_balance: number;
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
};
