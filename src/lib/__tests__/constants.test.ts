import {
  THEME_MODE_KEY,
  STORAGE_KEY,
  THEME_MODE,
  COLORS,
  BORDER_RADIUS,
  ELEVATION,
  LOADING_DELAY,
  FADE_TIMEOUT,
  DRAWER_WIDTH,
  MOBILE_BREAKPOINT,
  ROUTES,
  TABS,
  CURRENCIES,
  ACCOUNT_TYPES,
  CATEGORY_TYPES,
  TRANSACTION_TYPES
} from '../constants'

describe('constants', () => {
  it('defines storage keys', () => {
    expect(THEME_MODE_KEY).toBe('theme-mode')
    expect(STORAGE_KEY).toBe('expense-tracker-v1')
  })

  it('defines theme modes', () => {
    expect(THEME_MODE.LIGHT).toBe('light')
    expect(THEME_MODE.DARK).toBe('dark')
  })

  it('defines colors', () => {
    expect(COLORS.SUCCESS).toBe('#2e7d32')
    expect(COLORS.ERROR).toBe('#c62828')
  })

  it('defines UI constants', () => {
    expect(BORDER_RADIUS).toBe(16)
    expect(ELEVATION).toBe(2)
    expect(LOADING_DELAY).toBe(300)
    expect(FADE_TIMEOUT).toBe(500)
    expect(DRAWER_WIDTH).toBe(250)
    expect(MOBILE_BREAKPOINT).toBe('(max-width:900px)')
  })

  it('defines all routes', () => {
    expect(ROUTES.HOME).toBe('/home')
    expect(ROUTES.DASHBOARD).toBe('/dashboard')
    expect(ROUTES.TRANSACTIONS).toBe('/transactions')
    expect(ROUTES.CATEGORIES).toBe('/categories')
    expect(ROUTES.ACCOUNTS).toBe('/accounts')
    expect(ROUTES.BUDGETS).toBe('/budgets')
    expect(ROUTES.GOALS).toBe('/goals')
    expect(ROUTES.REPORTS).toBe('/reports')
    expect(ROUTES.SETTINGS).toBe('/settings')
  })

  it('defines tabs with correct structure', () => {
    expect(TABS).toHaveLength(9)
    TABS.forEach(tab => {
      expect(tab).toHaveProperty('label')
      expect(tab).toHaveProperty('href')
      expect(tab).toHaveProperty('icon')
    })
  })

  it('defines supported currencies', () => {
    expect(CURRENCIES).toEqual(['THB', 'USD', 'EUR', 'JPY'])
  })

  it('defines account types', () => {
    expect(ACCOUNT_TYPES).toEqual(['cash', 'bank', 'credit', 'ewallet', 'savings'])
  })

  it('defines category types', () => {
    expect(CATEGORY_TYPES).toEqual(['income', 'expense', 'savings'])
  })

  it('defines transaction types', () => {
    expect(TRANSACTION_TYPES).toEqual(['income', 'expense', 'savings'])
  })
})
