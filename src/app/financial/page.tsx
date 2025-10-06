"use client";
import { Container, Typography, Grid, Box, Tabs, Tab } from "@mui/material";
import { useEffect } from "react";
import { usePriceUpdater } from "../../lib/priceUpdater";
import { useState } from "react";
import { useAppStore } from "../../lib/store";
import DebtTracker from "../../components/DebtTracker";
import InvestmentPortfolio from "../../components/InvestmentPortfolio";
import NetWorthCalculator from "../../components/NetWorthCalculator";

export default function FinancialPage() {
  const [tabValue, setTabValue] = useState(0);
  const { debts, investments, assets, accounts } = useAppStore();
  const { startAutoUpdate, stopAutoUpdate } = usePriceUpdater();

  useEffect(() => {
    startAutoUpdate();
    return () => stopAutoUpdate();
  }, [startAutoUpdate, stopAutoUpdate]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Financial Tracking
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Track your debts, investments, and calculate your net worth for complete financial visibility.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Net Worth" />
          <Tab label="Debts" />
          <Tab label="Investments" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <NetWorthCalculator accounts={accounts} assets={assets} debts={debts} investments={investments} />
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <DebtTracker debts={debts} />
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <InvestmentPortfolio investments={investments} />
        </Box>
      )}
    </Container>
  );
}
