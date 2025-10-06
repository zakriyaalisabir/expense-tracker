import { useTransactionStore } from './transactionStore';
import { useAccountStore } from './accountStore';
import { useSettingsStore } from './settingsStore';
import { useCategoryStore } from './categoryStore';

export { useTransactionStore } from './transactionStore';
export { useAccountStore } from './accountStore';
export { useSettingsStore } from './settingsStore';
export { useCategoryStore } from './categoryStore';

// Combined store hook for components that need multiple stores
export const useAppStores = () => ({
  transactions: useTransactionStore(),
  accounts: useAccountStore(),
  settings: useSettingsStore(),
  categories: useCategoryStore(),
});