"use client";
import * as React from "react";
import { Grid, Card, CardContent, Typography, Stack, Divider } from "@mui/material";
import MoneyCard from "@components/MoneyCard";
import MonthlyIncomeExpenseChart from "@components/charts/MonthlyIncomeExpenseChart";
import CategoryBreakdownChart from "@components/charts/CategoryBreakdownChart";
import TrendHeatmap from "@components/charts/TrendHeatmap";
import AccountList from "@components/AccountList";
import TransactionForm from "@components/TransactionForm";
import { useAppStore, totalsForRange } from "@lib/store";

export default function Dashboard(){
  const seed = useAppStore(s => s.seed);
  const { income, expense, savings, savingsPct } = totalsForRange();
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    seed();
    setHydrated(true);
  }, [seed]);

  if (!hydrated) {
    return <Typography color="text.secondary">Loading dashboard...</Typography>;
  }
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}><Stack direction="row" spacing={2}><TransactionForm/></Stack></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Income" value={income} color="success" /></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Expenses" value={expense} color="error" /></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Savings" value={savings} /></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Savings %" value={savingsPct} /></Grid>
      <Grid item xs={12} md={8}><Card><CardContent><Typography variant="h6">Monthly Income vs Expenses</Typography><Divider sx={{my:1}}/><MonthlyIncomeExpenseChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Category Breakdown</Typography><Divider sx={{my:1}}/><CategoryBreakdownChart/></CardContent></Card></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Daily Trend</Typography><Divider sx={{my:1}}/><TrendHeatmap/></CardContent></Card></Grid>
      <Grid item xs={12}><AccountList/></Grid>
    </Grid>
  );
}
