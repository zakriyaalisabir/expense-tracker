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
  HOME: "/home",
  DASHBOARD: "/dashboard",
  TRANSACTIONS: "/transactions",
  CATEGORIES: "/categories",
  ACCOUNTS: "/accounts",
  BUDGETS: "/budgets",
  GOALS: "/goals",
  REPORTS: "/reports",
  GAMIFICATION: "/gamification",
  FINANCIAL: "/financial",
  DASHBOARD_CUSTOM: "/dashboard-custom",
  SETTINGS: "/settings",
} as const;

export const TABS = [
  { label: "Home", href: ROUTES.HOME, icon: "Home" },
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: "Dashboard" },
  { label: "Transactions", href: ROUTES.TRANSACTIONS, icon: "Receipt" },
  { label: "Accounts", href: ROUTES.ACCOUNTS, icon: "AccountBalance" },
  { label: "Budgets", href: ROUTES.BUDGETS, icon: "AccountBalanceWallet" },
  { label: "Goals", href: ROUTES.GOALS, icon: "EmojiEvents" },
  { label: "Gamification", href: ROUTES.GAMIFICATION, icon: "EmojiEvents" },
  { label: "Financial", href: ROUTES.FINANCIAL, icon: "TrendingUp" },
  { label: "Custom", href: ROUTES.DASHBOARD_CUSTOM, icon: "Dashboard" },
  { label: "Reports", href: ROUTES.REPORTS, icon: "Assessment" },
  { label: "Settings", href: ROUTES.SETTINGS, icon: "Settings" },
] as const;

export const CURRENCIES = ["THB", "USD", "EUR", "JPY"] as const;

export const ACCOUNT_TYPES = ["cash", "bank", "credit", "ewallet", "savings"] as const;

export const CATEGORY_TYPES = ["income", "expense", "savings"] as const;

export const TRANSACTION_TYPES = ["income", "expense", "savings"] as const;
