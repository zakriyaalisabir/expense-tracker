import { renderHook, act } from '@testing-library/react';
import { useTransactionStore } from '../transactionStore';

// Mock the transaction service
jest.mock('../../services', () => ({
  transactionService: {
    createTransaction: jest.fn(),
    getTransactionsByUser: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
  },
}));

const mockTransactionService = require('../../services').transactionService;

describe('useTransactionStore', () => {
  beforeEach(() => {
    // Reset store state
    useTransactionStore.getState().reset();
    jest.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useTransactionStore());
    
    expect(result.current.transactions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should load transactions successfully', async () => {
    const mockTransactions = [
      { id: '1', amount: 100, type: 'expense' },
      { id: '2', amount: 200, type: 'income' },
    ];
    
    mockTransactionService.getTransactionsByUser.mockResolvedValue(mockTransactions);
    
    const { result } = renderHook(() => useTransactionStore());
    
    await act(async () => {
      await result.current.loadTransactions('user1');
    });
    
    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle load error', async () => {
    const error = new Error('Load failed');
    mockTransactionService.getTransactionsByUser.mockRejectedValue(error);
    
    const { result } = renderHook(() => useTransactionStore());
    
    await act(async () => {
      await result.current.loadTransactions('user1');
    });
    
    expect(result.current.transactions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Load failed');
  });

  it('should add transaction successfully', async () => {
    const newTransaction = { id: '1', amount: 100, type: 'expense' };
    mockTransactionService.createTransaction.mockResolvedValue(newTransaction);
    
    const { result } = renderHook(() => useTransactionStore());
    
    await act(async () => {
      await result.current.addTransaction(
        { amount: 100, type: 'expense' } as any,
        'user1',
        'THB',
        {}
      );
    });
    
    expect(result.current.transactions).toContain(newTransaction);
    expect(result.current.error).toBe(null);
  });
});