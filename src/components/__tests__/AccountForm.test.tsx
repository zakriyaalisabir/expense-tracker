import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountForm from '../AccountForm'
import { useAppStore } from '@lib/store'

const mockState = {
  settings: { baseCurrency: 'THB' }
}

jest.mock('@lib/store', () => ({
  useAppStore: Object.assign(
    jest.fn(() => ({
      ...mockState,
      addAccount: jest.fn(),
      updateAccount: jest.fn()
    })),
    { getState: jest.fn(() => mockState) }
  )
}))

const mockUseAppStore = useAppStore as unknown as jest.Mock

describe('AccountForm', () => {
  const mockAddAccount = jest.fn()
  const mockUpdateAccount = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      ...mockState,
      addAccount: mockAddAccount,
      updateAccount: mockUpdateAccount
    })
  })

  it('renders add account button', () => {
    render(<AccountForm />)
    expect(screen.getByText('Add Account')).toBeInTheDocument()
  })

  it('opens dialog on button click', () => {
    render(<AccountForm />)
    fireEvent.click(screen.getByText('Add Account'))
    expect(screen.getByText('New Account')).toBeInTheDocument()
  })

  it('submits new account', async () => {
    mockAddAccount.mockResolvedValue(undefined)
    render(<AccountForm />)
    
    fireEvent.click(screen.getByText('Add Account'))
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'My Wallet' } })
    fireEvent.change(screen.getByLabelText('Opening Balance'), { target: { value: '1000' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddAccount).toHaveBeenCalledWith(expect.objectContaining({
        name: 'My Wallet',
        opening_balance: 1000
      }))
    })
  })

  it('updates existing account', async () => {
    mockUpdateAccount.mockResolvedValue(undefined)
    const editAccount = {
      id: 'a1',
      user_id: 'u1',
      name: 'Cash',
      type: 'cash',
      currency: 'USD',
      opening_balance: 500
    }

    render(<AccountForm editAccount={editAccount} />)
    
    await waitFor(() => {
      expect(screen.getByText('Edit Account')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Updated Cash' } })
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockUpdateAccount).toHaveBeenCalledWith(expect.objectContaining({
        id: 'a1',
        name: 'Updated Cash'
      }))
    })
  })

  it('selects account type', async () => {
    mockAddAccount.mockResolvedValue(undefined)
    render(<AccountForm />)
    
    fireEvent.click(screen.getByText('Add Account'))
    
    await waitFor(() => {
      expect(screen.getByLabelText('Account Name')).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText('Account Name'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddAccount).toHaveBeenCalledWith(expect.objectContaining({
        type: 'bank'
      }))
    })
  })

  it('closes dialog on cancel', async () => {
    render(<AccountForm />)
    fireEvent.click(screen.getByText('Add Account'))
    expect(screen.getByText('New Account')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Cancel'))
    await waitFor(() => {
      expect(screen.queryByText('New Account')).not.toBeInTheDocument()
    })
  })
})
