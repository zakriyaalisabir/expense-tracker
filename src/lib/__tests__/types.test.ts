import { Account, Category, Transaction, Goal, Budget, BaseSettings, AccountType, CurrencyCode, CategoryType } from '../types'

describe('Type definitions', () => {
  describe('Account', () => {
    it('creates valid account', () => {
      const account: Account = {
        id: 'a1',
        user_id: 'u1',
        name: 'Cash',
        type: 'cash',
        currency: 'USD',
        opening_balance: 1000
      }
      expect(account.type).toBe('cash')
      expect(account.currency).toBe('USD')
    })

    it('supports all account types', () => {
      const types: AccountType[] = ['cash', 'bank', 'credit', 'ewallet', 'savings']
      types.forEach(type => {
        const account: Account = {
          id: 'a1',
          user_id: 'u1',
          name: 'Test',
          type,
          currency: 'USD',
          opening_balance: 0
        }
        expect(account.type).toBe(type)
      })
    })
  })

  describe('Category', () => {
    it('creates valid category', () => {
      const category: Category = {
        id: 'c1',
        user_id: 'u1',
        name: 'Food',
        type: 'expense'
      }
      expect(category.type).toBe('expense')
    })

    it('supports parent_id for subcategories', () => {
      const subcategory: Category = {
        id: 'c2',
        user_id: 'u1',
        name: 'Groceries',
        type: 'expense',
        parent_id: 'c1'
      }
      expect(subcategory.parent_id).toBe('c1')
    })

    it('supports all category types', () => {
      const types: CategoryType[] = ['income', 'expense', 'savings']
      types.forEach(type => {
        const category: Category = {
          id: 'c1',
          user_id: 'u1',
          name: 'Test',
          type
        }
        expect(category.type).toBe(type)
      })
    })
  })

  describe('Transaction', () => {
    it('creates valid transaction', () => {
      const transaction: Transaction = {
        id: 't1',
        user_id: 'u1',
        date: '2024-01-15T10:00:00Z',
        type: 'expense',
        amount: 100,
        currency: 'USD',
        account_id: 'a1',
        category_id: 'c1',
        tags: ['food'],
        fx_rate: 36,
        base_amount: 3600
      }
      expect(transaction.amount).toBe(100)
      expect(transaction.tags).toHaveLength(1)
    })

    it('supports optional fields', () => {
      const transaction: Transaction = {
        id: 't1',
        user_id: 'u1',
        date: '2024-01-15T10:00:00Z',
        type: 'expense',
        amount: 100,
        currency: 'USD',
        account_id: 'a1',
        category_id: 'c1',
        tags: [],
        fx_rate: 36,
        base_amount: 3600,
        subcategory_id: 'c2',
        description: 'Lunch'
      }
      expect(transaction.subcategory_id).toBe('c2')
      expect(transaction.description).toBe('Lunch')
    })
  })

  describe('Goal', () => {
    it('creates valid goal', () => {
      const goal: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Vacation',
        target_amount: 10000,
        target_date: '2024-12-31',
        monthly_contribution: 1000,
        source_account_id: 'a1'
      }
      expect(goal.target_amount).toBe(10000)
    })

    it('supports progress_cached', () => {
      const goal: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Vacation',
        target_amount: 10000,
        target_date: '2024-12-31',
        monthly_contribution: 1000,
        source_account_id: 'a1',
        progress_cached: 5000
      }
      expect(goal.progress_cached).toBe(5000)
    })
  })

  describe('Budget', () => {
    it('creates valid budget', () => {
      const budget: Budget = {
        id: 'b1',
        user_id: 'u1',
        month: '2024-01'
      }
      expect(budget.month).toBe('2024-01')
    })

    it('supports total and byCategory', () => {
      const budget: Budget = {
        id: 'b1',
        user_id: 'u1',
        month: '2024-01',
        total: 50000,
        byCategory: {
          'c1': 20000,
          'c2': 30000
        }
      }
      expect(budget.total).toBe(50000)
      expect(budget.byCategory?.['c1']).toBe(20000)
    })
  })

  describe('BaseSettings', () => {
    it('creates valid settings', () => {
      const settings: BaseSettings = {
        baseCurrency: 'THB'
      }
      expect(settings.baseCurrency).toBe('THB')
    })

    it('supports all currencies', () => {
      const currencies: CurrencyCode[] = ['THB', 'USD', 'EUR', 'JPY']
      currencies.forEach(currency => {
        const settings: BaseSettings = {
          baseCurrency: currency
        }
        expect(settings.baseCurrency).toBe(currency)
      })
    })

    it('supports exchange rates and custom currencies', () => {
      const settings: BaseSettings = {
        baseCurrency: 'THB',
        exchangeRates: { THB: 1, USD: 36, EUR: 39, JPY: 0.25 },
        customCurrencies: ['GBP', 'AUD']
      }
      expect(settings.exchangeRates?.USD).toBe(36)
      expect(settings.customCurrencies).toHaveLength(2)
    })
  })
})
