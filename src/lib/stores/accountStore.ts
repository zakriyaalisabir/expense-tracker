"use client";
import { create } from "zustand";
import { Account } from "../types";
import { accountRepository } from "../services";

type AccountState = {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
};

type AccountActions = {
  loadAccounts: (userId: string) => Promise<void>;
  addAccount: (account: Omit<Account, "id" | "user_id">, userId: string) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

const initialState: AccountState = {
  accounts: [],
  isLoading: false,
  error: null,
};

export const useAccountStore = create<AccountState & AccountActions>()((set, get) => ({
  ...initialState,

  loadAccounts: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountRepository.findByUserId(userId);
      set({ accounts, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  addAccount: async (account, userId) => {
    try {
      const newAccount = await accountRepository.create(account, userId);
      set({ accounts: [...get().accounts, newAccount] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateAccount: async (account: Account) => {
    try {
      await accountRepository.update(account);
      set({ accounts: get().accounts.map(a => a.id === account.id ? account : a) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  deleteAccount: async (id: string) => {
    try {
      await accountRepository.delete(id);
      set({ accounts: get().accounts.filter(a => a.id !== id) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));