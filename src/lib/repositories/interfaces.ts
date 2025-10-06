import { Account, Category, Transaction, Goal, Budget } from "../types";

export interface ITransactionRepository {
  create(transaction: Omit<Transaction, "id" | "user_id">, userId: string): Promise<Transaction>;
  findByUserId(userId: string): Promise<Transaction[]>;
  update(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IAccountRepository {
  create(account: Omit<Account, "id" | "user_id">, userId: string): Promise<Account>;
  findByUserId(userId: string): Promise<Account[]>;
  update(account: Account): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ICategoryRepository {
  create(category: Omit<Category, "id" | "user_id">, userId: string): Promise<Category>;
  findByUserId(userId: string): Promise<Category[]>;
  update(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IBudgetRepository {
  create(budget: Omit<Budget, "id" | "user_id">, userId: string): Promise<Budget>;
  findByUserId(userId: string): Promise<Budget[]>;
  update(budget: Budget): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IGoalRepository {
  create(goal: Omit<Goal, "id" | "user_id">, userId: string): Promise<Goal>;
  findByUserId(userId: string): Promise<Goal[]>;
  update(goal: Goal): Promise<void>;
  delete(id: string): Promise<void>;
}