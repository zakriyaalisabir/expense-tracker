"use client";
import { useAuth } from "@components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CircularProgress, Box } from "@mui/material";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';
    if (!loading && !user && !demoMode) {
      console.log('AuthGuard: Redirecting to /auth, user:', user, 'loading:', loading);
      const timer = setTimeout(() => router.push("/auth"), 100);
      return () => clearTimeout(timer);
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  const demoMode = typeof window !== 'undefined' && localStorage.getItem('demo-mode') === 'true';
  if (!user && !demoMode) return null;

  return <>{children}</>;
}
