"use client";
import { useEffect } from "react";
import { useAppStore } from "@lib/store";
import { createClient } from "@lib/supabase/client";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const { setUserId, loadData } = useAppStore();

  useEffect(() => {
    const supabase = createClient();
    
    const initStore = async () => {
      const demoMode = localStorage.getItem('demo-mode') === 'true';
      if (demoMode) {
        setUserId('demo');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
        
        // Check if new user needs seed data
        if (localStorage.getItem('new-user') === 'true') {
          await supabase.rpc('seed_user_data', { p_user_id: session.user.id });
          localStorage.removeItem('new-user');
        }
        
        await loadData();
      }
    };

    initStore();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUserId(session?.user?.id || null);
      if (session?.user?.id) await loadData();
    });

    return () => subscription.unsubscribe();
  }, [setUserId, loadData]);

  return <>{children}</>;
}
