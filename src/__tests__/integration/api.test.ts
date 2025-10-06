import { createClient } from '@supabase/supabase-js';
import { transactionService } from '../../lib/services';

// Mock Supabase client for integration tests
jest.mock('../../lib/supabase/client', () => ({
  createClient: jest.fn(),
}));

const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(),
      })),
    })),
    select: jest.fn(() => ({
      eq: jest.fn(),
    })),
    update: jest.fn(() => ({
      eq: jest.fn(),
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(),
    })),
  })),
};

(createClient as jest.Mock).mockReturnValue(mockSupabase);

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

      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

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

      expect(mockSupabase.from).toHaveBeenCalledWith('transactions');
      expect(result).toEqual(mockTransaction);
    });

    it('should handle database errors', async () => {
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      });

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
      ).rejects.toThrow('Failed to create transaction: Database error');
    });
  });
});