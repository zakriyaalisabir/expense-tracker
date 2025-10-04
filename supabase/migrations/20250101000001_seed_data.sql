-- Function to seed initial data for new users
CREATE OR REPLACE FUNCTION seed_user_data(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_acc_cash UUID;
  v_acc_bank UUID;
  v_acc_credit UUID;
  v_acc_wise UUID;
  v_acc_savings UUID;
  v_cat_salary UUID;
  v_cat_food UUID;
  v_cat_rent UUID;
  v_cat_shopping UUID;
  v_cat_emergency UUID;
BEGIN
  -- Insert accounts
  INSERT INTO accounts (id, user_id, name, type, currency, opening_balance) VALUES
    (uuid_generate_v4(), p_user_id, 'Cash', 'cash', 'THB', 3000) RETURNING id INTO v_acc_cash;
  INSERT INTO accounts (id, user_id, name, type, currency, opening_balance) VALUES
    (uuid_generate_v4(), p_user_id, 'KBank', 'bank', 'THB', 25000) RETURNING id INTO v_acc_bank;
  INSERT INTO accounts (id, user_id, name, type, currency, opening_balance) VALUES
    (uuid_generate_v4(), p_user_id, 'VISA', 'credit', 'THB', -12000) RETURNING id INTO v_acc_credit;
  INSERT INTO accounts (id, user_id, name, type, currency, opening_balance) VALUES
    (uuid_generate_v4(), p_user_id, 'Wise USD', 'bank', 'USD', 500) RETURNING id INTO v_acc_wise;
  INSERT INTO accounts (id, user_id, name, type, currency, opening_balance) VALUES
    (uuid_generate_v4(), p_user_id, 'Savings Account', 'savings', 'THB', 50000) RETURNING id INTO v_acc_savings;

  -- Insert categories
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Salary', 'income') RETURNING id INTO v_cat_salary;
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Bonus', 'income');
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Food', 'expense') RETURNING id INTO v_cat_food;
  INSERT INTO categories (id, user_id, name, type, parent_id) VALUES
    (uuid_generate_v4(), p_user_id, 'Lunch', 'expense', v_cat_food);
  INSERT INTO categories (id, user_id, name, type, parent_id) VALUES
    (uuid_generate_v4(), p_user_id, 'Dinner', 'expense', v_cat_food);
  INSERT INTO categories (id, user_id, name, type, parent_id) VALUES
    (uuid_generate_v4(), p_user_id, 'Groceries', 'expense', v_cat_food);
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Rent', 'expense') RETURNING id INTO v_cat_rent;
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Transport', 'expense');
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Health', 'expense');
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Shopping', 'expense') RETURNING id INTO v_cat_shopping;
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Emergency Fund', 'savings') RETURNING id INTO v_cat_emergency;
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Investment', 'savings');
  INSERT INTO categories (id, user_id, name, type) VALUES
    (uuid_generate_v4(), p_user_id, 'Retirement', 'savings');

  -- Insert sample transactions
  INSERT INTO transactions (user_id, date, type, amount, currency, account_id, category_id, tags, description, fx_rate, base_amount) VALUES
    (p_user_id, NOW(), 'income', 60000, 'THB', v_acc_bank, v_cat_salary, ARRAY['monthly'], 'Salary', 1, 60000);
  INSERT INTO transactions (user_id, date, type, amount, currency, account_id, category_id, tags, description, fx_rate, base_amount) VALUES
    (p_user_id, NOW(), 'expense', 350, 'THB', v_acc_cash, v_cat_food, ARRAY['lunch'], 'Pad Krapow', 1, 350);
  INSERT INTO transactions (user_id, date, type, amount, currency, account_id, category_id, tags, description, fx_rate, base_amount) VALUES
    (p_user_id, NOW(), 'expense', 15000, 'THB', v_acc_bank, v_cat_rent, ARRAY['condo'], 'Monthly rent', 1, 15000);
  INSERT INTO transactions (user_id, date, type, amount, currency, account_id, category_id, tags, description, fx_rate, base_amount) VALUES
    (p_user_id, NOW(), 'expense', 20, 'USD', v_acc_wise, v_cat_shopping, ARRAY['online'], 'Domain', 36, 720);
  INSERT INTO transactions (user_id, date, type, amount, currency, account_id, category_id, tags, description, fx_rate, base_amount) VALUES
    (p_user_id, NOW(), 'savings', 10000, 'THB', v_acc_savings, v_cat_emergency, ARRAY['monthly'], 'Emergency fund', 1, 10000);

  -- Insert sample goal
  INSERT INTO goals (user_id, name, target_amount, target_date, monthly_contribution, source_account_id, progress_cached) VALUES
    (p_user_id, 'Buy a Car', 500000, (NOW() + INTERVAL '12 months')::DATE, 10000, v_acc_bank, 60000);

  -- Insert sample budget
  INSERT INTO budgets (user_id, month, total, by_category) VALUES
    (p_user_id, TO_CHAR(NOW(), 'YYYY-MM'), 30000, jsonb_build_object(v_cat_food::text, 5000, v_cat_shopping::text, 8000));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
