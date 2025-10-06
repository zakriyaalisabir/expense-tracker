import { useAppStores, useTransactionStore, useAccountStore } from '../index';
import { renderHook } from '@testing-library/react';

// Mock individual stores
jest.mock('../transactionStore', () => ({
  useTransactionStore: jest.fn(() => ({ transactions: [] }))
}));

jest.mock('../accountStore', () => ({
  useAccountStore: jest.fn(() => ({ accounts: [] }))
}));

jest.mock('../categoryStore', () => ({
  useCategoryStore: jest.fn(() => ({ categories: [] }))
}));

jest.mock('../settingsStore', () => ({
  useSettingsStore: jest.fn(() => ({ settings: {} }))
}));

describe('Stores Index', () => {
  it('exports individual stores', () => {
    expect(useTransactionStore).toBeDefined();
    expect(useAccountStore).toBeDefined();
  });

  it('combines all stores with useAppStores', () => {
    const { result } = renderHook(() => useAppStores());
    
    expect(result.current.transactions).toEqual({ transactions: [] });
    expect(result.current.accounts).toEqual({ accounts: [] });
    expect(result.current.categories).toEqual({ categories: [] });
    expect(result.current.settings).toEqual({ settings: {} });
  });
});