"use client";
import { useEffect, useRef } from "react";
import { useAppStore } from "@lib/store";
import { createClient } from "@lib/supabase/client";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const supabase = createClient();
    
    const initStore = async () => {
      const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';
      if (demoMode) {
        useAppStore.getState().setUserId('demo');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        useAppStore.getState().setUserId(session.user.id);
        
        if (typeof window !== 'undefined' && localStorage.getItem('new-user') === 'true') {
          await supabase.rpc('seed_user_data', { p_user_id: session.user.id });
          localStorage.removeItem('new-user');
        }
        
        await useAppStore.getState().loadData();
      }
    };

    initStore();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      useAppStore.getState().setUserId(session?.user?.id || null);
      if (session?.user?.id) await useAppStore.getState().loadData();
    });

    return () => subscription.unsubscribe();
  }, []);

  return <>{children}</>;
}
