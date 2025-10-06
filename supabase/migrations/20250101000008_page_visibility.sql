-- Add page visibility settings to user_settings

ALTER TABLE user_settings ADD COLUMN visible_pages JSONB DEFAULT '{
  "gamification": false,
  "financial": false,
  "dashboard_custom": false,
  "home": true,
  "dashboard": true,
  "transactions": true,
  "accounts": true,
  "budgets": true,
  "goals": true,
  "reports": true,
  "settings": true
}'::jsonb;