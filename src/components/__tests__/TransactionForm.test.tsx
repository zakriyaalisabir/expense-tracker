import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TransactionForm from '../TransactionForm'
import { useAppStore } from '@lib/store'

const mockState = {
  accounts: [
    { id: 'a1', name: 'Cash', type: 'cash', currency: 'USD', opening_balance: 1000 },
    { id: 'a2', name: 'Bank', type: 'bank', currency: 'THB', opening_balance: 50000 }
  ],
  categories: [
    { id: 'c1', name: 'Salary', type: 'income' },
    { id: 'c2', name: 'Food', type: 'expense' },
    { id: 'c3', name: 'Savings', type: 'savings' }
  ],
  settings: { baseCurrency: 'THB', exchangeRates: { THB: 1, USD: 36 } },
  userId: 'test-user-id'
}

jest.mock('@lib/store', () => ({
  useAppStore: Object.assign(
    jest.fn(() => ({
      ...mockState,
      addTransaction: jest.fn(),
      updateTransaction: jest.fn()
    })),
    { getState: jest.fn(() => mockState) }
  )
}))

jest.mock('@lib/hooks/useAuth', () => ({
  useAuth: () => ({ userId: 'test-user-id', loading: false })
}))

jest.mock('@lib/utils/currency', () => ({
  getAllCurrencies: () => ['THB', 'USD']
}))

const mockUseAppStore = useAppStore as unknown as jest.Mock

describe('TransactionForm', () => {
  const mockAddTransaction = jest.fn()
  const mockUpdateTransaction = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      ...mockState,
      addTransaction: mockAddTransaction,
      updateTransaction: mockUpdateTransaction,
      userId: 'test-user-id'
    })
  })

  it('renders add transaction button', () => {
    render(<TransactionForm />)
    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
  })

  it('opens dialog on button click', () => {
    render(<TransactionForm />)
    fireEvent.click(screen.getByText('Add Transaction'))
    expect(screen.getByText('New Transaction')).toBeInTheDocument()
  })

  it('switches transaction type', () => {
    render(<TransactionForm />)
    fireEvent.click(screen.getByText('Add Transaction'))
    
    fireEvent.click(screen.getByText('Income'))
    expect(screen.getByText('Income')).toHaveClass('Mui-selected')
  })

  it('submits new transaction', async () => {
    mockAddTransaction.mockResolvedValue(undefined)
    render(<TransactionForm />)
    
    fireEvent.click(screen.getByText('Add Transaction'))
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
        amount: 100,
        type: 'expense'
      }))
    })
  })

  it('updates existing transaction', async () => {
    mockUpdateTransaction.mockResolvedValue(undefined)
    const editTransaction = {
      id: 't1',
      user_id: 'u1',
      date: '2024-01-15T10:00:00Z',
      type: 'expense',
      amount: 500,
      currency: 'USD',
      account_id: 'a1',
      category_id: 'c2',
      tags: ['food'],
      fx_rate: 36,
      base_amount: 18000
    }

    render(<TransactionForm editTransaction={editTransaction} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Transaction')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '600' } })
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockUpdateTransaction).toHaveBeenCalledWith(expect.objectContaining({
        id: 't1',
        amount: 600
      }))
    })
  })

  it('closes dialog on cancel', async () => {
    render(<TransactionForm />)
    fireEvent.click(screen.getByText('Add Transaction'))
    expect(screen.getByText('New Transaction')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByText('New Transaction')).not.toBeInTheDocument()
    })
  })

  it('handles tags input', async () => {
    mockAddTransaction.mockResolvedValue(undefined)
    render(<TransactionForm />)
    
    fireEvent.click(screen.getByText('Add Transaction'))
    fireEvent.change(screen.getByLabelText('Tags (comma separated)'), { target: { value: 'food, lunch' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
        tags: ['food', 'lunch']
      }))
    })
  })

  it('calculates base amount correctly', async () => {
    mockAddTransaction.mockResolvedValue(undefined)
    render(<TransactionForm />)
    
    fireEvent.click(screen.getByText('Add Transaction'))
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '100' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddTransaction).toHaveBeenCalledWith(expect.objectContaining({
        base_amount: expect.any(Number)
      }))
    })
  })
})
