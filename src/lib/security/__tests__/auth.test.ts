import { validateUserAccess, checkRateLimit, rateLimitKey } from '../auth';

describe('Security', () => {
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
    beforeEach(() => {
      // Clear rate limit store between tests
      jest.clearAllMocks();
    });

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