"use client";
import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, TextField, Button, Stack, Typography, Tabs, Tab, Box, Alert, InputAdornment, IconButton, Fade, Avatar } from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

export default function SignIn() {
  const router = useRouter();
  const [tab, setTab] = React.useState(0);
  const [form, setForm] = React.useState({ email: "", password: "", name: "" });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  async function handleSignIn() {
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { redirect: false, email: form.email, password: form.password });
    setLoading(false);
    if (res?.error) setError("Invalid credentials");
    else router.push("/home");
  }

  async function handleRegister() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) setError(data.error);
    else {
      await signIn("credentials", { redirect: false, email: form.email, password: form.password });
      router.push("/home");
    }
  }

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      <Fade in timeout={800}>
      <Card sx={{ maxWidth: 450, width: "100%", m: 2, borderRadius: 4 }} elevation={8}>
        <CardContent sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: "primary.main" }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 48 }} />
            </Avatar>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Expense Tracker</Typography>
            <Typography variant="body2" color="text.secondary">Manage your finances with ease</Typography>
          </Box>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setError(""); }} variant="fullWidth" sx={{ mb: 3 }}>
            <Tab label="Sign In" />
            <Tab label="Register" />
          </Tabs>
          <Stack spacing={2.5}>
            {tab === 1 && (
              <TextField 
                label="Full Name" 
                value={form.name} 
                onChange={e => setForm({ ...form, name: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  )
                }}
                fullWidth
              />
            )}
            <TextField 
              label="Email" 
              type="email" 
              value={form.email} 
              onChange={e => setForm({ ...form, email: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                )
              }}
              fullWidth
            />
            <TextField 
              label="Password" 
              type={showPassword ? "text" : "password"} 
              value={form.password} 
              onChange={e => setForm({ ...form, password: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              fullWidth
            />
            {error && <Alert severity="error">{error}</Alert>}
            <Button 
              variant="contained" 
              size="large"
              onClick={tab === 0 ? handleSignIn : handleRegister}
              disabled={loading}
              sx={{ py: 1.5, fontWeight: "bold" }}
            >
              {loading ? "Loading..." : tab === 0 ? "Sign In" : "Create Account"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      </Fade>
    </Box>
  );
}
