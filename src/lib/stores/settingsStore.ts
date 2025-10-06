"use client";
import { create } from "zustand";
import { BaseSettings, CurrencyCode } from "../types";
import { createClient } from "../supabase/client";

type SettingsState = {
  settings: BaseSettings;
  isLoading: boolean;
  error: string | null;
};

type SettingsActions = {
  loadSettings: (userId: string) => Promise<void>;
  setBaseCurrency: (currency: CurrencyCode, userId: string) => Promise<void>;
  setExchangeRate: (currency: string, rate: number, userId: string) => Promise<void>;
  addCustomCurrency: (code: string, rate: number, userId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
};

const initialState: SettingsState = {
  settings: { 
    baseCurrency: "THB", 
    exchangeRates: { THB: 1, USD: 36, EUR: 39, JPY: 0.25 } 
  },
  isLoading: false,
  error: null,
};

export const useSettingsStore = create<SettingsState & SettingsActions>()((set, get) => ({
  ...initialState,

  loadSettings: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      const settings = data ? {
        baseCurrency: data.base_currency as CurrencyCode,
        exchangeRates: data.exchange_rates || initialState.settings.exchangeRates,
        customCurrencies: data.custom_currencies || []
      } : initialState.settings;
      
      set({ settings, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error', isLoading: false });
    }
  },

  setBaseCurrency: async (currency: CurrencyCode, userId: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_settings")
        .update({ base_currency: currency })
        .eq("user_id", userId);
      
      if (error) throw error;
      set({ settings: { ...get().settings, baseCurrency: currency } });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  setExchangeRate: async (currency: string, rate: number, userId: string) => {
    try {
      const newRates = { ...get().settings.exchangeRates, [currency]: rate };
      const supabase = createClient();
      const { error } = await supabase
        .from("user_settings")
        .update({ exchange_rates: newRates })
        .eq("user_id", userId);
      
      if (error) throw error;
      set({ settings: { ...get().settings, exchangeRates: newRates } });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  addCustomCurrency: async (code: string, rate: number, userId: string) => {
    try {
      const { settings } = get();
      const newCurrencies = [...(settings.customCurrencies || []), code];
      const newRates = { ...settings.exchangeRates, [code]: rate };
      
      const supabase = createClient();
      const { error } = await supabase
        .from("user_settings")
        .update({ 
          custom_currencies: newCurrencies, 
          exchange_rates: newRates 
        })
        .eq("user_id", userId);
      
      if (error) throw error;
      set({ 
        settings: { 
          ...settings, 
          customCurrencies: newCurrencies, 
          exchangeRates: newRates 
        } 
      });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  clearError: () => set({ error: null }),
  reset: () => set(initialState),
}));