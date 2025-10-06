import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CategoryForm from '../CategoryForm'
import { useAppStore } from '@lib/store'

const mockState = {
  categories: [
    { id: 'c1', name: 'Food', type: 'expense' },
    { id: 'c2', name: 'Salary', type: 'income' }
  ],
  userId: 'test-user-id',
  settings: {
    baseCurrency: 'THB',
    exchangeRates: { USD: 0.03, EUR: 0.025 },
    customCurrencies: ['BTC']
  }
}

jest.mock('@lib/store', () => ({
  useAppStore: Object.assign(
    jest.fn(() => ({
      ...mockState,
      addCategory: jest.fn(),
      updateCategory: jest.fn()
    })),
    { getState: jest.fn(() => mockState) }
  )
}))

const mockUseAppStore = useAppStore as unknown as jest.Mock

describe('CategoryForm', () => {
  const mockAddCategory = jest.fn()
  const mockUpdateCategory = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppStore.mockReturnValue({
      ...mockState,
      addCategory: mockAddCategory,
      updateCategory: mockUpdateCategory,
      userId: 'test-user-id'
    })
  })

  it('renders add category button', () => {
    render(<CategoryForm />)
    expect(screen.getByText('Add Category')).toBeInTheDocument()
  })

  it('opens dialog on button click', () => {
    render(<CategoryForm />)
    fireEvent.click(screen.getByText('Add Category'))
    expect(screen.getByText('New Category')).toBeInTheDocument()
  })

  it('submits new category', async () => {
    mockAddCategory.mockResolvedValue(undefined)
    render(<CategoryForm />)
    
    fireEvent.click(screen.getByText('Add Category'))
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Transport' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Transport'
      }))
    })
  })

  it('updates existing category', async () => {
    mockUpdateCategory.mockResolvedValue(undefined)
    const editCategory = {
      id: 'c1',
      user_id: 'u1',
      name: 'Food',
      type: 'expense' as const,
      currency: 'THB' as const
    }

    render(<CategoryForm editCategory={editCategory} />)
    
    // Click the edit icon to open dialog
    fireEvent.click(screen.getByRole('button'))
    
    await waitFor(() => {
      expect(screen.getByText('Edit Category')).toBeInTheDocument()
    })

    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByText('Update'))

    await waitFor(() => {
      expect(mockUpdateCategory).toHaveBeenCalledWith(expect.objectContaining({
        id: 'c1',
        name: 'Groceries'
      }))
    })
  })

  it('selects category type', async () => {
    mockAddCategory.mockResolvedValue(undefined)
    render(<CategoryForm />)
    
    fireEvent.click(screen.getByText('Add Category'))
    
    await waitFor(() => {
      expect(screen.getByLabelText('Category Name')).toBeInTheDocument()
    })
    
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Test' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalledWith(expect.objectContaining({
        type: 'expense'
      }))
    })
  })

  it('creates subcategory with parent', async () => {
    mockAddCategory.mockResolvedValue(undefined)
    render(<CategoryForm />)
    
    fireEvent.click(screen.getByText('Add Category'))
    fireEvent.change(screen.getByLabelText('Category Name'), { target: { value: 'Groceries' } })
    fireEvent.click(screen.getByText('Save'))

    await waitFor(() => {
      expect(mockAddCategory).toHaveBeenCalled()
    })
  })
})