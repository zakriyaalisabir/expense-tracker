import { accountsApi } from '../accounts';
import { useAppStore } from '../../store';

// Mock store
const mockStore = {
  accounts: [],
  addAccount: jest.fn(),
  updateAccount: jest.fn(),
  deleteAccount: jest.fn()
};

jest.mock('../../store', () => ({
  useAppStore: {
    getState: () => mockStore
  }
}));

// Mock Supabase
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      order: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
      }))
    })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: {}, error: null }))
        }))
      }))
    })),
    delete: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ error: null }))
    }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({ data: { user: { id: 'user123' } } }))
  }
};

jest.mock('../../supabase/client', () => ({
  createClient: () => mockSupabase
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('accountsApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('demo mode', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('true');
    });

    it('gets all accounts from store', async () => {
      const mockAccounts = [{ id: '1', name: 'Test Account' }];
      mockStore.accounts = mockAccounts as any;

      const result = await accountsApi.getAll();

      expect(result).toEqual(mockAccounts);
    });

    it('creates account via store', async () => {
      const newAccount = { name: 'New Account', type: 'cash', currency: 'USD', balance: 100 };
      
      await accountsApi.create(newAccount as any);

      expect(mockStore.addAccount).toHaveBeenCalledWith(newAccount);
    });

    it('updates account via store', async () => {
      const account = { id: '1', name: 'Updated Account', type: 'cash', currency: 'USD', balance: 200 };
      
      await accountsApi.update(account as any);

      expect(mockStore.updateAccount).toHaveBeenCalledWith(account);
    });

    it('deletes account via store', async () => {
      await accountsApi.delete('1');

      expect(mockStore.deleteAccount).toHaveBeenCalledWith('1');
    });
  });

  describe('real mode', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('calls supabase for getAll', async () => {
      await accountsApi.getAll();
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
    });

    it('calls supabase for create', async () => {
      await accountsApi.create({ name: 'Test', type: 'cash', currency: 'USD', balance: 100 } as any);
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
    });

    it('calls supabase for update', async () => {
      await accountsApi.update({ id: '1', name: 'Test', type: 'cash', currency: 'USD', balance: 100 } as any);
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
    });

    it('calls supabase for delete', async () => {
      await accountsApi.delete('1');
      expect(mockSupabase.from).toHaveBeenCalledWith('accounts');
    });
  });
});