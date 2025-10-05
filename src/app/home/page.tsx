"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Grid, Stack, Skeleton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import MoneyCard from "@components/MoneyCard";
import TransactionForm from "@components/TransactionForm";
import CategoryForm from "@components/CategoryForm";
import AccountForm from "@components/AccountForm";
import BudgetForm from "@components/BudgetForm";
import GoalForm from "@components/GoalForm";
import AuthGuard from "@components/AuthGuard";
import { useAppStore, totalsForRange } from "@lib/store";
import PageLayout from "@components/PageLayout";

const CurrencySummary = dynamic(() => import("@components/CurrencySummary"), { ssr: false });

export default function Home(){
  const transactions = useAppStore(s => s.transactions);
  const [hydrated, setHydrated] = React.useState(false);
  const totals = React.useMemo(() => totalsForRange(), []);
  const { income, expense, saved, savings } = totals;

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={100} />
        <Grid container spacing={0} sx={{ columnGap: 2, rowGap: 2 }}>
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
    <PageLayout icon={HomeIcon} title="Home" subtitle="Quick overview and actions">
        <Grid container spacing={0} sx={{ columnGap: 2, rowGap: 2 }}>
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
    </PageLayout>
    </AuthGuard>
  );
}
