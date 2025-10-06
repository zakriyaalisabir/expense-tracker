import { updateSession } from '../middleware';
import { NextRequest, NextResponse } from 'next/server';

// Mock @supabase/ssr
const mockSupabase = {
  auth: {
    getUser: jest.fn()
  }
};
const mockCreateServerClient = jest.fn(() => mockSupabase);
jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args)
}));

// Mock NextResponse
const mockNextResponse = {
  cookies: {
    set: jest.fn()
  }
};
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn(() => mockNextResponse)
  }
}));

describe('supabase middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  it('updates session and returns response', async () => {
    const mockRequest = {
      cookies: {
        getAll: jest.fn(() => []),
        set: jest.fn()
      }
    } as unknown as NextRequest;

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(mockRequest);

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function)
        })
      })
    );
    expect(mockSupabase.auth.getUser).toHaveBeenCalled();
    expect(response).toBe(mockNextResponse);
  });

  it('handles cookie operations in middleware', async () => {
    const mockRequest = {
      cookies: {
        getAll: jest.fn(() => [{ name: 'session', value: 'token' }]),
        set: jest.fn()
      }
    } as unknown as NextRequest;

    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user123' } } });

    await updateSession(mockRequest);

    const cookiesConfig = mockCreateServerClient.mock.calls[0][2];
    
    // Test getAll
    const cookies = cookiesConfig.cookies.getAll();
    expect(cookies).toEqual([{ name: 'session', value: 'token' }]);

    // Test setAll
    cookiesConfig.cookies.setAll([
      { name: 'auth-token', value: 'new-token', options: { httpOnly: true } }
    ]);
    
    expect(mockRequest.cookies.set).toHaveBeenCalledWith('auth-token', 'new-token');
    expect(mockNextResponse.cookies.set).toHaveBeenCalledWith('auth-token', 'new-token', { httpOnly: true });
  });
});