# Supabase Sync Verification Checklist

## Pre-flight Checks

### 1. Environment Setup
```bash
# Check .env.local exists and has correct values
cat .env.local | grep SUPABASE
```

Expected output:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

### 2. Database Migrations
Go to Supabase Dashboard → SQL Editor and verify these tables exist:
- ✅ `user_settings`
- ✅ `accounts`
- ✅ `categories`
- ✅ `transactions`
- ✅ `goals`
- ✅ `budgets`

### 3. RLS Policies
Run this query in Supabase SQL Editor:
```sql
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

Should see policies for all 6 tables.

### 4. Seed Function
Run this query:
```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'seed_user_data';
```

Should return `seed_user_data`.

## Testing Flow

### Test 1: New User Signup
1. Start app: `npm run dev`
2. Go to `/auth` (or wherever your auth page is)
3. Sign up with new email
4. **Expected**: Redirected to dashboard with sample data
5. **Verify in Supabase**: 
   - Check `accounts` table has 5 accounts for your user_id
   - Check `categories` table has categories
   - Check `transactions` table has sample transactions

### Test 2: Add Transaction
1. Click "Add Transaction"
2. Fill form and submit
3. **Expected**: Transaction appears immediately
4. **Verify in Supabase**: 
   ```sql
   SELECT * FROM transactions 
   WHERE user_id = 'your-user-id' 
   ORDER BY created_at DESC 
   LIMIT 1;
   ```

### Test 3: Data Persistence
1. Add a transaction
2. Refresh the page (F5)
3. **Expected**: Transaction still visible
4. **Verify**: Data loaded from Supabase, not localStorage

### Test 4: Update Transaction
1. Click edit on a transaction
2. Change amount
3. Submit
4. **Expected**: Updated immediately
5. **Verify in Supabase**: Amount changed in database

### Test 5: Delete Transaction
1. Delete a transaction
2. **Expected**: Removed from UI
3. **Verify in Supabase**: Row deleted from database

### Test 6: Multi-tab Sync
1. Open app in two browser tabs
2. Add transaction in tab 1
3. Refresh tab 2
4. **Expected**: New transaction appears in tab 2

## Browser Console Checks

Open DevTools Console and check for:

### ✅ Good Signs
```
Auth state change: SIGNED_IN user@example.com
```

### ❌ Bad Signs
```
Session error: ...
Load error: ...
Failed to fetch
```

## Common Issues

### Issue: "Data not saving"
**Check:**
```javascript
// In browser console
localStorage.getItem('demo-mode')
```
If returns `"true"`, you're in demo mode. Remove it:
```javascript
localStorage.removeItem('demo-mode')
```

### Issue: "No data after signup"
**Check:**
```javascript
// In browser console
localStorage.getItem('new-user')
```
Should be `null` after first load. If still `"true"`, seed didn't run.

**Fix:** Manually trigger seed:
```sql
-- In Supabase SQL Editor
SELECT seed_user_data('your-user-id-here');
```

### Issue: "RLS policy violation"
**Symptom:** Console shows "new row violates row-level security policy"

**Fix:** Verify you're authenticated:
```javascript
// In browser console
const { createClient } = await import('./src/lib/supabase/client.ts');
const supabase = createClient();
const { data } = await supabase.auth.getSession();
console.log(data.session?.user?.id);
```

Should print your user ID. If `undefined`, you're not logged in.

## Success Criteria

✅ New user signup creates sample data  
✅ Transactions save to Supabase  
✅ Data persists after page refresh  
✅ Updates sync to database  
✅ Deletes remove from database  
✅ No localStorage data (except theme/demo-mode)  
✅ Multiple tabs can access same data  

## Quick Debug Commands

```javascript
// Check store state
useAppStore.getState()

// Check user ID
useAppStore.getState().userId

// Check if loading
useAppStore.getState().isLoading

// Manually load data
await useAppStore.getState().loadData()

// Check Supabase connection
const supabase = createClient();
const { data, error } = await supabase.from('accounts').select('count');
console.log(data, error);
```
