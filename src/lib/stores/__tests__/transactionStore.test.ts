import { useTransactionStore } from '../transactionStore';
import { transactionService } from '../../services';
import { logger } from '../../logger';

// Mock dependencies
jest.mock('../../services', () => ({
  transactionService: {
    getTransactionsByUser: jest.fn(),
    createTransaction: jest.fn(),
    updateTransaction: jest.fn(),
    deleteTransaction: jest.fn()
  }
}));

jest.mock('../../logger', () => ({
  logger: {
    error: jest.fn()
  }
}));

const mockTransactionService = transactionService as jest.Mocked<typeof transactionService>;
const mockLogger = logger as jest.Mocked<typeof logger>;

describe('transactionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useTransactionStore.setState({
      transactions: [],
      isLoading: false,
      error: null
    });
  });

  describe('loadTransactions', () => {
    it('loads transactions successfully', async () => {
      const mockTransactions = [
        { id: '1', amount: 100, type: 'expense', currency: 'USD', date: '2024-01-01' }
      ];
      mockTransactionService.getTransactionsByUser.mockResolvedValue(mockTransactions as any);

      await useTransactionStore.getState().loadTransactions('user123');

      expect(useTransactionStore.getState().transactions).toEqual(mockTransactions);
      expect(useTransactionStore.getState().isLoading).toBe(false);
      expect(useTransactionStore.getState().error).toBe(null);
    });

    it('handles load error', async () => {
      mockTransactionService.getTransactionsByUser.mockRejectedValue(new Error('Load failed'));

      await useTransactionStore.getState().loadTransactions('user123');

      expect(useTransactionStore.getState().error).toBe('Load failed');
      expect(useTransactionStore.getState().isLoading).toBe(false);
    });
  });

  describe('addTransaction', () => {
    it('adds transaction successfully', async () => {
      const newTransaction = { id: '2', amount: 200, type: 'income', currency: 'USD', date: '2024-01-02' };
      mockTransactionService.createTransaction.mockResolvedValue(newTransaction as any);

      await useTransactionStore.getState().addTransaction(
        { amount: 200, type: 'income', currency: 'USD', date: '2024-01-02' } as any,
        'user123',
        'USD',
        { USD: 1 }
      );

      expect(useTransactionStore.getState().transactions).toContain(newTransaction);
    });

    it('handles add error', async () => {
      mockTransactionService.createTransaction.mockRejectedValue(new Error('Add failed'));

      await useTransactionStore.getState().addTransaction(
        { amount: 200, type: 'income', currency: 'USD', date: '2024-01-02' } as any,
        'user123',
        'USD',
        { USD: 1 }
      );

      expect(mockLogger.error).toHaveBeenCalled();
      expect(useTransactionStore.getState().error).toBe('Add failed');
    });
  });

  describe('updateTransaction', () => {
    it('updates transaction successfully', async () => {
      const existingTransaction = { id: '1', amount: 100, type: 'expense', currency: 'USD', date: '2024-01-01' };
      useTransactionStore.setState({ transactions: [existingTransaction as any] });
      
      const updatedTransaction = { ...existingTransaction, amount: 150 };
      mockTransactionService.updateTransaction.mockResolvedValue(undefined);

      await useTransactionStore.getState().updateTransaction(updatedTransaction as any);

      expect(useTransactionStore.getState().transactions[0].amount).toBe(150);
    });

    it('handles update error', async () => {
      mockTransactionService.updateTransaction.mockRejectedValue(new Error('Update failed'));

      await useTransactionStore.getState().updateTransaction({ id: '1' } as any);

      expect(useTransactionStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteTransaction', () => {
    it('deletes transaction successfully', async () => {
      const transaction = { id: '1', amount: 100, type: 'expense', currency: 'USD', date: '2024-01-01' };
      useTransactionStore.setState({ transactions: [transaction as any] });
      
      mockTransactionService.deleteTransaction.mockResolvedValue(undefined);

      await useTransactionStore.getState().deleteTransaction('1');

      expect(useTransactionStore.getState().transactions).toHaveLength(0);
    });

    it('handles delete error', async () => {
      mockTransactionService.deleteTransaction.mockRejectedValue(new Error('Delete failed'));

      await useTransactionStore.getState().deleteTransaction('1');

      expect(useTransactionStore.getState().error).toBe('Delete failed');
    });
  });

  describe('utility functions', () => {
    it('clears error', () => {
      useTransactionStore.setState({ error: 'Some error' });
      
      useTransactionStore.getState().clearError();
      
      expect(useTransactionStore.getState().error).toBe(null);
    });

    it('resets store', () => {
      useTransactionStore.setState({
        transactions: [{ id: '1' } as any],
        isLoading: true,
        error: 'Some error'
      });
      
      useTransactionStore.getState().reset();
      
      expect(useTransactionStore.getState().transactions).toEqual([]);
      expect(useTransactionStore.getState().isLoading).toBe(false);
      expect(useTransactionStore.getState().error).toBe(null);
    });
  });
});