import { createClient } from "../supabase/client";
import { ITransactionRepository, IAccountRepository, ICategoryRepository, IBudgetRepository, IGoalRepository } from "./interfaces";
import { Account, Category, Transaction, Goal, Budget } from "../types";
import { validateUserAccess, checkRateLimit, rateLimitKey } from "../security/auth";

export class SupabaseTransactionRepository implements ITransactionRepository {
  private client = createClient();

  async create(transaction: Omit<Transaction, "id" | "user_id">, userId: string): Promise<Transaction> {
    checkRateLimit(rateLimitKey(userId, 'create_transaction'), 30);
    
    const { data, error } = await this.client
      .from("transactions")
      .insert({ ...transaction, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(`Failed to create transaction: ${error.message}`);
    return data;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const { data, error } = await this.client
      .from("transactions")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`);
    return data || [];
  }

  async update(transaction: Transaction): Promise<void> {
    await validateUserAccess(transaction.user_id, transaction.user_id);
    
    const { error } = await this.client
      .from("transactions")
      .update(transaction)
      .eq("id", transaction.id);
    if (error) throw new Error(`Failed to update transaction: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("transactions")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}

export class SupabaseAccountRepository implements IAccountRepository {
  private client = createClient();

  async create(account: Omit<Account, "id" | "user_id">, userId: string): Promise<Account> {
    const { data, error } = await this.client
      .from("accounts")
      .insert({ ...account, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(`Failed to create account: ${error.message}`);
    return data;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const { data, error } = await this.client
      .from("accounts")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to fetch accounts: ${error.message}`);
    return data || [];
  }

  async update(account: Account): Promise<void> {
    const { error } = await this.client
      .from("accounts")
      .update(account)
      .eq("id", account.id);
    if (error) throw new Error(`Failed to update account: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("accounts")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`Failed to delete account: ${error.message}`);
  }
}

export class SupabaseCategoryRepository implements ICategoryRepository {
  private client = createClient();

  async create(category: Omit<Category, "id" | "user_id">, userId: string): Promise<Category> {
    const { data, error } = await this.client
      .from("categories")
      .insert({ ...category, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(`Failed to create category: ${error.message}`);
    return data;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const { data, error } = await this.client
      .from("categories")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to fetch categories: ${error.message}`);
    return data || [];
  }

  async update(category: Category): Promise<void> {
    const { error } = await this.client
      .from("categories")
      .update(category)
      .eq("id", category.id);
    if (error) throw new Error(`Failed to update category: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("categories")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`Failed to delete category: ${error.message}`);
  }
}

export class SupabaseBudgetRepository implements IBudgetRepository {
  private client = createClient();

  async create(budget: Omit<Budget, "id" | "user_id">, userId: string): Promise<Budget> {
    const { byCategory, ...rest } = budget;
    const payload = { ...rest, by_category: byCategory, user_id: userId };
    const { data, error } = await this.client
      .from("budgets")
      .insert(payload)
      .select()
      .single();
    if (error) throw new Error(`Failed to create budget: ${error.message}`);
    return { ...data, byCategory: data.by_category };
  }

  async findByUserId(userId: string): Promise<Budget[]> {
    const { data, error } = await this.client
      .from("budgets")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to fetch budgets: ${error.message}`);
    return (data || []).map((b: any) => ({ ...b, byCategory: b.by_category }));
  }

  async update(budget: Budget): Promise<void> {
    const { byCategory, id, user_id: _userId, ...rest } = budget;
    const payload = { ...rest, by_category: byCategory };
    const { error } = await this.client
      .from("budgets")
      .update(payload)
      .eq("id", id);
    if (error) throw new Error(`Failed to update budget: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("budgets")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`Failed to delete budget: ${error.message}`);
  }
}

export class SupabaseGoalRepository implements IGoalRepository {
  private client = createClient();

  async create(goal: Omit<Goal, "id" | "user_id">, userId: string): Promise<Goal> {
    const { data, error } = await this.client
      .from("goals")
      .insert({ ...goal, user_id: userId })
      .select()
      .single();
    if (error) throw new Error(`Failed to create goal: ${error.message}`);
    return data;
  }

  async findByUserId(userId: string): Promise<Goal[]> {
    const { data, error } = await this.client
      .from("goals")
      .select("*")
      .eq("user_id", userId);
    if (error) throw new Error(`Failed to fetch goals: ${error.message}`);
    return data || [];
  }

  async update(goal: Goal): Promise<void> {
    const { error } = await this.client
      .from("goals")
      .update(goal)
      .eq("id", goal.id);
    if (error) throw new Error(`Failed to update goal: ${error.message}`);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from("goals")
      .delete()
      .eq("id", id);
    if (error) throw new Error(`Failed to delete goal: ${error.message}`);
  }
}