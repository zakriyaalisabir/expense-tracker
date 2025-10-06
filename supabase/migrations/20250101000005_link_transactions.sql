-- Link transactions to debts and investments

-- Add foreign key columns to transactions
ALTER TABLE transactions ADD COLUMN debt_id UUID REFERENCES debts(id) ON DELETE SET NULL;
ALTER TABLE transactions ADD COLUMN investment_id UUID REFERENCES investments(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_transactions_debt_id ON transactions(debt_id);
CREATE INDEX idx_transactions_investment_id ON transactions(investment_id);

-- Add new transaction types for financial tracking
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_type_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_type_check 
  CHECK (type IN ('income', 'expense', 'savings', 'debt_payment', 'investment_buy', 'investment_sell'));

-- Function to auto-update debt balance when payment is made
CREATE OR REPLACE FUNCTION update_debt_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is a debt payment transaction
  IF NEW.type = 'debt_payment' AND NEW.debt_id IS NOT NULL THEN
    UPDATE debts 
    SET current_balance = current_balance - NEW.amount,
        updated_at = NOW()
    WHERE id = NEW.debt_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-update investment quantity when buy/sell
CREATE OR REPLACE FUNCTION update_investment_quantity()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is an investment transaction
  IF NEW.investment_id IS NOT NULL THEN
    IF NEW.type = 'investment_buy' THEN
      UPDATE investments 
      SET quantity = quantity + (NEW.amount / NEW.fx_rate),
          updated_at = NOW()
      WHERE id = NEW.investment_id;
    ELSIF NEW.type = 'investment_sell' THEN
      UPDATE investments 
      SET quantity = quantity - (NEW.amount / NEW.fx_rate),
          updated_at = NOW()
      WHERE id = NEW.investment_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update balances
CREATE TRIGGER trigger_update_debt_balance
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_debt_balance();

CREATE TRIGGER trigger_update_investment_quantity
  AFTER INSERT ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_investment_quantity();