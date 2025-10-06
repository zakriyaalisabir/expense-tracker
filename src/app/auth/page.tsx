"use client";
import { useAuth } from "@components/AuthProvider";
import { Box, Button, Container, Paper, TextField, Typography, Divider, Alert, LinearProgress } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { createClient } from "@lib/supabase/client";

export default function AuthPage() {
  const demoEnabled = process.env.NEXT_PUBLIC_DEMO_ENABLED === 'true';
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false, confirmPassword: false });
  const { user, signIn, signUp } = useAuth();
  const router = useRouter();
  const supabase = createClient();

  const validation = useMemo(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    const confirmValid = !isSignUp || password === confirmPassword;
    
    return {
      email: { valid: emailValid, message: emailValid ? "" : "Please enter a valid email" },
      password: { valid: passwordValid, message: passwordValid ? "" : "Password must be at least 6 characters" },
      confirmPassword: { valid: confirmValid, message: confirmValid ? "" : "Passwords do not match" },
      isValid: emailValid && passwordValid && confirmValid
    };
  }, [email, password, confirmPassword, isSignUp]);

  // Redirect if already logged in
  if (user && user.id !== 'demo') {
    router.replace('/');
    return null;
  }

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setTouched({ email: false, password: false, confirmPassword: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched({ email: true, password: true, confirmPassword: true });
    
    if (!validation.isValid) return;
    
    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Check your email for confirmation link');
        setError("");
        resetForm();
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { 
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/auth/callback` 
          : '/auth/callback',
        queryParams: {
          prompt: 'select_account' // Forces account selection
        }
      }
    });
    if (error) setError(error.message);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
            margin="normal"
            required
            disabled={loading}
            error={touched.email && !validation.email.valid}
            helperText={touched.email && validation.email.message}
            InputProps={{
              endAdornment: touched.email && validation.email.valid && <CheckCircleIcon color="success" />
            }}
          />
          
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
            margin="normal"
            required
            disabled={loading}
            error={touched.password && !validation.password.valid}
            helperText={touched.password && validation.password.message}
            InputProps={{
              endAdornment: touched.password && validation.password.valid && <CheckCircleIcon color="success" />
            }}
          />
          
          {isSignUp && (
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
              margin="normal"
              required
              disabled={loading}
              error={touched.confirmPassword && !validation.confirmPassword.valid}
              helperText={touched.confirmPassword && validation.confirmPassword.message}
              InputProps={{
                endAdornment: touched.confirmPassword && validation.confirmPassword.valid && <CheckCircleIcon color="success" />
              }}
            />
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            fullWidth 
            sx={{ mt: 2 }}
            disabled={loading || !validation.isValid}
          >
            {loading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>
          <Divider sx={{ my: 2 }}>OR</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={() => handleOAuthSignIn('google')}
            sx={{ mb: 1 }}
            disabled={loading}
          >
            Continue with Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GitHubIcon />}
            onClick={() => handleOAuthSignIn('github')}
            sx={{ mb: 1 }}
            disabled={loading}
          >
            Continue with GitHub
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => {
              setIsSignUp(!isSignUp);
              resetForm();
            }}
            disabled={loading}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
          {demoEnabled && (
            <Button
              fullWidth
              variant="text"
              sx={{ mt: 1 }}
              onClick={() => {
                // Persist demo mode in both localStorage and a cookie so the
                // middleware (server-side) can honor it as well.
                if (typeof window !== 'undefined') {
                  localStorage.setItem('demo-mode', 'true');
                  const secure = window.location.protocol === 'https:' ? '; secure' : '';
                  const oneWeek = 60 * 60 * 24 * 7;
                  document.cookie = `demo-mode=true; path=/; max-age=${oneWeek}; samesite=lax${secure}`;
                }
                router.push('/');
              }}
            >
              Continue as Demo
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
