import { createClient } from "@lib/supabase/client";
import { Goal } from "@lib/types";
import { useAppStore } from "@lib/store";

const isDemoMode = () => typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';

export const goalsApi = {
  async getAll(): Promise<Goal[]> {
    if (isDemoMode()) return useAppStore.getState().goals;
    
    const supabase = createClient();
    const { data, error } = await supabase.from('goals').select('*').order('target_date');
    if (error) throw error;
    return data || [];
  },

  async create(goal: Omit<Goal, 'id'>): Promise<Goal> {
    if (isDemoMode()) {
      useAppStore.getState().addGoal(goal as Goal);
      return goal as Goal;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('goals').insert({ ...goal, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
  },

  async update(goal: Goal): Promise<Goal> {
    if (isDemoMode()) {
      useAppStore.getState().updateGoal(goal);
      return goal;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('goals').update(goal).eq('id', goal.id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      useAppStore.getState().deleteGoal?.(id);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) throw error;
  }
};
