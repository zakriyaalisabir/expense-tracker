import { 
  SupabaseTransactionRepository, 
  SupabaseAccountRepository, 
  SupabaseCategoryRepository,
  SupabaseBudgetRepository,
  SupabaseGoalRepository 
} from "../repositories/supabase";
import { TransactionService } from "./TransactionService";

// Repository instances
export const transactionRepository = new SupabaseTransactionRepository();
export const accountRepository = new SupabaseAccountRepository();
export const categoryRepository = new SupabaseCategoryRepository();
export const budgetRepository = new SupabaseBudgetRepository();
export const goalRepository = new SupabaseGoalRepository();

// Service instances
export const transactionService = new TransactionService(transactionRepository);