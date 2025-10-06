"use client";
import { create } from "zustand";
import { Category } from "../types";
import { categoryRepository } from "../services";

type CategoryState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
};

type CategoryActions = {
  loadCategories: (userId: string) => Promise<void>;
  addCategory: (category: Omit<Category, "id" | "user_id">, userId: string) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

const initialState: CategoryState = {
  categories: [],
  isLoading: false,
  error: null,
};

export const useCategoryStore = create<CategoryState & CategoryActions>()((set, get) => ({
  ...initialState,

  loadCategories: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const categories = await categoryRepository.findByUserId(userId);
      set({ categories, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  addCategory: async (category, userId) => {
    try {
      const newCategory = await categoryRepository.create(category, userId);
      set({ categories: [...get().categories, newCategory] });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  updateCategory: async (category: Category) => {
    try {
      await categoryRepository.update(category);
      set({ categories: get().categories.map(c => c.id === category.id ? category : c) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  deleteCategory: async (id: string) => {
    try {
      await categoryRepository.delete(id);
      set({ categories: get().categories.filter(c => c.id !== id) });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));