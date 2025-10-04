"use client";
import * as React from "react";
import { Grid, Card, CardContent, Typography, Stack, Divider } from "@mui/material";
import MoneyCard from "@components/MoneyCard";
import MonthlyIncomeExpenseChart from "@components/charts/MonthlyIncomeExpenseChart";
import IncomeExpenseSavingsChart from "@components/charts/IncomeExpenseSavingsChart";
import CategoryBreakdownChart from "@components/charts/CategoryBreakdownChart";
import TrendHeatmap from "@components/charts/TrendHeatmap";
import CurrencyBreakdownChart from "@components/charts/CurrencyBreakdownChart";
import MonthlyCurrencyChart from "@components/charts/MonthlyCurrencyChart";
import CategoryByCurrencyChart from "@components/charts/CategoryByCurrencyChart";
import SavingsRateChart from "@components/charts/SavingsRateChart";
import AccountBalanceChart from "@components/charts/AccountBalanceChart";
import SubcategoryChart from "@components/charts/SubcategoryChart";
import TopExpensesChart from "@components/charts/TopExpensesChart";
import CashFlowChart from "@components/charts/CashFlowChart";
import WeekdaySpendingChart from "@components/charts/WeekdaySpendingChart";
import CurrencySummary from "@components/CurrencySummary";
import AccountList from "@components/AccountList";
import TransactionForm from "@components/TransactionForm";
import { useAppStore, totalsForRange } from "@lib/store";

export default function Dashboard(){
  const seed = useAppStore(s => s.seed);
  const { income, expense, saved, savings, savingsPct } = totalsForRange();
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
