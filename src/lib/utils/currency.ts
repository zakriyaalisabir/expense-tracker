import { CURRENCIES } from "@lib/constants";
import { BaseSettings } from "@lib/types";

/**
 * Get all available currencies including base currencies and custom currencies
 */
export function getAllCurrencies(settings: BaseSettings): string[] {
  const baseCurrencies = [...CURRENCIES];
  const customCurrencies = settings.customCurrencies || [];
  
  // Combine and deduplicate
  const allCurrencies = [...new Set([...baseCurrencies, ...customCurrencies])];
  
  return allCurrencies.sort();
}