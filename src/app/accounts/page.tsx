"use client";
import * as React from "react";
import { Card, CardContent, Grid, Stack, Typography, Fade, CircularProgress, Box, Avatar, Divider } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountForm from "@components/AccountForm";
import AccountList from "@components/AccountList";
import { useAppStore } from "@lib/store";
import { FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

export default function AccountsPage(){
  const accounts = useAppStore(s => s.accounts);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in timeout={FADE_TIMEOUT}>
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AccountBalanceWalletIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">Accounts</Typography>
            <Typography variant="body2" color="text.secondary">
              {accounts.length} total accounts
            </Typography>
          </Box>
        </Box>
        <AccountForm />
      </Box>
      <Divider />
      <AccountList />
    </Stack>
    </Fade>
  );
}
