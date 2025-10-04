import { createClient } from "@lib/supabase/client";
import { Transaction } from "@lib/types";
import { useAppStore } from "@lib/store";

const isDemoMode = () => typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';

export const transactionsApi = {
  async getAll(): Promise<Transaction[]> {
    if (isDemoMode()) return useAppStore.getState().transactions;
    
    const supabase = createClient();
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    if (isDemoMode()) {
      useAppStore.getState().addTransaction(transaction as Transaction);
      return transaction as Transaction;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('transactions').insert({ ...transaction, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
  },

  async update(transaction: Transaction): Promise<Transaction> {
    if (isDemoMode()) {
      useAppStore.getState().updateTransaction(transaction);
      return transaction;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('transactions').update(transaction).eq('id', transaction.id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      useAppStore.getState().deleteTransaction(id);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  }
};
