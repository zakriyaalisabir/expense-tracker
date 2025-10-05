"use client";
import { createClient } from "@lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, useRef } from "react";

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

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('Session error:', error);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    if (typeof window !== 'undefined' && (localStorage.getItem('demo-mode') === 'true' || (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')))) {
      localStorage.removeItem('demo-mode');
      if (typeof document !== 'undefined') {
        // Expire the cookie immediately
        document.cookie = 'demo-mode=; path=/; max-age=0; samesite=lax';
      }
      setUser(null);
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
