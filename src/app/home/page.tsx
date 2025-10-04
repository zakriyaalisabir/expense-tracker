"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Grid, Stack, Skeleton, Fade, Box, Typography, Avatar, Divider } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import { FADE_TIMEOUT } from "@lib/constants";
import MoneyCard from "@components/MoneyCard";
import TransactionForm from "@components/TransactionForm";
import CategoryForm from "@components/CategoryForm";
import AccountForm from "@components/AccountForm";
import BudgetForm from "@components/BudgetForm";
import GoalForm from "@components/GoalForm";
import AuthGuard from "@components/AuthGuard";
import { useAppStore, totalsForRange } from "@lib/store";

const CurrencySummary = dynamic(() => import("@components/CurrencySummary"), { ssr: false });

export default function Home(){
  const seed = useAppStore(s => s.seed);
  const transactions = useAppStore(s => s.transactions);
  const [hydrated, setHydrated] = React.useState(false);
  const totals = React.useMemo(() => totalsForRange(), [transactions]);
  const { income, expense, saved, savings } = totals;

  React.useEffect(() => {
    const isNewUser = localStorage.getItem('new-user') === 'true';
    if (isNewUser) {
      localStorage.removeItem('new-user');
      seed();
    }
    setHydrated(true);
  }, [seed]);

  if (!hydrated) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={100} />
        <Grid container spacing={2}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={80} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <AuthGuard>
    <Fade in timeout={FADE_TIMEOUT}>
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <HomeIcon fontSize="large" sx={{ color: 'white' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">Home</Typography>
            <Typography variant="body2" color="text.secondary">Quick overview and actions</Typography>
          </Box>
        </Box>
        <Divider sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            <TransactionForm/>
            <CategoryForm/>
            <AccountForm/>
            <BudgetForm/>
            <GoalForm/>
          </Stack>
        </Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Income" value={income} color="success" /></Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Expenses" value={expense} color="error" /></Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Saved" value={saved} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Net Savings" value={savings} /></Grid>
        <Grid item xs={12}><CurrencySummary/></Grid>
      </Grid>
      </Box>
    </Fade>
    </AuthGuard>
  );
}
