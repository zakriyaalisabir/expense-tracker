export const THEME_MODE_KEY = "theme-mode";
export const STORAGE_KEY = "expense-tracker-v1";

export const THEME_MODE = {
  LIGHT: "light" as const,
  DARK: "dark" as const,
};

export const COLORS = {
  SUCCESS: "#2e7d32",
  ERROR: "#c62828",
};

export const BORDER_RADIUS = 16;
export const ELEVATION = 2;

export const LOADING_DELAY = 300;
export const FADE_TIMEOUT = 500;

export const DRAWER_WIDTH = 250;
export const MOBILE_BREAKPOINT = "(max-width:900px)";

export const ROUTES = {
  SUMMARY: "/summary",
  DASHBOARD: "/dashboard",
  TRANSACTIONS: "/transactions",
  CATEGORIES: "/categories",
  ACCOUNTS: "/accounts",
  BUDGETS: "/budgets",
  GOALS: "/goals",
  REPORTS: "/reports",
  SETTINGS: "/settings",
} as const;

export const TABS = [
  { label: "Summary", href: ROUTES.SUMMARY },
  { label: "Dashboard", href: ROUTES.DASHBOARD },
  { label: "Transactions", href: ROUTES.TRANSACTIONS },
  { label: "Categories", href: ROUTES.CATEGORIES },
  { label: "Accounts", href: ROUTES.ACCOUNTS },
  { label: "Budgets", href: ROUTES.BUDGETS },
  { label: "Goals", href: ROUTES.GOALS },
  { label: "Reports", href: ROUTES.REPORTS },
  { label: "Settings", href: ROUTES.SETTINGS },
] as const;

export const CURRENCIES = ["THB", "USD", "EUR", "JPY"] as const;

export const ACCOUNT_TYPES = ["cash", "bank", "credit", "ewallet", "savings"] as const;

export const CATEGORY_TYPES = ["income", "expense", "savings"] as const;

export const TRANSACTION_TYPES = ["income", "expense", "savings"] as const;
