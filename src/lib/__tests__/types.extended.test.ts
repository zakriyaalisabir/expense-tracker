import { Account, Category, Transaction, Goal, Budget, BaseSettings, AccountType, CurrencyCode, CategoryType } from '../types';

describe('Type definitions - Extended Coverage', () => {
  describe('Type validation', () => {
    it('validates AccountType values', () => {
      const validTypes: AccountType[] = ['cash', 'bank', 'credit', 'ewallet', 'savings'];
      validTypes.forEach(type => {
        const account: Account = {
          id: 'test',
          user_id: 'user',
          name: 'Test',
          type,
          currency: 'USD',
          opening_balance: 0
        };
        expect(['cash', 'bank', 'credit', 'ewallet', 'savings']).toContain(account.type);
      });
    });

    it('validates CurrencyCode values', () => {
      const validCurrencies: CurrencyCode[] = ['THB', 'USD', 'EUR', 'JPY'];
      validCurrencies.forEach(currency => {
        const account: Account = {
          id: 'test',
          user_id: 'user',
          name: 'Test',
          type: 'cash',
          currency,
          opening_balance: 0
        };
        expect(['THB', 'USD', 'EUR', 'JPY']).toContain(account.currency);
      });
    });

    it('validates CategoryType values', () => {
      const validTypes: CategoryType[] = ['income', 'expense', 'savings'];
      validTypes.forEach(type => {
        const category: Category = {
          id: 'test',
          user_id: 'user',
          name: 'Test',
          type
        };
        expect(['income', 'expense', 'savings']).toContain(category.type);
      });
    });
  });

  describe('Optional fields handling', () => {
    it('handles Category optional fields', () => {
      const categoryWithOptionals: Category = {
        id: 'c1',
        user_id: 'u1',
        name: 'Test Category',
        type: 'expense',
        parent_id: 'parent1',
        currency: 'EUR'
      };
      
      expect(categoryWithOptionals.parent_id).toBe('parent1');
      expect(categoryWithOptionals.currency).toBe('EUR');
      
      const categoryMinimal: Category = {
        id: 'c2',
        user_id: 'u1',
        name: 'Minimal Category',
        type: 'income'
      };
      
      expect(categoryMinimal.parent_id).toBeUndefined();
      expect(categoryMinimal.currency).toBeUndefined();
    });

    it('handles Transaction optional fields', () => {
      const transactionFull: Transaction = {
        id: 't1',
        user_id: 'u1',
        date: '2024-01-01',
        type: 'expense',
        amount: 100,
        currency: 'USD',
        account_id: 'a1',
        category_id: 'c1',
        subcategory_id: 'sc1',
        tags: ['tag1', 'tag2'],
        description: 'Test transaction',
        fx_rate: 1,
        base_amount: 100
      };
      
      expect(transactionFull.subcategory_id).toBe('sc1');
      expect(transactionFull.description).toBe('Test transaction');
      
      const transactionMinimal: Transaction = {
        id: 't2',
        user_id: 'u1',
        date: '2024-01-01',
        type: 'income',
        amount: 200,
        currency: 'THB',
        account_id: 'a1',
        category_id: 'c1',
        tags: [],
        fx_rate: 1,
        base_amount: 200
      };
      
      expect(transactionMinimal.subcategory_id).toBeUndefined();
      expect(transactionMinimal.description).toBeUndefined();
    });

    it('handles Goal optional fields', () => {
      const goalWithProgress: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Test Goal',
        target_amount: 1000,
        target_date: '2024-12-31',
        monthly_contribution: 100,
        source_account_id: 'a1',
        progress_cached: 500,
        enabled: true
      };
      
      expect(goalWithProgress.progress_cached).toBe(500);
      expect(goalWithProgress.enabled).toBe(true);
      
      const goalMinimal: Goal = {
        id: 'g2',
        user_id: 'u1',
        name: 'Minimal Goal',
        target_amount: 2000,
        target_date: '2025-01-01',
        monthly_contribution: 200,
        source_account_id: 'a1'
      };
      
      expect(goalMinimal.progress_cached).toBeUndefined();
      expect(goalMinimal.enabled).toBeUndefined();
    });

    it('handles Budget optional fields', () => {
      const budgetWithFields: Budget = {
        id: 'b1',
        user_id: 'u1',
        month: '2024-01',
        total: 5000,
        byCategory: { 'c1': 2000, 'c2': 3000 }
      };
      
      expect(budgetWithFields.total).toBe(5000);
      expect(budgetWithFields.byCategory).toEqual({ 'c1': 2000, 'c2': 3000 });
      
      const budgetMinimal: Budget = {
        id: 'b2',
        user_id: 'u1',
        month: '2024-02'
      };
      
      expect(budgetMinimal.total).toBeUndefined();
      expect(budgetMinimal.byCategory).toBeUndefined();
    });

    it('handles BaseSettings optional fields', () => {
      const settingsFull: BaseSettings = {
        baseCurrency: 'USD',
        exchangeRates: { EUR: 0.85, JPY: 110 },
        customCurrencies: ['GBP', 'CAD']
      };
      
      expect(settingsFull.exchangeRates).toEqual({ EUR: 0.85, JPY: 110 });
      expect(settingsFull.customCurrencies).toEqual(['GBP', 'CAD']);
      
      const settingsMinimal: BaseSettings = {
        baseCurrency: 'THB'
      };
      
      expect(settingsMinimal.exchangeRates).toBeUndefined();
      expect(settingsMinimal.customCurrencies).toBeUndefined();
    });
  });

  describe('Data structure validation', () => {
    it('validates string fields are strings', () => {
      const account: Account = {
        id: 'string-id',
        user_id: 'string-user-id',
        name: 'string-name',
        type: 'cash',
        currency: 'USD',
        opening_balance: 100
      };
      
      expect(typeof account.id).toBe('string');
      expect(typeof account.user_id).toBe('string');
      expect(typeof account.name).toBe('string');
    });

    it('validates number fields are numbers', () => {
      const transaction: Transaction = {
        id: 't1',
        user_id: 'u1',
        date: '2024-01-01',
        type: 'expense',
        amount: 123.45,
        currency: 'USD',
        account_id: 'a1',
        category_id: 'c1',
        tags: [],
        fx_rate: 1.5,
        base_amount: 185.175
      };
      
      expect(typeof transaction.amount).toBe('number');
      expect(typeof transaction.fx_rate).toBe('number');
      expect(typeof transaction.base_amount).toBe('number');
    });

    it('validates array fields are arrays', () => {
      const transaction: Transaction = {
        id: 't1',
        user_id: 'u1',
        date: '2024-01-01',
        type: 'expense',
        amount: 100,
        currency: 'USD',
        account_id: 'a1',
        category_id: 'c1',
        tags: ['tag1', 'tag2', 'tag3'],
        fx_rate: 1,
        base_amount: 100
      };
      
      expect(Array.isArray(transaction.tags)).toBe(true);
      expect(transaction.tags).toHaveLength(3);
    });
  });
});