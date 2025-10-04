"use client";
import { useAuth } from "@/components/AuthProvider";
import { Box, Button, Container, Paper, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isSignUp) {
        await signUp(email, password);
        alert("Check your email for confirmation link");
      } else {
        await signIn(email, password);
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isSignUp ? "Sign Up" : "Sign In"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
          />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Need an account? Sign Up"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
