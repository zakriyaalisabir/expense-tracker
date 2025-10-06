import { render, waitFor } from '@testing-library/react';
import { useAppStore } from '@lib/store';
import StoreProvider from '../StoreProvider';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({
      data: { subscription: { unsubscribe: jest.fn() } }
    }))
  },
  rpc: jest.fn()
};

jest.mock('@lib/supabase/client', () => ({
  createClient: () => mockSupabase
}));

// Mock store
const mockStore = {
  setUserId: jest.fn(),
  loadData: jest.fn()
};

jest.mock('@lib/store', () => ({
  useAppStore: {
    getState: () => mockStore
  }
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  removeItem: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('StoreProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children', () => {
    const { getByText } = render(
      <StoreProvider>
        <div>Test Child</div>
      </StoreProvider>
    );
    expect(getByText('Test Child')).toBeInTheDocument();
  });

  it('handles demo mode', async () => {
    mockLocalStorage.getItem.mockReturnValue('true');
    
    render(
      <StoreProvider>
        <div>Test</div>
      </StoreProvider>
    );

    await waitFor(() => {
      expect(mockStore.setUserId).toHaveBeenCalledWith('demo');
    });
  });

  it('handles authenticated user', async () => {
    mockLocalStorage.getItem.mockReturnValue(null);
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'user123' } } }
    });

    render(
      <StoreProvider>
        <div>Test</div>
      </StoreProvider>
    );

    await waitFor(() => {
      expect(mockStore.setUserId).toHaveBeenCalledWith('user123');
      expect(mockStore.loadData).toHaveBeenCalled();
    });
  });

  it('handles new user seeding', async () => {
    mockLocalStorage.getItem
      .mockReturnValueOnce(null) // demo-mode
      .mockReturnValueOnce('true'); // new-user
    
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: { id: 'newuser123' } } }
    });
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

    render(
      <StoreProvider>
        <div>Test</div>
      </StoreProvider>
    );

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith('seed_user_data', { p_user_id: 'newuser123' });
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('new-user');
    });
  });

  it('handles auth state changes', async () => {
    let authCallback: any;
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    render(
      <StoreProvider>
        <div>Test</div>
      </StoreProvider>
    );

    // Simulate auth state change
    authCallback('SIGNED_IN', { user: { id: 'newuser456' } });

    expect(mockStore.setUserId).toHaveBeenCalledWith('newuser456');
  });

  it('handles errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    mockSupabase.auth.getSession.mockRejectedValue(new Error('Auth error'));

    render(
      <StoreProvider>
        <div>Test</div>
      </StoreProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Store initialization error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});