import { createClient } from "@lib/supabase/client";
import { Budget } from "@lib/types";
import { useAppStore } from "@lib/store";

const isDemoMode = () => typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';

export const budgetsApi = {
  async getAll(): Promise<Budget[]> {
    if (isDemoMode()) return useAppStore.getState().budgets;
    
    const supabase = createClient();
    const { data, error } = await supabase.from('budgets').select('*').order('month', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async create(budget: Omit<Budget, 'id'>): Promise<Budget> {
    if (isDemoMode()) {
      useAppStore.getState().addBudget(budget as Budget);
      return budget as Budget;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('budgets').insert({ ...budget, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
  },

  async update(budget: Budget): Promise<Budget> {
    if (isDemoMode()) {
      useAppStore.getState().updateBudget(budget);
      return budget;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('budgets').update(budget).eq('id', budget.id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      useAppStore.getState().deleteBudget(id);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (error) throw error;
  }
};
