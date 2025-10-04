"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Grid, Card, CardContent, Typography, Divider, Skeleton, Fade, Stack } from "@mui/material";
import { FADE_TIMEOUT } from "@lib/constants";
import TransactionForm from "@components/TransactionForm";
import CategoryForm from "@components/CategoryForm";
import AccountForm from "@components/AccountForm";
import BudgetForm from "@components/BudgetForm";
import GoalForm from "@components/GoalForm";
import { useAppStore } from "@lib/store";

const IncomeExpenseSavingsChart = dynamic(() => import("@components/charts/IncomeExpenseSavingsChart"), { ssr: false });
const MonthlyIncomeExpenseChart = dynamic(() => import("@components/charts/MonthlyIncomeExpenseChart"), { ssr: false });
const CategoryBreakdownChart = dynamic(() => import("@components/charts/CategoryBreakdownChart"), { ssr: false });
const SavingsRateChart = dynamic(() => import("@components/charts/SavingsRateChart"), { ssr: false });
const AccountBalanceChart = dynamic(() => import("@components/charts/AccountBalanceChart"), { ssr: false });
const TopExpensesChart = dynamic(() => import("@components/charts/TopExpensesChart"), { ssr: false });
const SubcategoryChart = dynamic(() => import("@components/charts/SubcategoryChart"), { ssr: false });
const CashFlowChart = dynamic(() => import("@components/charts/CashFlowChart"), { ssr: false });
const WeekdaySpendingChart = dynamic(() => import("@components/charts/WeekdaySpendingChart"), { ssr: false });
const TrendHeatmap = dynamic(() => import("@components/charts/TrendHeatmap"), { ssr: false });

export default function Dashboard(){
  const seed = useAppStore(s => s.seed);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    seed();
    setHydrated(true);
  }, [seed]);

  if (!hydrated) {
    return (
      <Stack spacing={2}>
        <Skeleton variant="rectangular" height={100} />
        <Grid container spacing={2}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rectangular" height={320} />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Fade in timeout={FADE_TIMEOUT}>
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
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Monthly Income, Expenses & Savings</Typography><Divider sx={{my:1}}/><IncomeExpenseSavingsChart/></CardContent></Card></Grid>
        <Grid item xs={12} md={8}><Card><CardContent><Typography variant="h6">Monthly Income vs Expenses</Typography><Divider sx={{my:1}}/><MonthlyIncomeExpenseChart/></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6">Category Breakdown</Typography><Divider sx={{my:1}}/><CategoryBreakdownChart/></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Savings Rate Trend</Typography><Divider sx={{my:1}}/><SavingsRateChart/></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Account Balances</Typography><Divider sx={{my:1}}/><AccountBalanceChart/></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Top 10 Expenses</Typography><Divider sx={{my:1}}/><TopExpensesChart/></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Subcategory Breakdown</Typography><Divider sx={{my:1}}/><SubcategoryChart/></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Cumulative Cash Flow</Typography><Divider sx={{my:1}}/><CashFlowChart/></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Spending by Weekday</Typography><Divider sx={{my:1}}/><WeekdaySpendingChart/></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Daily Trend</Typography><Divider sx={{my:1}}/><TrendHeatmap/></CardContent></Card></Grid>
      </Grid>
    </Fade>
  );
}
