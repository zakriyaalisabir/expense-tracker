import { getAllCurrencies } from '../currency';
import { BaseSettings } from '@lib/types';

describe('getAllCurrencies', () => {
  it('should return base currencies when no custom currencies exist', () => {
    const settings: BaseSettings = {
      baseCurrency: 'THB',
      exchangeRates: { THB: 1, USD: 36 }
    };
    
    const result = getAllCurrencies(settings);
    expect(result).toEqual(['EUR', 'JPY', 'THB', 'USD']);
  });

  it('should include custom currencies and deduplicate', () => {
    const settings: BaseSettings = {
      baseCurrency: 'THB',
      exchangeRates: { THB: 1, USD: 36, GBP: 45 },
      customCurrencies: ['GBP', 'CAD', 'USD'] // USD is duplicate
    };
    
    const result = getAllCurrencies(settings);
    expect(result).toEqual(['CAD', 'EUR', 'GBP', 'JPY', 'THB', 'USD']);
  });

  it('should handle empty custom currencies array', () => {
    const settings: BaseSettings = {
      baseCurrency: 'USD',
      exchangeRates: { USD: 1 },
      customCurrencies: []
    };
    
    const result = getAllCurrencies(settings);
    expect(result).toEqual(['EUR', 'JPY', 'THB', 'USD']);
  });

  it('should sort currencies alphabetically', () => {
    const settings: BaseSettings = {
      baseCurrency: 'THB',
      exchangeRates: { THB: 1 },
      customCurrencies: ['ZAR', 'AUD', 'BRL']
    };
    
    const result = getAllCurrencies(settings);
    expect(result).toEqual(['AUD', 'BRL', 'EUR', 'JPY', 'THB', 'USD', 'ZAR']);
  });
});