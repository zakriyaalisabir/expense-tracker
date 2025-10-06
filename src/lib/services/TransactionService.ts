import { ITransactionRepository } from "../repositories/interfaces";
import { Transaction, CurrencyCode } from "../types";
import { toBase } from "../currency";
import { transactionSchema, CreateTransactionDto } from "../validation/schemas";
import { validateData, sanitizeNumber } from "../validation/middleware";

export class TransactionService {
  constructor(private repository: ITransactionRepository) {}

  async createTransaction(
    data: Omit<Transaction, "id" | "user_id" | "fx_rate" | "base_amount">,
    userId: string,
    baseCurrency: CurrencyCode,
    exchangeRates: Record<string, number>
  ): Promise<Transaction> {
    // Validate input data
    const validatedData = validateData(transactionSchema, {
      ...data,
      amount: sanitizeNumber(data.amount)
    });
    
    const fx_rate = exchangeRates[validatedData.currency] || 1;
    const base_amount = toBase(validatedData.amount, validatedData.currency, baseCurrency);
    
    return this.repository.create({
      ...validatedData,
      tags: validatedData.tags || [],
      fx_rate,
      base_amount
    }, userId);
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return this.repository.findByUserId(userId);
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    return this.repository.update(transaction);
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}