import { transactionSchema, accountSchema } from '../schemas';
import { validateData, ValidationError } from '../middleware';

describe('Validation Schemas', () => {
  describe('transactionSchema', () => {
    it('should validate valid transaction data', () => {
      const validData = {
        amount: 100,
        currency: 'USD',
        type: 'expense',
        account_id: 'acc1',
        category_id: 'cat1',
        date: new Date().toISOString(),
        tags: ['food', 'lunch'],
      };

      const result = validateData(transactionSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should reject negative amounts', () => {
      const invalidData = {
        amount: -100,
        currency: 'USD',
        type: 'expense',
        account_id: 'acc1',
        category_id: 'cat1',
        date: new Date().toISOString(),
      };

      expect(() => validateData(transactionSchema, invalidData)).toThrow();
    });

    it('should reject invalid currency', () => {
      const invalidData = {
        amount: 100,
        currency: 'INVALID',
        type: 'expense',
        account_id: 'acc1',
        category_id: 'cat1',
        date: new Date().toISOString(),
      };

      expect(() => validateData(transactionSchema, invalidData)).toThrow();
    });
  });

  describe('accountSchema', () => {
    it('should validate valid account data', () => {
      const validData = {
        name: 'My Bank Account',
        type: 'bank',
        currency: 'USD',
        opening_balance: 1000,
      };

      const result = validateData(accountSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should use default opening balance', () => {
      const data = {
        name: 'Cash',
        type: 'cash',
        currency: 'THB',
      };

      const result = validateData(accountSchema, data);
      expect(result.opening_balance).toBe(0);
    });
  });
});