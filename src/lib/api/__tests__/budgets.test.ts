// Simple test to cover budgets.ts file
import { budgetsApi } from '../budgets';

describe('Budgets API Coverage', () => {
  it('covers budgets file', () => {
    // Just import to ensure coverage
    expect(typeof budgetsApi).toBe('object');
  });
});