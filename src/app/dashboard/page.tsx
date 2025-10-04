"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Grid, Card, CardContent, Typography, Divider, Skeleton, Fade, Stack, ToggleButtonGroup, ToggleButton, TextField, Box } from "@mui/material";
import { FADE_TIMEOUT } from "@lib/constants";
import { useAppStore } from "@lib/store";

const IncomeExpenseSavingsChart = dynamic(() => import("@components/charts/IncomeExpenseSavingsChart"), { ssr: false });
const MonthlyIncomeExpenseChart = dynamic(() => import("@components/charts/MonthlyIncomeExpenseChart"), { ssr: false });
const CategoryBreakdownChart = dynamic(() => import("@components/charts/CategoryBreakdownChart"), { ssr: false });
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

export default function Dashboard(){
  const seed = useAppStore(s => s.seed);
  const [hydrated, setHydrated] = React.useState(false);
  const [period, setPeriod] = React.useState<"month" | "year" | "custom">("month");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

  React.useEffect(() => {
    const now = new Date();
    if (period === "month") {
      setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
      setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10));
    } else if (period === "year") {
      setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10));
      setEndDate(new Date(now.getFullYear(), 11, 31).toISOString().slice(0, 10));
    }
  }, [period]);

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
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Date Range Filter</Typography>
                <ToggleButtonGroup exclusive value={period} onChange={(_, v) => v && setPeriod(v)} fullWidth size="small">
                  <ToggleButton value="month">Month</ToggleButton>
                  <ToggleButton value="year">Year</ToggleButton>
                  <ToggleButton value="custom">Custom</ToggleButton>
                </ToggleButtonGroup>
                {period === "custom" && (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      label="Start Date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="End Date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                    />
                  </Stack>
                )}
                {period !== "custom" && (
                  <Typography variant="body2" color="text.secondary">
                    Showing data from {startDate} to {endDate}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Monthly Income, Expenses & Savings</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><IncomeExpenseSavingsChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12} md={8}><Card sx={{height:'100%'}}><CardContent><Typography variant="h6">Monthly Income vs Expenses</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><MonthlyIncomeExpenseChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12} md={4}><Card sx={{height:'100%'}}><CardContent><Typography variant="h6">Category Breakdown</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:350,sm:320}}}><CategoryBreakdownChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Currency Breakdown</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><CurrencyBreakdownChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Monthly by Currency</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><MonthlyCurrencyChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Categories by Currency</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><CategoryByCurrencyChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Savings Rate Trend</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><SavingsRateChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card sx={{height:'100%'}}><CardContent><Typography variant="h6">Account Balances</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><AccountBalanceChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card sx={{height:'100%'}}><CardContent><Typography variant="h6">Top 10 Expenses</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><TopExpensesChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Subcategory Breakdown</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><SubcategoryChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Cumulative Cash Flow</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><CashFlowChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card sx={{height:'100%'}}><CardContent><Typography variant="h6">Spending by Weekday</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><WeekdaySpendingChart/></Box></CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card sx={{height:'100%'}}><CardContent><Typography variant="h6">Daily Trend</Typography><Divider sx={{my:1}}/><Box sx={{height:{xs:250,sm:320}}}><TrendHeatmap/></Box></CardContent></Card></Grid>
      </Grid>
    </Fade>
  );
}
