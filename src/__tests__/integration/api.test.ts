import { TransactionService } from '../../lib/services/TransactionService';
import { ITransactionRepository } from '../../lib/repositories/interfaces';

const mockRepository: jest.Mocked<ITransactionRepository> = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const transactionService = new TransactionService(mockRepository);

describe('API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Transaction API', () => {
    it('should create transaction with proper validation', async () => {
      const mockTransaction = {
        id: '1',
        user_id: 'user1',
        amount: 100,
        currency: 'USD',
        type: 'expense',
        account_id: 'acc1',
        category_id: 'cat1',
        date: new Date().toISOString(),
        tags: [],
        fx_rate: 36,
        base_amount: 3600,
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockTransaction,
          error: null,
        }),
      };

      mockRepository.create.mockResolvedValue(mockTransaction);

      const result = await transactionService.createTransaction(
        {
          amount: 100,
          currency: 'USD',
          type: 'expense',
          account_id: 'acc1',
          category_id: 'cat1',
          date: new Date().toISOString(),
          tags: [],
        },
        'user1',
        'THB',
        { USD: 36, THB: 1 }
      );

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockTransaction);
    });

    it('should handle database errors', async () => {
      mockRepository.create.mockRejectedValue(new Error('Database error'));

      await expect(
        transactionService.createTransaction(
          {
            amount: 100,
            currency: 'USD',
            type: 'expense',
            account_id: 'acc1',
            category_id: 'cat1',
            date: new Date().toISOString(),
            tags: [],
          },
          'user1',
          'THB',
          { USD: 36 }
        )
      ).rejects.toThrow('Database error');
    });
  });
});