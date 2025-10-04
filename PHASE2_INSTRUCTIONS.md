# Phase 2: Database Schema - Setup Instructions

## Apply Database Schema

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/20250101000000_initial_schema.sql`
4. Click **Run**
5. Copy and paste the contents of `supabase/migrations/20250101000001_seed_data.sql`
6. Click **Run**

### Option 2: Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## Verify Schema

In Supabase Dashboard > Table Editor, you should see:
- ✅ user_settings
- ✅ accounts
- ✅ categories
- ✅ transactions
- ✅ goals
- ✅ budgets

## Test RLS Policies

1. Sign up a new user at `/auth`
2. Check that `user_settings` row is auto-created
3. Verify you can only see your own data

## Seed Initial Data (Optional)

To manually seed data for a user:
```sql
SELECT seed_user_data('user-uuid-here');
```

## Phase 2 Complete ✅
- ✅ Database tables created
- ✅ Row Level Security enabled
- ✅ Indexes for performance
- ✅ Auto-create user settings on signup
- ✅ Seed data function

## Next: Phase 3 - API Layer
