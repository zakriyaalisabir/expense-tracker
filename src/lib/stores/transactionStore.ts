"use client";
import { create } from "zustand";
import { Transaction } from "../types";
import { transactionService } from "../services";
import { logger } from "../logger";

type TransactionState = {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
};

type TransactionActions = {
  loadTransactions: (userId: string) => Promise<void>;
  addTransaction: (data: Omit<Transaction, "id" | "user_id" | "fx_rate" | "base_amount">, userId: string, baseCurrency: string, exchangeRates: Record<string, number>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
};

export const useTransactionStore = create<TransactionState & TransactionActions>()((set, get) => ({
  ...initialState,

  loadTransactions: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const transactions = await transactionService.getTransactionsByUser(userId);
      set({ transactions, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  addTransaction: async (data, userId, baseCurrency, exchangeRates) => {
    try {
      const transaction = await transactionService.createTransaction(data, userId, baseCurrency as any, exchangeRates);
      set({ transactions: [...get().transactions, transaction] });
    } catch (error) {
      logger.error('Failed to add transaction', error instanceof Error ? error : new Error('Unknown error'), { userId, data });
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateTransaction: async (transaction: Transaction) => {
    try {
      await transactionService.updateTransaction(transaction);
      set({ transactions: get().transactions.map(t => t.id === transaction.id ? transaction : t) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      set({ transactions: get().transactions.filter(t => t.id !== id) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));