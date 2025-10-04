import { createClient } from "@lib/supabase/client";
import { Category } from "@lib/types";
import { useAppStore } from "@lib/store";

const isDemoMode = () => typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';

export const categoriesApi = {
  async getAll(): Promise<Category[]> {
    if (isDemoMode()) return useAppStore.getState().categories;
    
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  },

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    if (isDemoMode()) {
      useAppStore.getState().addCategory(category as Category);
      return category as Category;
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('categories').insert({ ...category, user_id: user?.id }).select().single();
    if (error) throw error;
    return data;
  },

  async update(category: Category): Promise<Category> {
    if (isDemoMode()) {
      useAppStore.getState().updateCategory(category);
      return category;
    }

    const supabase = createClient();
    const { data, error } = await supabase.from('categories').update(category).eq('id', category.id).select().single();
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    if (isDemoMode()) {
      useAppStore.getState().deleteCategory(id);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
};
