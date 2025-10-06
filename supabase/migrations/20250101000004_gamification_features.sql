-- Gamification & Motivation Features

-- Achievement Badges
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'budget_keeper', 'saver', 'goal_achiever', 'streak_master', 
    'first_transaction', 'first_budget', 'first_goal', 'big_saver',
    'consistent_tracker', 'expense_cutter', 'income_booster'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress NUMERIC(5,2) DEFAULT 100, -- Percentage completion
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spending Challenges
CREATE TABLE challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN (
    'monthly_savings', 'expense_reduction', 'budget_adherence', 
    'no_spend_days', 'category_limit', 'streak_challenge'
  )),
  target_amount NUMERIC(15,2),
  target_days INTEGER,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  current_progress NUMERIC(15,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  reward_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Financial Health Score Components
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- YYYY-MM format
  overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  budget_adherence_score INTEGER DEFAULT 0,
  savings_rate_score INTEGER DEFAULT 0,
  expense_consistency_score INTEGER DEFAULT 0,
  goal_progress_score INTEGER DEFAULT 0,
  debt_management_score INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- Streak Tracking
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN (
    'daily_tracking', 'budget_adherence', 'no_overspend', 
    'savings_goal', 'expense_logging', 'goal_contribution'
  )),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, streak_type)
);

-- Debt Tracking
CREATE TABLE debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  debt_type TEXT NOT NULL CHECK (debt_type IN (
    'credit_card', 'personal_loan', 'mortgage', 'student_loan', 
    'car_loan', 'business_loan', 'other'
  )),
  original_amount NUMERIC(15,2) NOT NULL,
  current_balance NUMERIC(15,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL, -- Annual percentage
  minimum_payment NUMERIC(15,2) NOT NULL,
  due_date INTEGER NOT NULL, -- Day of month (1-31)
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  target_payoff_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Portfolio
CREATE TABLE investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL, -- Stock symbol, crypto symbol, etc.
  name TEXT NOT NULL,
  investment_type TEXT NOT NULL CHECK (investment_type IN (
    'stock', 'bond', 'crypto', 'mutual_fund', 'etf', 'real_estate', 'commodity', 'other'
  )),
  quantity NUMERIC(15,6) NOT NULL,
  purchase_price NUMERIC(15,2) NOT NULL,
  current_price NUMERIC(15,2),
  purchase_date TIMESTAMPTZ NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Net Worth Assets & Liabilities
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'real_estate', 'vehicle', 'jewelry', 'art', 'collectibles', 
    'business_equity', 'other_assets'
  )),
  current_value NUMERIC(15,2) NOT NULL,
  purchase_value NUMERIC(15,2),
  purchase_date TIMESTAMPTZ,
  currency TEXT NOT NULL DEFAULT 'THB',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dashboard Widgets Configuration
CREATE TABLE dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'balance_summary', 'monthly_spending', 'budget_progress', 'goal_progress',
    'recent_transactions', 'spending_by_category', 'financial_health',
    'achievements', 'challenges', 'streaks', 'net_worth', 'investment_summary'
  )),
  position_x INTEGER NOT NULL DEFAULT 0,
  position_y INTEGER NOT NULL DEFAULT 0,
  width INTEGER NOT NULL DEFAULT 1,
  height INTEGER NOT NULL DEFAULT 1,
  is_visible BOOLEAN DEFAULT TRUE,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offline Sync Queue
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ,
  is_synced BOOLEAN DEFAULT FALSE
);

-- Indexes for performance
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_badge_type ON achievements(badge_type);
CREATE INDEX idx_challenges_user_id ON challenges(user_id);
CREATE INDEX idx_challenges_dates ON challenges(start_date, end_date);
CREATE INDEX idx_health_scores_user_month ON health_scores(user_id, month);
CREATE INDEX idx_streaks_user_type ON streaks(user_id, streak_type);
CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_assets_user_id ON assets(user_id);
CREATE INDEX idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX idx_sync_queue_user_synced ON sync_queue(user_id, is_synced);

-- Row Level Security
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own achievements" ON achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own challenges" ON challenges FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own health scores" ON health_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own streaks" ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own debts" ON debts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own investments" ON investments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own assets" ON assets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own dashboard widgets" ON dashboard_widgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sync queue" ON sync_queue FOR ALL USING (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streaks_updated_at BEFORE UPDATE ON streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();