import { transactionService, transactionRepository, accountRepository } from '../index';

describe('Services Index', () => {
  it('exports transaction service', () => {
    expect(transactionService).toBeDefined();
    expect(typeof transactionService.createTransaction).toBe('function');
    expect(typeof transactionService.getTransactionsByUser).toBe('function');
    expect(typeof transactionService.updateTransaction).toBe('function');
    expect(typeof transactionService.deleteTransaction).toBe('function');
  });

  it('exports repositories', () => {
    expect(transactionRepository).toBeDefined();
    expect(accountRepository).toBeDefined();
  });
});