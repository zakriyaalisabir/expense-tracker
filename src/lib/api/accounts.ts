import { createClient } from "@lib/supabase/client";
import { Account } from "@lib/types";
import { useAppStore } from "@lib/store";

const isDemoMode = () => typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';

export const accountsApi = {
  async getAll(): Promise<Account[]> {
    if (isDemoMode()) return useAppStore.getState().accounts;
    
    const supabase = createClient();
    const { data, error } = await supabase.from('accounts').select('*').order('created_at');
    if (error) throw error;
    return data || [];
  },

  async create(account: Omit<Account, 'id'>): Promise<Account> {
    if (isDemoMode()) {
      useAppStore.getState().addAccount(account as Account);
      return account as Account;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('accounts').insert({ ...account, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
  },

  async update(account: Account): Promise<Account> {
    if (isDemoMode()) {
      useAppStore.getState().updateAccount(account);
      return account;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('accounts').update(account).eq('id', account.id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      useAppStore.getState().deleteAccount(id);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('accounts').delete().eq('id', id);
    if (error) throw error;
  }
};
