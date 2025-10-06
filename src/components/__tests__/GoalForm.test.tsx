import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import GoalForm from '../GoalForm'
import { useAppStore } from '@lib/store'

const mockState = {
  accounts: [
    { id: 'a1', name: 'Savings', type: 'savings', currency: 'USD', opening_balance: 5000 }
  ],
  userId: 'test-user-id'
}

jest.mock('@lib/store', () => ({
  useAppStore: Object.assign(
    jest.fn(() => ({
      ...mockState,
      addGoal: jest.fn(),
      updateGoal: jest.fn()
    })),
    { getState: jest.fn(() => mockState) }
  )
}))

const mockUseAppStore = useAppStore as unknown as jest.Mock

describe('GoalForm', () => {
  const mockAddGoal = jest.fn()
  const mockUpdateGoal = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      ...mockState,
      addGoal: mockAddGoal,
      updateGoal: mockUpdateGoal,
      userId: 'test-user-id'
    })
  })

  it('renders add goal button', () => {
    render(<GoalForm />)
    expect(screen.getByText('Add Goal')).toBeInTheDocument()
  })

  it('opens dialog on button click', () => {
    render(<GoalForm />)
    fireEvent.click(screen.getByText('Add Goal'))
    expect(screen.getByText('New Goal')).toBeInTheDocument()
  })

  it('submits new goal', async () => {
    mockAddGoal.mockResolvedValue(undefined)
    render(<GoalForm />)
    
    fireEvent.click(screen.getByText('Add Goal'))
    fireEvent.change(screen.getByLabelText('Goal Name'), { target: { value: 'Vacation' } })
    fireEvent.change(screen.getByLabelText('Target Amount'), { target: { value: '10000' } })
    fireEvent.change(screen.getByLabelText('Monthly Contribution'), { target: { value: '1000' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddGoal).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Vacation',
        target_amount: 10000,
        monthly_contribution: 1000
      }))
    })
  })

  it('updates existing goal', async () => {
    mockUpdateGoal.mockResolvedValue(undefined)
    const editGoal = {
      id: 'g1',
      user_id: 'u1',
      name: 'Vacation',
      target_amount: 10000,
      target_date: '2024-12-31',
      monthly_contribution: 1000,
      source_account_id: 'a1'
    }

    render(<GoalForm editGoal={editGoal} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Goal')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Target Amount'), { target: { value: '15000' } })
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockUpdateGoal).toHaveBeenCalledWith(expect.objectContaining({
        id: 'g1',
        target_amount: 15000
      }))
    })
  })

  it('validates target date', async () => {
    mockAddGoal.mockResolvedValue(undefined)
    render(<GoalForm />)
    
    fireEvent.click(screen.getByText('Add Goal'))
    
    await waitFor(() => {
      expect(screen.getByLabelText('Goal Name')).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText('Goal Name'), { target: { value: 'Test' } })
    fireEvent.change(screen.getByLabelText('Target Date'), { target: { value: '2024-12-31' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddGoal).toHaveBeenCalledWith(expect.objectContaining({
        target_date: expect.any(String)
      }))
    })
  })
})
