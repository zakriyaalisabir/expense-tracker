import { toBase, groupByCurrency, totalsInCurrency, FX } from '../currency'
import { Transaction, CurrencyCode } from '../types'
import { useAppStore } from '../store'

jest.mock('../store', () => ({
  useAppStore: {
    getState: jest.fn(() => ({
      settings: { exchangeRates: { THB: 1, USD: 36, EUR: 39, JPY: 0.25 } }
    }))
  }
}))

describe('currency utilities', () => {
  describe('toBase', () => {
    it('converts USD to THB', () => {
      expect(toBase(100, 'USD', 'THB')).toBe(3600)
    })

    it('converts THB to USD', () => {
      expect(toBase(3600, 'THB', 'USD')).toBe(100)
    })

    it('converts EUR to JPY', () => {
      const result = toBase(100, 'EUR', 'JPY')
      expect(result).toBeCloseTo(15600, 0)
    })

    it('returns same value for same currency', () => {
      expect(toBase(100, 'THB', 'THB')).toBe(100)
    })
  })

  describe('groupByCurrency', () => {
    const mockTransactions: Transaction[] = [
      { id: '1', user_id: 'u1', date: '2024-01-01', type: 'income', amount: 1000, currency: 'USD', account_id: 'a1', category_id: 'c1', tags: [], fx_rate: 36, base_amount: 36000 },
      { id: '2', user_id: 'u1', date: '2024-01-02', type: 'expense', amount: 500, currency: 'USD', account_id: 'a1', category_id: 'c2', tags: [], fx_rate: 36, base_amount: 18000 },
      { id: '3', user_id: 'u1', date: '2024-01-03', type: 'income', amount: 50000, currency: 'THB', account_id: 'a2', category_id: 'c1', tags: [], fx_rate: 1, base_amount: 50000 },
      { id: '4', user_id: 'u1', date: '2024-01-04', type: 'savings', amount: 200, currency: 'USD', account_id: 'a1', category_id: 'c3', tags: [], fx_rate: 36, base_amount: 7200 },
    ]

    it('groups transactions by currency', () => {
      const result = groupByCurrency(mockTransactions)
      expect(result.USD).toBeDefined()
      expect(result.THB).toBeDefined()
    })

    it('calculates income correctly', () => {
      const result = groupByCurrency(mockTransactions)
      expect(result.USD.income).toBe(1000)
      expect(result.THB.income).toBe(50000)
    })

    it('calculates expense correctly', () => {
      const result = groupByCurrency(mockTransactions)
      expect(result.USD.expense).toBe(500)
    })

    it('calculates savings correctly', () => {
      const result = groupByCurrency(mockTransactions)
      expect(result.USD.savings).toBe(300)
    })

    it('uses cache for same transactions', () => {
      const result1 = groupByCurrency(mockTransactions)
      const result2 = groupByCurrency(mockTransactions)
      expect(result1).toBe(result2)
    })
  })

  describe('totalsInCurrency', () => {
    const mockTransactions: Transaction[] = [
      { id: '1', user_id: 'u1', date: '2024-01-01', type: 'income', amount: 1000, currency: 'USD', account_id: 'a1', category_id: 'c1', tags: [], fx_rate: 36, base_amount: 36000 },
      { id: '2', user_id: 'u1', date: '2024-01-02', type: 'expense', amount: 300, currency: 'USD', account_id: 'a1', category_id: 'c2', tags: [], fx_rate: 36, base_amount: 10800 },
      { id: '3', user_id: 'u1', date: '2024-01-03', type: 'savings', amount: 200, currency: 'USD', account_id: 'a1', category_id: 'c3', tags: [], fx_rate: 36, base_amount: 7200 },
    ]

    it('calculates totals for specific currency', () => {
      const result = totalsInCurrency(mockTransactions, 'USD')
      expect(result.income).toBe(1000)
      expect(result.expense).toBe(300)
      expect(result.saved).toBe(200)
      expect(result.savings).toBe(500)
    })

    it('calculates savings percentage', () => {
      const result = totalsInCurrency(mockTransactions, 'USD')
      expect(result.savingsPct).toBe(50)
    })

    it('returns zero for currency with no transactions', () => {
      const result = totalsInCurrency(mockTransactions, 'EUR')
      expect(result.income).toBe(0)
      expect(result.expense).toBe(0)
    })

    it('handles zero income', () => {
      const noIncome: Transaction[] = [
        { id: '1', user_id: 'u1', date: '2024-01-01', type: 'expense', amount: 100, currency: 'USD', account_id: 'a1', category_id: 'c1', tags: [], fx_rate: 36, base_amount: 3600 }
      ]
      const result = totalsInCurrency(noIncome, 'USD')
      expect(result.savingsPct).toBe(0)
    })
  })
})
