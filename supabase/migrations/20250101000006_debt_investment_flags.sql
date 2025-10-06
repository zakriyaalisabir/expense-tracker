-- Update transaction linking to use flags instead of new types

-- Remove the previous type constraint and restore original
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('income', 'expense', 'savings'));

-- Add boolean flags for debt and investment tracking
ALTER TABLE transactions ADD COLUMN is_debt_payment BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN is_investment BOOLEAN DEFAULT FALSE;

-- Update the trigger functions to use flags instead of types
CREATE OR REPLACE FUNCTION update_debt_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a debt payment (expense with debt_id)
  IF NEW.type = 'expense' AND NEW.is_debt_payment = TRUE AND NEW.debt_id IS NOT NULL THEN
    UPDATE debts 
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.debt_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_investment_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an investment transaction (savings with investment_id)
  IF NEW.type = 'savings' AND NEW.is_investment = TRUE AND NEW.investment_id IS NOT NULL THEN
    -- For savings (investment buy), increase quantity
    UPDATE investments 
    SET quantity = quantity + (NEW.amount / COALESCE(NEW.fx_rate, 1)),
        updated_at = NOW()
    WHERE id = NEW.investment_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;