# Expense Tracker (Next.js + TypeScript + MUI + D3 + Zustand)

A personal expense tracker with multi-currency support, budgeting, and goal tracking.

## Tech Stack
- **Next.js 14** (App Router) + **TypeScript**
- **MUI 6** for UI components and theming
- **D3.js 7** for interactive charts (pie, bar, heatmap)
- **Zustand 4** for state management (persisted to localStorage)
- **date-fns** for date utilities

## Application Flow

### Pages & Navigation
- **Dashboard** (`/`) - Overview with charts and quick transaction entry
- **Transactions** (`/transactions`) - Full transaction management
- **Accounts** (`/accounts`) - Account balances and management
- **Budgets** (`/budgets`) - Monthly budget tracking
- **Goals** (`/goals`) - Financial goal progress
- **Reports** (`/reports`) - CSV export and printable reports
- **Settings** (`/settings`) - Base currency configuration

### Data Structure
- **Accounts**: Cash, Bank, Credit, E-wallet with multi-currency support
- **Categories**: Income/Expense categorization
- **Transactions**: Full transaction records with FX conversion
- **Budgets**: Monthly limits by category
- **Goals**: Target amounts with progress tracking

### Charts (D3.js)
- **Monthly Income vs Expenses**: Bar chart comparison
- **Category Breakdown**: Pie chart for expense distribution
- **Daily Trend**: Heatmap visualization

## Configuration Options

### Currency Settings
- **Base Currency**: THB, USD, EUR, JPY (configurable in Settings)
- **FX Rates**: Static rates in `src/lib/currency.ts`
- **Multi-currency accounts**: Each account can have different currency

### Theme Configuration
- **Dark/Light mode**: Toggle in header (persisted to localStorage)
- **MUI Theme**: Customizable in `src/app/layout.tsx`
- **Colors**: Success (#2e7d32), Error (#c62828)
- **Border radius**: 16px default

### Data Storage
- **Persistence**: Zustand store with localStorage (`expense-tracker-v1`)
- **Seed data**: Auto-generated sample data on first load
- **Export**: CSV format with date range filtering

### TypeScript Paths
```json
"@components/*": ["./src/components/*"]
"@lib/*": ["./src/lib/*"]
```

## Quick Start
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Customization

### Adding Currencies
Update `src/lib/currency.ts` and `src/lib/types.ts`:
```typescript
export const FX: Record<CurrencyCode, number> = {
  THB: 1, USD: 36, EUR: 39, JPY: 0.25, GBP: 45 // Add new currency
};
```

### Modifying Account Types
Edit `AccountType` in `src/lib/types.ts`:
```typescript
export type AccountType = "cash" | "bank" | "credit" | "ewallet" | "investment";
```

### Custom Categories
Seed data in `src/lib/store.ts` or add via UI

### Chart Styling
D3 charts in `src/components/charts/` use MUI theme colors and d3.schemeTableau10

## Production Notes
- Replace static FX rates with live API in `src/lib/currency.ts`
- Consider adding XLSX export via `xlsx` package
- Data persists only in browser localStorage
- No authentication or backend required
