import { useAppStore, totalsForRange, totalsForRangeByCurrency, goalProgress } from '../store';
import { createClient } from '../supabase/client';

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(),
        then: jest.fn()
      }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn()
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn()
    })),
    delete: jest.fn(() => ({
      eq: jest.fn()
    }))
  }))
};

jest.mock('../supabase/client', () => ({
  createClient: () => mockSupabase
}));

describe('Store Extended Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({
      settings: { baseCurrency: 'USD', exchangeRates: { USD: 1, EUR: 0.85 } },
      transactions: [],
      accounts: [],
      categories: [],
      goals: [],
      budgets: [],
      isLoading: false,
      userId: 'test-user',
      error: null
    });
  });

  describe('loadData', () => {
    it('handles successful data load', async () => {
      // Mock Promise.all to resolve with mock data
      const originalPromiseAll = Promise.all;
      Promise.all = jest.fn().mockResolvedValue([
        { data: { base_currency: 'USD', exchange_rates: { USD: 1 } } },
        { data: [{ id: '1', name: 'Test Account' }] },
        { data: [{ id: '1', name: 'Test Category' }] },
        { data: [{ id: '1', amount: 100 }] },
        { data: [{ id: '1', name: 'Test Goal' }] },
        { data: [{ id: '1', month: '2024-01', by_category: {} }] }
      ]);

      await useAppStore.getState().loadData();

      expect(useAppStore.getState().isLoading).toBe(false);
      expect(useAppStore.getState().error).toBe(null);
      
      // Restore
      Promise.all = originalPromiseAll;
    });

    it('handles load error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Mock Promise.all to reject
      const originalPromiseAll = Promise.all;
      Promise.all = jest.fn().mockRejectedValue(new Error('Database error'));

      await useAppStore.getState().loadData();

      expect(useAppStore.getState().error).toContain('Failed to load data');
      
      // Restore
      Promise.all = originalPromiseAll;
      consoleSpy.mockRestore();
    });
  });

  describe('budget operations', () => {
    it('prevents duplicate budget for same month', async () => {
      useAppStore.setState({
        budgets: [{ id: '1', month: '2024-01', amount: 1000, byCategory: {} } as any]
      });

      await useAppStore.getState().addBudget({ month: '2024-01', amount: 2000, byCategory: {} } as any);

      expect(useAppStore.getState().error).toContain('Budget for 2024-01 already exists');
    });

    it('prevents updating budget to existing month', async () => {
      useAppStore.setState({
        budgets: [
          { id: '1', month: '2024-01', amount: 1000, byCategory: {} } as any,
          { id: '2', month: '2024-02', amount: 1500, byCategory: {} } as any
        ]
      });

      await useAppStore.getState().updateBudget({ 
        id: '2', month: '2024-01', amount: 1500, byCategory: {} 
      } as any);

      expect(useAppStore.getState().error).toContain('Budget for 2024-01 already exists');
    });
  });

  describe('totalsForRange', () => {
    beforeEach(() => {
      useAppStore.setState({
        transactions: [
          { id: '1', type: 'income', base_amount: 1000, date: '2024-01-15' },
          { id: '2', type: 'expense', base_amount: 300, date: '2024-01-20' },
          { id: '3', type: 'savings', base_amount: 200, date: '2024-01-25' },
          { id: '4', type: 'expense', base_amount: 100, date: '2023-12-15' }
        ] as any
      });
    });

    it('calculates totals for date range', () => {
      const result = totalsForRange('2024-01-01', '2024-01-31');
      
      expect(result.income).toBe(1000);
      expect(result.expense).toBe(300);
      expect(result.saved).toBe(200);
      expect(result.savings).toBe(500); // 1000 - 300 - 200
      expect(result.savingsPct).toBe(50); // (500/1000) * 100
    });

    it('calculates totals without date range', () => {
      const result = totalsForRange();
      
      expect(result.income).toBe(1000);
      expect(result.expense).toBe(400); // 300 + 100
      expect(result.saved).toBe(200);
    });
  });

  describe('totalsForRangeByCurrency', () => {
    beforeEach(() => {
      useAppStore.setState({
        transactions: [
          { id: '1', type: 'income', amount: 1000, currency: 'USD', date: '2024-01-15' },
          { id: '2', type: 'expense', amount: 300, currency: 'USD', date: '2024-01-20' },
          { id: '3', type: 'income', amount: 500, currency: 'EUR', date: '2024-01-25' }
        ] as any
      });
    });

    it('calculates totals for specific currency', () => {
      const result = totalsForRangeByCurrency('2024-01-01', '2024-01-31', 'USD');
      
      expect(result.income).toBe(1000);
      expect(result.expense).toBe(300);
      expect(result.savings).toBe(700);
      expect(result.currency).toBe('USD');
    });

    it('calculates totals by all currencies', () => {
      const result = totalsForRangeByCurrency('2024-01-01', '2024-01-31');
      
      expect(result.USD.income).toBe(1000);
      expect(result.USD.expense).toBe(300);
      expect(result.EUR.income).toBe(500);
      expect(result.EUR.expense).toBe(0);
    });
  });

  describe('goalProgress', () => {
    it('calculates progress for enabled goal', () => {
      const goal = {
        id: '1',
        target_amount: 1000,
        target_date: '2024-12-31',
        progress_cached: 300,
        enabled: true
      };

      const result = goalProgress(goal as any);
      
      expect(result.pct).toBe(30); // (300/1000) * 100
      expect(result.months).toBeGreaterThan(0);
      expect(result.neededMonthly).toBeGreaterThan(0);
    });

    it('returns zero progress for disabled goal', () => {
      const goal = {
        id: '1',
        target_amount: 1000,
        target_date: '2024-12-31',
        progress_cached: 300,
        enabled: false
      };

      const result = goalProgress(goal as any);
      
      expect(result.pct).toBe(0);
      expect(result.months).toBe(0);
      expect(result.neededMonthly).toBe(0);
    });

    it('handles goal without cached progress', () => {
      const goal = {
        id: '1',
        target_amount: 1000,
        target_date: '2024-12-31',
        enabled: true
      };

      const result = goalProgress(goal as any);
      
      expect(result.pct).toBe(0);
    });
  });

  describe('currency operations', () => {
    it('updates exchange rates', async () => {
      mockSupabase.from.mockReturnValue({
        update: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      });

      await useAppStore.getState().setExchangeRate('EUR', 0.9);

      expect(useAppStore.getState().settings.exchangeRates.EUR).toBe(0.9);
    });

    it('adds custom currency', async () => {
      mockSupabase.from.mockReturnValue({
        update: () => ({
          eq: () => Promise.resolve({ error: null })
        })
      });

      await useAppStore.getState().addCustomCurrency('GBP', 0.8);

      expect(useAppStore.getState().settings.customCurrencies).toContain('GBP');
      expect(useAppStore.getState().settings.exchangeRates.GBP).toBe(0.8);
    });
  });
});