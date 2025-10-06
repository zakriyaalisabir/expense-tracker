import { createClient } from '../server';

// Mock @supabase/ssr
const mockCreateServerClient = jest.fn();
jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: any[]) => mockCreateServerClient(...args)
}));

// Mock next/headers
const mockCookies = {
  getAll: jest.fn(),
  set: jest.fn()
};
jest.mock('next/headers', () => ({
  cookies: () => Promise.resolve(mockCookies)
}));

describe('supabase server', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';
  });

  it('creates server client with cookies', async () => {
    const mockClient = { from: jest.fn() };
    mockCreateServerClient.mockReturnValue(mockClient);
    mockCookies.getAll.mockReturnValue([]);

    const client = await createClient();

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
    expect(client).toBe(mockClient);
  });

  it('handles cookie operations', async () => {
    const mockClient = { from: jest.fn() };
    mockCreateServerClient.mockReturnValue(mockClient);
    mockCookies.getAll.mockReturnValue([{ name: 'test', value: 'value' }]);

    await createClient();

    const cookiesConfig = mockCreateServerClient.mock.calls[0][2];
    
    // Test getAll
    const cookies = cookiesConfig.cookies.getAll();
    expect(cookies).toEqual([{ name: 'test', value: 'value' }]);

    // Test setAll
    cookiesConfig.cookies.setAll([
      { name: 'new-cookie', value: 'new-value', options: {} }
    ]);
    expect(mockCookies.set).toHaveBeenCalledWith('new-cookie', 'new-value', {});
  });
});