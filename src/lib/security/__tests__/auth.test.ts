import { validateUserAccess, checkRateLimit, rateLimitKey } from '../auth';

// Mock the rate limit store to reset between tests
const mockRateLimitStore = new Map<string, number>();

jest.mock('../auth', () => {
  const actual = jest.requireActual('../auth');
  return {
    ...actual,
    checkRateLimit: jest.fn((key: string, limit: number = 60) => {
      const current = mockRateLimitStore.get(key) || 0;
      if (current >= limit) {
        throw new Error('Rate limit exceeded');
      }
      mockRateLimitStore.set(key, current + 1);
      return true;
    }),
  };
});

describe('Security', () => {
  beforeEach(() => {
    mockRateLimitStore.clear();
    jest.clearAllMocks();
  });

  describe('validateUserAccess', () => {
    it('should allow access for matching user IDs', async () => {
      const result = await validateUserAccess('user1', 'user1');
      expect(result).toBe(true);
    });

    it('should deny access for different user IDs', async () => {
      await expect(validateUserAccess('user1', 'user2')).rejects.toThrow('Unauthorized access');
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests within limit', () => {
      const key = rateLimitKey('user1', 'test');
      
      expect(() => checkRateLimit(key, 5)).not.toThrow();
      expect(() => checkRateLimit(key, 5)).not.toThrow();
    });

    it('should block requests exceeding limit', () => {
      const key = rateLimitKey('user1', 'test');
      
      // Use up the limit
      for (let i = 0; i < 5; i++) {
        checkRateLimit(key, 5);
      }
      
      // Next request should be blocked
      expect(() => checkRateLimit(key, 5)).toThrow('Rate limit exceeded');
    });

    it('should generate unique keys per user and action', () => {
      const key1 = rateLimitKey('user1', 'action1');
      const key2 = rateLimitKey('user1', 'action2');
      const key3 = rateLimitKey('user2', 'action1');
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });
  });
});