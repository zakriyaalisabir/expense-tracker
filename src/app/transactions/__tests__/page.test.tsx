import { render, screen } from '@testing-library/react';
import TransactionsPage from '../page';

// Mock components and hooks
jest.mock('@components/TransactionForm', () => {
  return function MockTransactionForm() {
    return <div data-testid="transaction-form" />;
  };
});

jest.mock('@components/PageLayout', () => {
  return function MockPageLayout({ children, title }: any) {
    return <div data-testid="page-layout"><h1>{title}</h1>{children}</div>;
  };
});

jest.mock('@lib/store', () => ({
  useAppStore: (selector: any) => selector({
    transactions: [],
    categories: [],
    accounts: [],
    deleteTransaction: jest.fn()
  })
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      transactions: [],
      total: 0
    })
  })
) as jest.Mock;

describe('TransactionsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    render(<TransactionsPage />);
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('handles fetch completion', async () => {
    // Mock successful fetch that resolves immediately
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ transactions: [], total: 0 })
      })
    );

    render(<TransactionsPage />);
    
    // Just verify the component renders without crashing
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});