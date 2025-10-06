import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  currency: z.enum(['THB', 'USD', 'EUR', 'JPY']),
  type: z.enum(['income', 'expense', 'savings']),
  account_id: z.string().min(1, 'Account is required'),
  category_id: z.string().min(1, 'Category is required'),
  subcategory_id: z.string().optional(),
  date: z.string().datetime(),
  description: z.string().max(500, 'Description too long').optional(),
  tags: z.array(z.string()).max(10, 'Too many tags').optional(),
});

export const accountSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  type: z.enum(['cash', 'bank', 'credit', 'ewallet', 'savings']),
  currency: z.enum(['THB', 'USD', 'EUR', 'JPY']),
  opening_balance: z.number().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  type: z.enum(['income', 'expense', 'savings']),
  parent_id: z.string().optional(),
});

export const budgetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Invalid month format'),
  total: z.number().positive('Total must be positive').optional(),
  byCategory: z.record(z.string(), z.number().positive()).optional(),
});

export const goalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  target_amount: z.number().positive('Target amount must be positive'),
  target_date: z.string().datetime(),
  monthly_contribution: z.number().min(0, 'Contribution cannot be negative'),
  source_account_id: z.string().min(1, 'Source account is required'),
});

export type CreateTransactionDto = z.infer<typeof transactionSchema>;
export type CreateAccountDto = z.infer<typeof accountSchema>;
export type CreateCategoryDto = z.infer<typeof categorySchema>;
export type CreateBudgetDto = z.infer<typeof budgetSchema>;
export type CreateGoalDto = z.infer<typeof goalSchema>;