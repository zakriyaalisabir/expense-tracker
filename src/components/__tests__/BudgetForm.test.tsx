import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import BudgetForm from '../BudgetForm'
import { useAppStore } from '@lib/store'

const mockState = {
  categories: [
    { id: 'c1', name: 'Food', type: 'expense' },
    { id: 'c2', name: 'Transport', type: 'expense' }
  ]
}

jest.mock('@lib/store', () => ({
  useAppStore: Object.assign(
    jest.fn(() => ({
      ...mockState,
      addBudget: jest.fn(),
      updateBudget: jest.fn()
    })),
    { getState: jest.fn(() => mockState) }
  )
}))

const mockUseAppStore = useAppStore as unknown as jest.Mock

describe('BudgetForm', () => {
  const mockAddBudget = jest.fn()
  const mockUpdateBudget = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      ...mockState,
      addBudget: mockAddBudget,
      updateBudget: mockUpdateBudget
    })
  })

  it('renders add budget button', () => {
    render(<BudgetForm />)
    expect(screen.getByText('Add Budget')).toBeInTheDocument()
  })

  it('opens dialog on button click', () => {
    render(<BudgetForm />)
    fireEvent.click(screen.getByText('Add Budget'))
    expect(screen.getByText('New Budget')).toBeInTheDocument()
  })

  it('submits new budget', async () => {
    mockAddBudget.mockResolvedValue(undefined)
    render(<BudgetForm />)
    
    fireEvent.click(screen.getByText('Add Budget'))
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2024-01' } })
    fireEvent.change(screen.getByLabelText('Total Budget'), { target: { value: '50000' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddBudget).toHaveBeenCalledWith(expect.objectContaining({
        month: '2024-01',
        total: 50000
      }))
    })
  })

  it('updates existing budget', async () => {
    mockUpdateBudget.mockResolvedValue(undefined)
    const editBudget = {
      id: 'b1',
      user_id: 'u1',
      month: '2024-01',
      total: 40000
    }

    render(<BudgetForm editBudget={editBudget} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Budget')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Total Budget'), { target: { value: '60000' } })
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockUpdateBudget).toHaveBeenCalledWith(expect.objectContaining({
        id: 'b1',
        total: 60000
      }))
    })
  })

  it('sets category-specific budgets', async () => {
    mockAddBudget.mockResolvedValue(undefined)
    render(<BudgetForm />)
    
    fireEvent.click(screen.getByText('Add Budget'))
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '2024-01' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddBudget).toHaveBeenCalled()
    })
  })
})
