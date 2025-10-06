import { createBrowserClient } from '@supabase/ssr';
import { config } from '../config';

export const createClient = () => {
  const url = config.supabase.url || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = config.supabase.anonKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  if (!url || !key) {
    console.warn('Supabase credentials missing, creating mock client');
    return null as any;
  }
  
  return createBrowserClient(url, key);
};
