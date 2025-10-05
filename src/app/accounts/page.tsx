"use client";
import * as React from "react";
import { CircularProgress, Box, Alert, Typography, Divider } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountForm from "@components/AccountForm";
import AccountList from "@components/AccountList";
import { useAppStore } from "@lib/store";
import { LOADING_DELAY } from "@lib/constants";
import PageLayout from "@components/PageLayout";

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
    <PageLayout
      icon={AccountBalanceWalletIcon}
      title="Accounts"
      subtitle={`${accounts.length} total accounts`}
      actions={<AccountForm />}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Account Management:</strong> Create and manage your financial accounts (cash, bank, credit, e-wallet). 
          Each account supports different currencies and tracks balances automatically.
        </Typography>
      </Alert>
      <Divider sx={{ mb: 3 }} />
      <AccountList />
    </PageLayout>
  );
}
