"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Grid, Card, CardContent, Typography, Stack, Divider, Skeleton, Fade } from "@mui/material";
import { FADE_TIMEOUT } from "@lib/constants";
import MoneyCard from "@components/MoneyCard";
import { useAppStore, totalsForRange } from "@lib/store";

const CurrencySummary = dynamic(() => import("@components/CurrencySummary"), { ssr: false });
const CurrencyBreakdownChart = dynamic(() => import("@components/charts/CurrencyBreakdownChart"), { ssr: false });
const MonthlyCurrencyChart = dynamic(() => import("@components/charts/MonthlyCurrencyChart"), { ssr: false });
const CategoryByCurrencyChart = dynamic(() => import("@components/charts/CategoryByCurrencyChart"), { ssr: false });
const AccountList = dynamic(() => import("@components/AccountList"), { ssr: false });

export default function Summary(){
  const seed = useAppStore(s => s.seed);
  const [hydrated, setHydrated] = React.useState(false);
  const totals = React.useMemo(() => totalsForRange(), []);
  const { income, expense, saved, savings } = totals;

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
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={80} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={320} />
      </Stack>
    );
  }

  return (
    <Fade in timeout={FADE_TIMEOUT}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Income" value={income} color="success" /></Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Total Expenses" value={expense} color="error" /></Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Saved" value={saved} color="info" /></Grid>
        <Grid item xs={12} sm={6} md={3}><MoneyCard title="Net Savings" value={savings} /></Grid>
        <Grid item xs={12}><CurrencySummary/></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Currency Breakdown</Typography><Divider sx={{my:1}}/><CurrencyBreakdownChart/></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Monthly by Currency</Typography><Divider sx={{my:1}}/><MonthlyCurrencyChart/></CardContent></Card></Grid>
        <Grid item xs={12}><Card><CardContent><Typography variant="h6">Categories by Currency</Typography><Divider sx={{my:1}}/><CategoryByCurrencyChart/></CardContent></Card></Grid>
        <Grid item xs={12}><AccountList/></Grid>
      </Grid>
    </Fade>
  );
}
