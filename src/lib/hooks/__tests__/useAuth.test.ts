import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

// Mock Supabase client
const mockSupabase = {
  auth: {
    getSession: jest.fn(),
    onAuthStateChange: jest.fn()
  }
};

jest.mock('../../supabase/client', () => ({
  createClient: () => mockSupabase
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with loading state', () => {
    mockSupabase.auth.getSession.mockReturnValue(Promise.resolve({ data: { session: null } }));
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.userId).toBe(null);
  });

  it('sets user ID from session', async () => {
    const mockSession = { user: { id: 'user123' } };
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: mockSession } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    const { result } = renderHook(() => useAuth());

    // Wait for async effect to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.userId).toBe('user123');
    expect(result.current.loading).toBe(false);
  });

  it('handles null session', async () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: jest.fn() } }
    });

    const { result } = renderHook(() => useAuth());

    // Wait for async effect to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(result.current.userId).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('handles auth state changes', async () => {
    let authCallback: any;
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    });

    const { result } = renderHook(() => useAuth());

    // Wait for initial effect
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Simulate auth state change
    const newSession = { user: { id: 'newuser456' } };
    await act(async () => {
      authCallback('SIGNED_IN', newSession);
    });

    expect(result.current.userId).toBe('newuser456');
    expect(result.current.loading).toBe(false);
  });

  it('unsubscribes on unmount', () => {
    const mockUnsubscribe = jest.fn();
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    });

    const { unmount } = renderHook(() => useAuth());

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});