# Supabase Migration Guide - Phase 1: Auth ✅

## Setup Instructions

### 1. Create Supabase Project
1. Go to https://supabase.com
2. Create a new project
3. Copy your project URL and anon key

### 2. Configure Environment
Update `.env.local` with your credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Enable OAuth Providers (Optional)
In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Google:
   - Add Google Client ID and Secret
   - Add redirect URL: `https://your-project.supabase.co/auth/v1/callback`
3. Enable GitHub:
   - Add GitHub Client ID and Secret
   - Add callback URL: `https://your-project.supabase.co/auth/v1/callback`

### 4. Test Authentication
```bash
npm run dev
```
Visit http://localhost:3000/auth to test:
- Email/password sign up/in
- Google OAuth
- GitHub OAuth
- Demo mode (no auth)

## Phase 1 Complete ✅
- ✅ Supabase client setup (browser + server)
- ✅ Auth context provider
- ✅ Middleware for session management
- ✅ Email/password authentication
- ✅ Google & GitHub OAuth
- ✅ Demo mode (localStorage only)
- ✅ Auto-seed data for new users
- ✅ Replaced NextAuth with Supabase Auth

## Next: Phase 2 - Database Schema
