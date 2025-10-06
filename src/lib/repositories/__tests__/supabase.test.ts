import { SupabaseTransactionRepository, SupabaseAccountRepository } from '../supabase';

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  }))
};

jest.mock('../../supabase/client', () => ({
  createClient: () => mockSupabase
}));

jest.mock('../../security/auth', () => ({
  validateUserAccess: jest.fn(),
  checkRateLimit: jest.fn(),
  rateLimitKey: jest.fn(() => 'test-key')
}));

describe('Supabase Repositories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SupabaseTransactionRepository', () => {
    const repo = new SupabaseTransactionRepository();

    it('creates transaction', async () => {
      const mockTransaction = { id: 't1', user_id: 'u1', amount: 100 };
      const mockChain = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockTransaction, error: null }))
          }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repo.create({ amount: 100 } as any, 'u1');

      expect(result).toEqual(mockTransaction);
      expect(mockSupabase.from).toHaveBeenCalledWith('transactions');
    });

    it('handles create error', async () => {
      const mockChain = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Insert failed' } }))
          }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(repo.create({ amount: 100 } as any, 'u1'))
        .rejects.toThrow('Failed to create transaction: Insert failed');
    });

    it('finds transactions by user ID', async () => {
      const mockTransactions = [{ id: 't1', user_id: 'u1' }];
      const mockEq = jest.fn(() => Promise.resolve({ data: mockTransactions, error: null }));
      const mockSelect = jest.fn(() => ({ eq: mockEq }));
      const mockChain = { select: mockSelect };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repo.findByUserId('u1');

      expect(result).toEqual(mockTransactions);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'u1');
    });

    it('updates transaction', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ error: null }));
      const mockUpdate = jest.fn(() => ({ eq: mockEq }));
      const mockChain = { update: mockUpdate };
      mockSupabase.from.mockReturnValue(mockChain);

      await repo.update({ id: 't1', user_id: 'u1' } as any);

      expect(mockUpdate).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 't1');
    });

    it('deletes transaction', async () => {
      const mockEq = jest.fn(() => Promise.resolve({ error: null }));
      const mockDelete = jest.fn(() => ({ eq: mockEq }));
      const mockChain = { delete: mockDelete };
      mockSupabase.from.mockReturnValue(mockChain);

      await repo.delete('t1');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 't1');
    });
  });

  describe('SupabaseAccountRepository', () => {
    const repo = new SupabaseAccountRepository();

    it('creates account', async () => {
      const mockAccount = { id: 'a1', user_id: 'u1', name: 'Test' };
      const mockChain = {
        insert: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => Promise.resolve({ data: mockAccount, error: null }))
          }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repo.create({ name: 'Test' } as any, 'u1');

      expect(result).toEqual(mockAccount);
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
    });

    it('finds accounts by user ID', async () => {
      const mockAccounts = [{ id: 'a1', user_id: 'u1' }];
      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: mockAccounts, error: null }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repo.findByUserId('u1');

      expect(result).toEqual(mockAccounts);
    });

    it('handles null data', async () => {
      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockChain);

      const result = await repo.findByUserId('u1');

      expect(result).toEqual([]);
    });

    it('handles fetch error', async () => {
      const mockChain = {
        select: jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Fetch failed' } }))
        }))
      };
      mockSupabase.from.mockReturnValue(mockChain);

      await expect(repo.findByUserId('u1'))
        .rejects.toThrow('Failed to fetch accounts: Fetch failed');
    });
  });
});