import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BudgetForm from '../BudgetForm';

// Mock the store
const mockAddBudget = jest.fn();
const mockUpdateBudget = jest.fn();
const mockClearError = jest.fn();

jest.mock('@lib/store', () => ({
  useAppStore: () => ({
    addBudget: mockAddBudget,
    updateBudget: mockUpdateBudget,
    clearError: mockClearError,
    categories: [
      { id: 'cat1', name: 'Food', type: 'expense', parent_id: null },
      { id: 'cat2', name: 'Transport', type: 'expense', parent_id: null },
    ],
    error: null,
  }),
  uid: jest.fn(() => 'test-id'),
}));

describe('BudgetForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render add budget button', () => {
    render(<BudgetForm />);
    expect(screen.getByText('Add Budget')).toBeInTheDocument();
  });

  it('should open dialog when button clicked', async () => {
    const user = userEvent.setup();
    render(<BudgetForm />);
    
    await user.click(screen.getByText('Add Budget'));
    
    expect(screen.getByText('New Budget')).toBeInTheDocument();
  });

  it('should submit new budget', async () => {
    const user = userEvent.setup();
    render(<BudgetForm />);
    
    await user.click(screen.getByText('Add Budget'));
    
    // Fill form
    const monthInput = screen.getByLabelText('Month');
    const totalInput = screen.getByLabelText('Total Budget');
    
    await user.clear(monthInput);
    await user.type(monthInput, '2024-01');
    await user.clear(totalInput);
    await user.type(totalInput, '5000');
    
    // Submit
    await user.click(screen.getByText('Save'));
    
    await waitFor(() => {
      expect(mockAddBudget).toHaveBeenCalledWith({
        month: '2024-01',
        total: 5000,
        byCategory: {},
      });
    });
  });

  it('should populate form when editing', () => {
    const editBudget = {
      id: 'budget1',
      user_id: 'user1',
      month: '2024-01',
      total: 3000,
      byCategory: { cat1: 1000 },
    };
    
    render(<BudgetForm editBudget={editBudget} />);
    
    expect(screen.getByText('Edit Budget')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2024-01')).toBeInTheDocument();
    expect(screen.getByDisplayValue('3000')).toBeInTheDocument();
  });

  it('should add category budget', async () => {
    const user = userEvent.setup();
    render(<BudgetForm />);
    
    await user.click(screen.getByText('Add Budget'));
    await user.click(screen.getByText('Add Category'));
    
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });
});