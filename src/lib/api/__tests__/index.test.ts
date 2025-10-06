import { accountsApi, transactionsApi, categoriesApi, budgetsApi, goalsApi } from '../index';

describe('API Index', () => {
  it('exports all API modules', () => {
    expect(accountsApi).toBeDefined();
    expect(transactionsApi).toBeDefined();
    expect(categoriesApi).toBeDefined();
    expect(budgetsApi).toBeDefined();
    expect(goalsApi).toBeDefined();
    
    expect(typeof accountsApi.getAll).toBe('function');
    expect(typeof transactionsApi.getAll).toBe('function');
    expect(typeof categoriesApi.getAll).toBe('function');
    expect(typeof budgetsApi.getAll).toBe('function');
    expect(typeof goalsApi.getAll).toBe('function');
  });
});