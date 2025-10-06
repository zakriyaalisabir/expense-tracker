"use client";
import { createClient } from "@lib/supabase/client";
import { User, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { useAppStore } from "@lib/store";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === 'true';

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    const demoModeLocal = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';
    const demoModeCookie = typeof document !== 'undefined' && document.cookie.includes('demo-mode=true');
    if (demoEnabled && (demoModeLocal || demoModeCookie)) {
      setUser({ id: 'demo', email: 'demo@example.com' } as User);
      setLoading(false);
      return;
    }

    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session }, error }: { data: { session: Session | null }, error: any }) => {
      if (error) console.error('Session error:', error);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [demoEnabled]);

  const signIn = async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user && typeof window !== 'undefined') {
      localStorage.setItem('new-user', 'true');
    }
  };

  const signOut = async () => {
    try {
      // Check demo mode before clearing localStorage
      const isDemoMode = typeof window !== 'undefined' && 
        (localStorage.getItem('demo-mode') === 'true' || 
         (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')));
      
      // Clear Zustand store
      useAppStore.getState().resetStore();
      
      // Sign out from Supabase if not in demo mode
      if (!isDemoMode) {
        const supabase = createClient();
        await supabase.auth.signOut();
      }
      
      // Clear user state
      setUser(null);
      
      // Clear localStorage (after checking demo mode)
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      
      // Redirect to auth page
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if there's an error
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
