import { Goal } from '../types'
import { parseISO, addMonths } from 'date-fns'

jest.mock('../supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }))
}))

const mockTransactions = [
  { id: '1', user_id: 'u1', date: '2024-01-15T10:00:00Z', type: 'income', amount: 1000, currency: 'USD', account_id: 'a1', category_id: 'c1', tags: [], fx_rate: 36, base_amount: 36000 },
  { id: '2', user_id: 'u1', date: '2024-01-20T10:00:00Z', type: 'expense', amount: 500, currency: 'USD', account_id: 'a1', category_id: 'c2', tags: [], fx_rate: 36, base_amount: 18000 },
  { id: '3', user_id: 'u1', date: '2024-02-10T10:00:00Z', type: 'income', amount: 50000, currency: 'THB', account_id: 'a2', category_id: 'c1', tags: [], fx_rate: 1, base_amount: 50000 },
  { id: '4', user_id: 'u1', date: '2024-02-15T10:00:00Z', type: 'savings', amount: 200, currency: 'USD', account_id: 'a1', category_id: 'c3', tags: [], fx_rate: 36, base_amount: 7200 },
]

import * as storeModule from '../store'

const mockGetState = jest.fn(() => ({
  transactions: mockTransactions,
  settings: { baseCurrency: 'THB', exchangeRates: { THB: 1, USD: 36 } },
  accounts: [],
  categories: [],
  goals: [],
  budgets: [],
  isLoading: false,
  userId: null
}))

jest.spyOn(storeModule.useAppStore, 'getState').mockImplementation(mockGetState)

const { totalsForRange, totalsForRangeByCurrency, goalProgress, uid } = storeModule

describe('store utilities', () => {
  beforeEach(() => {
    mockGetState.mockReturnValue({
      transactions: mockTransactions
    })
  })
  describe('uid', () => {
    it('generates unique id with prefix', () => {
      const id1 = uid('test')
      const id2 = uid('test')
      expect(id1).toMatch(/^test_/)
      expect(id2).toMatch(/^test_/)
      expect(id1).not.toBe(id2)
    })
  })

  describe('totalsForRange', () => {
    it('calculates totals for date range', () => {
      const result = totalsForRange('2024-01-01', '2024-01-31')
      expect(result.income).toBe(36000)
      expect(result.expense).toBe(18000)
    })

    it('calculates totals without date range', () => {
      const result = totalsForRange()
      expect(result.income).toBe(86000)
      expect(result.expense).toBe(18000)
    })

    it('calculates savings percentage', () => {
      const result = totalsForRange('2024-01-01', '2024-01-31')
      expect(result.savingsPct).toBe(50)
    })

    it('handles zero income', () => {
      const result = totalsForRange('2024-03-01', '2024-03-31')
      expect(result.savingsPct).toBe(0)
    })
  })

  describe('totalsForRangeByCurrency', () => {
    it('calculates totals for specific currency', () => {
      const result = totalsForRangeByCurrency('2024-01-01', '2024-01-31', 'USD')
      expect(result.income).toBe(1000)
      expect(result.expense).toBe(500)
      expect(result.savings).toBe(500)
    })

    it('calculates totals for all currencies', () => {
      const result = totalsForRangeByCurrency('2024-01-01', '2024-02-28')
      expect(result.USD).toBeDefined()
      expect(result.THB).toBeDefined()
      expect(result.USD.income).toBe(1000)
      expect(result.THB.income).toBe(50000)
    })

    it('calculates savings percentage by currency', () => {
      const result = totalsForRangeByCurrency('2024-01-01', '2024-01-31', 'USD')
      expect(result.savingsPct).toBe(50)
    })
  })

  describe('goalProgress', () => {
    it('calculates progress percentage', () => {
      const goal: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Vacation',
        target_amount: 10000,
        target_date: addMonths(new Date(), 10).toISOString(),
        monthly_contribution: 1000,
        source_account_id: 'a1',
        progress_cached: 5000
      }
      const result = goalProgress(goal)
      expect(result.pct).toBe(50)
    })

    it('calculates needed monthly contribution', () => {
      const goal: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Vacation',
        target_amount: 10000,
        target_date: addMonths(new Date(), 10).toISOString(),
        monthly_contribution: 1000,
        source_account_id: 'a1',
        progress_cached: 5000
      }
      const result = goalProgress(goal)
      expect(result.neededMonthly).toBeGreaterThan(0)
    })

    it('caps progress at 100%', () => {
      const goal: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Vacation',
        target_amount: 10000,
        target_date: addMonths(new Date(), 10).toISOString(),
        monthly_contribution: 1000,
        source_account_id: 'a1',
        progress_cached: 15000
      }
      const result = goalProgress(goal)
      expect(result.pct).toBe(100)
    })

    it('handles zero progress', () => {
      const goal: Goal = {
        id: 'g1',
        user_id: 'u1',
        name: 'Vacation',
        target_amount: 10000,
        target_date: addMonths(new Date(), 10).toISOString(),
        monthly_contribution: 1000,
        source_account_id: 'a1',
        progress_cached: 0
      }
      const result = goalProgress(goal)
      expect(result.pct).toBe(0)
    })
  })
})
