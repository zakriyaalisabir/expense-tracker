"use client";
import { useAuth } from "@components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === 'true';

  useEffect(() => {
    const demoMode = demoEnabled && typeof window !== 'undefined'
      && (localStorage.getItem('demo-mode') === 'true'
        || (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')));
    if (!loading && !user && !demoMode) {
      console.log('AuthGuard: Redirecting to /auth, user:', user, 'loading:', loading);
      router.push("/auth");
    }
  }, [router, loading, user, demoEnabled]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const demoMode = demoEnabled && typeof window !== 'undefined'
    && (localStorage.getItem('demo-mode') === 'true'
      || (typeof document !== 'undefined' && document.cookie.includes('demo-mode=true')));
  if (!user && !demoMode) return null;

  return <>{children}</>;
}
