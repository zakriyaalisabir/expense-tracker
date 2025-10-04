# ⚡ Quick Start - Supabase Sync

## 1️⃣ Setup (5 minutes)

### Run Migrations
```bash
# Option A: Supabase CLI
supabase db push

# Option B: Manual (Supabase Dashboard → SQL Editor)
# Copy/paste each file in order:
# 1. supabase/migrations/20250101000000_initial_schema.sql
# 2. supabase/migrations/20250101000001_seed_data.sql
# 3. supabase/migrations/20250101000002_fix_trigger.sql
```

### Verify Environment
```bash
# Check .env.local has these:
cat .env.local
```
Should see:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 2️⃣ Test (2 minutes)

```bash
npm run dev
```

1. Go to `/auth` (or your auth page)
2. Sign up with new email
3. Should see dashboard with sample data
4. Add a transaction
5. Refresh page → data persists ✅

## 3️⃣ Verify in Supabase

Dashboard → Table Editor:
- `accounts` - Should have 5 rows
- `categories` - Should have ~15 rows
- `transactions` - Should have 5+ rows
- `goals` - Should have 1 row
- `budgets` - Should have 1 row

## 🆘 Troubleshooting

### Problem: No data after signup
**Solution:**
```sql
-- In Supabase SQL Editor
SELECT seed_user_data('paste-your-user-id-here');
```

### Problem: "RLS policy violation"
**Check:** Are you logged in?
```javascript
// Browser console
const { createClient } = await import('./src/lib/supabase/client.ts');
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log(data.session?.user?.id); // Should print user ID
```

### Problem: Data not saving
**Check:** Demo mode?
```javascript
// Browser console
localStorage.getItem('demo-mode') // Should be null
```

## 📖 Full Documentation

- **IMPLEMENTATION_SUMMARY.md** - What changed
- **SUPABASE_SYNC_COMPLETE.md** - Technical details
- **verify-supabase.md** - Complete testing guide

## ✅ Success Checklist

- [ ] Migrations ran successfully
- [ ] New user gets seed data
- [ ] Transactions save to Supabase
- [ ] Data persists after refresh
- [ ] Supabase tables show data

## 🎯 That's It!

Your app now saves everything to Supabase. All changes persist across sessions and devices.

**Need help?** Check the full docs above or open browser DevTools console for errors.
