"use client";
import * as React from "react";
import { Card, CardContent, Grid, Stack, Typography, Fade, CircularProgress, Box, Avatar, Divider, LinearProgress, Chip } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BudgetForm from "@components/BudgetForm";
import BudgetBar from "@components/BudgetBar";
import { useAppStore } from "@lib/store";
import { FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

export default function BudgetsPage(){
  const { budgets, transactions } = useAppStore();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in timeout={FADE_TIMEOUT}>
    <Stack spacing={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <AccountBalanceIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">Budgets</Typography>
            <Typography variant="body2" color="text.secondary">
              {budgets.length} active budgets
            </Typography>
          </Box>
        </Box>
        <BudgetForm />
      </Box>
      <Divider />
      <Grid container spacing={3}>
        {budgets.map(budget => {
          const spent = transactions.filter(t => t.type === "expense" && t.date.slice(0,7) === budget.month).reduce((a,b) => a + b.base_amount, 0);
          const percentage = budget.total ? (spent / budget.total) * 100 : 0;
          const isOverBudget = spent > (budget.total || 0);
          return (
            <Grid item xs={12} md={6} key={budget.id}>
              <Card elevation={3}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{budget.month}</Typography>
                      <Chip 
                        label={isOverBudget ? "Over Budget" : "On Track"}
                        color={isOverBudget ? "error" : "success"}
                        size="small"
                        icon={isOverBudget ? <TrendingDownIcon /> : <TrendingUpIcon />}
                      />
                    </Box>
                    <Box>
                      <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" color="text.secondary">Spent</Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {spent.toFixed(2)} / {budget.total?.toFixed(2) || 0}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(percentage, 100)} 
                        color={isOverBudget ? "error" : "primary"}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                      <Typography variant="caption" color="text.secondary" mt={0.5}>
                        {percentage.toFixed(1)}% used
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Stack>
    </Fade>
  );
}
