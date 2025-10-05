"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Stack, Skeleton, Alert, Typography, Divider, Box } from "@mui/material";
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
  const { transactions, isLoading, userId } = useAppStore(s => ({ 
    transactions: s.transactions, 
    isLoading: s.isLoading, 
    userId: s.userId 
  }));
  const [hydrated, setHydrated] = React.useState(false);
  
  const totals = React.useMemo(() => {
    if (!hydrated) return { income: 0, expense: 0, saved: 0, savings: 0 };
    return totalsForRange();
  }, [hydrated]);
  
  const { income, expense, saved, savings } = totals;

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || !userId || isLoading) {
    return (
      <AuthGuard>
        <PageLayout icon={HomeIcon} title="Home" subtitle="Quick overview and actions">
          <Stack spacing={2}>
            <Skeleton variant="rectangular" height={100} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {[1,2,3,4].map(i => (
                <Box key={i} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
                  <Skeleton variant="rectangular" height={80} />
                </Box>
              ))}
            </Box>
          </Stack>
        </PageLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <PageLayout icon={HomeIcon} title="Home" subtitle="Quick overview and actions">
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Quick Start:</strong> Use the action buttons to add transactions, accounts, categories, budgets, and goals. 
            View your financial summary in the cards below and detailed currency breakdown at the bottom.
          </Typography>
        </Alert>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 6px)', md: '1 1 calc(20% - 8px)' } }}>
            <TransactionForm/>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 6px)', md: '1 1 calc(20% - 8px)' } }}>
            <CategoryForm/>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 6px)', md: '1 1 calc(20% - 8px)' } }}>
            <AccountForm/>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 6px)', md: '1 1 calc(20% - 8px)' } }}>
            <BudgetForm/>
          </Box>
          <Box sx={{ flex: { xs: '1 1 calc(50% - 4px)', sm: '1 1 calc(33.333% - 6px)', md: '1 1 calc(20% - 8px)' } }}>
            <GoalForm/>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <MoneyCard title="Total Income" value={income} color="success" />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <MoneyCard title="Total Expenses" value={expense} color="error" />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <MoneyCard title="Saved" value={saved} color="info" />
          </Box>
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' } }}>
            <MoneyCard title="Net Savings" value={savings} />
          </Box>
          <Box sx={{ flex: '1 1 100%' }}>
            <CurrencySummary/>
          </Box>
        </Box>
      </PageLayout>
    </AuthGuard>
  );
}
