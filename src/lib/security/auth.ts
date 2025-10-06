import { createClient } from '../supabase/client';

export async function validateUserAccess(userId: string, resourceUserId: string): Promise<boolean> {
  if (userId !== resourceUserId) {
    throw new Error('Unauthorized access to resource');
  }
  return true;
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user) {
    throw new Error('Authentication required');
  }
  
  return session.user;
}

export function rateLimitKey(userId: string, action: string): string {
  return `${userId}:${action}:${Math.floor(Date.now() / 60000)}`; // Per minute
}

// Simple in-memory rate limiting (use Redis in production)
const rateLimitStore = new Map<string, number>();

export function checkRateLimit(key: string, limit: number = 60): boolean {
  const current = rateLimitStore.get(key) || 0;
  if (current >= limit) {
    throw new Error('Rate limit exceeded');
  }
  rateLimitStore.set(key, current + 1);
  return true;
}