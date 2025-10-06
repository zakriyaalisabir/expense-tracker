import { validateData, ValidationError, sanitizeString, sanitizeNumber } from '../middleware';
import { z } from 'zod';

describe('Validation Middleware', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
  });

  describe('validateData', () => {
    it('should validate correct data', () => {
      const validData = { name: 'John', age: 25 };
      const result = validateData(testSchema, validData);
      expect(result).toEqual(validData);
    });

    it('should throw ValidationError for invalid data', () => {
      const invalidData = { name: '', age: -5 };
      expect(() => validateData(testSchema, invalidData)).toThrow(ValidationError);
    });
  });

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeString('hello<script>alert()</script>')).toBe('helloscriptalert()/script');
    });
  });

  describe('sanitizeNumber', () => {
    it('should round to 2 decimal places', () => {
      expect(sanitizeNumber(10.999)).toBe(11);
      expect(sanitizeNumber(10.123)).toBe(10.12);
    });

    it('should throw for negative numbers', () => {
      expect(() => sanitizeNumber(-5)).toThrow('Invalid number');
    });

    it('should throw for invalid numbers', () => {
      expect(() => sanitizeNumber(NaN)).toThrow('Invalid number');
      expect(() => sanitizeNumber(Infinity)).toThrow('Invalid number');
    });
  });
});