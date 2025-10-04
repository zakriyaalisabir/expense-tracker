"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Grid, Card, CardContent, Typography, Stack, Divider, Skeleton } from "@mui/material";
import MoneyCard from "@components/MoneyCard";
import TransactionForm from "@components/TransactionForm";
import { useAppStore, totalsForRange } from "@lib/store";

const IncomeExpenseSavingsChart = dynamic(() => import("@components/charts/IncomeExpenseSavingsChart"), { ssr: false });
const MonthlyIncomeExpenseChart = dynamic(() => import("@components/charts/MonthlyIncomeExpenseChart"), { ssr: false });
const CategoryBreakdownChart = dynamic(() => import("@components/charts/CategoryBreakdownChart"), { ssr: false });
const CurrencySummary = dynamic(() => import("@components/CurrencySummary"), { ssr: false });
const CurrencyBreakdownChart = dynamic(() => import("@components/charts/CurrencyBreakdownChart"), { ssr: false });
const MonthlyCurrencyChart = dynamic(() => import("@components/charts/MonthlyCurrencyChart"), { ssr: false });
const CategoryByCurrencyChart = dynamic(() => import("@components/charts/CategoryByCurrencyChart"), { ssr: false });
const SavingsRateChart = dynamic(() => import("@components/charts/SavingsRateChart"), { ssr: false });
const AccountBalanceChart = dynamic(() => import("@components/charts/AccountBalanceChart"), { ssr: false });
const TopExpensesChart = dynamic(() => import("@components/charts/TopExpensesChart"), { ssr: false });
const SubcategoryChart = dynamic(() => import("@components/charts/SubcategoryChart"), { ssr: false });
const CashFlowChart = dynamic(() => import("@components/charts/CashFlowChart"), { ssr: false });
const WeekdaySpendingChart = dynamic(() => import("@components/charts/WeekdaySpendingChart"), { ssr: false });
const TrendHeatmap = dynamic(() => import("@components/charts/TrendHeatmap"), { ssr: false });
const AccountList = dynamic(() => import("@components/AccountList"), { ssr: false });

export default function Dashboard(){
  const seed = useAppStore(s => s.seed);
  const [hydrated, setHydrated] = React.useState(false);
  const totals = React.useMemo(() => totalsForRange(), []);
  const { income, expense, saved, savings } = totals;

  React.useEffect(() => {
    seed();
    setHydrated(true);
  }, [seed]);

  if (!hydrated) {
    return <Typography color="text.secondary">Loading...</Typography>;
  }
  return (
    <Grid container spacing={2}>
      <Grid item xs={12}><Stack direction="row" spacing={2}><TransactionForm/></Stack></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Income" value={income} color="success" /></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Expenses" value={expense} color="error" /></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Saved" value={saved} color="info" /></Grid>
      <Grid item xs={12} sm={6} md={3}><MoneyCard title="Net Savings" value={savings} /></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Monthly Income, Expenses & Savings</Typography><Divider sx={{my:1}}/><IncomeExpenseSavingsChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={8}><Card><CardContent><Typography variant="h6">Monthly Income vs Expenses</Typography><Divider sx={{my:1}}/><MonthlyIncomeExpenseChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Category Breakdown</Typography><Divider sx={{my:1}}/><CategoryBreakdownChart/></CardContent></Card></Grid>
      <Grid item xs={12}><CurrencySummary/></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Currency Breakdown</Typography><Divider sx={{my:1}}/><CurrencyBreakdownChart/></CardContent></Card></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Monthly by Currency</Typography><Divider sx={{my:1}}/><MonthlyCurrencyChart/></CardContent></Card></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Categories by Currency</Typography><Divider sx={{my:1}}/><CategoryByCurrencyChart/></CardContent></Card></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Savings Rate Trend</Typography><Divider sx={{my:1}}/><SavingsRateChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Account Balances</Typography><Divider sx={{my:1}}/><AccountBalanceChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Top 10 Expenses</Typography><Divider sx={{my:1}}/><TopExpensesChart/></CardContent></Card></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Subcategory Breakdown</Typography><Divider sx={{my:1}}/><SubcategoryChart/></CardContent></Card></Grid>
      <Grid item xs={12}><Card><CardContent><Typography variant="h6">Cumulative Cash Flow</Typography><Divider sx={{my:1}}/><CashFlowChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Spending by Weekday</Typography><Divider sx={{my:1}}/><WeekdaySpendingChart/></CardContent></Card></Grid>
      <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Daily Trend</Typography><Divider sx={{my:1}}/><TrendHeatmap/></CardContent></Card></Grid>
      <Grid item xs={12}><AccountList/></Grid>
    </Grid>
  );
}
