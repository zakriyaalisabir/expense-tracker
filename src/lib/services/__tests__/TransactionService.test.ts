import { TransactionService } from '../TransactionService';
import { ITransactionRepository } from '../../repositories/interfaces';
import { Transaction } from '../../types';

const mockRepository: jest.Mocked<ITransactionRepository> = {
  create: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TransactionService', () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService(mockRepository);
    jest.clearAllMocks();
  });

  describe('createTransaction', () => {
    it('should validate and create transaction with currency conversion', async () => {
      const mockTransaction = { id: '1', user_id: 'user1' } as Transaction;
      mockRepository.create.mockResolvedValue(mockTransaction);

      const data = {
        amount: 100,
        currency: 'USD' as const,
        type: 'expense' as const,
        account_id: 'acc1',
        category_id: 'cat1',
        date: new Date().toISOString(),
        tags: [],
      };

      const result = await service.createTransaction(
        data,
        'user1',
        'THB',
        { USD: 36, THB: 1 }
      );

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...data,
          fx_rate: 36,
          base_amount: 3600,
        }),
        'user1'
      );
      expect(result).toBe(mockTransaction);
    });

    it('should throw validation error for invalid data', async () => {
      const invalidData = {
        amount: -100, // Invalid negative amount
        currency: 'USD' as const,
        type: 'expense' as const,
        account_id: '',
        category_id: '',
        date: 'invalid-date',
        tags: [],
      };

      await expect(
        service.createTransaction(invalidData, 'user1', 'THB', {})
      ).rejects.toThrow();
    });
  });

  describe('getTransactionsByUser', () => {
    it('should return user transactions', async () => {
      const mockTransactions = [{ id: '1' }, { id: '2' }] as Transaction[];
      mockRepository.findByUserId.mockResolvedValue(mockTransactions);

      const result = await service.getTransactionsByUser('user1');

      expect(mockRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toBe(mockTransactions);
    });
  });
});