"use client";
import * as React from "react";
import { Card, CardContent, Grid, Stack, Typography, Fade, CircularProgress, Box, Avatar, Divider, LinearProgress, Chip, IconButton, Tooltip } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BudgetForm from "@components/BudgetForm";
import BudgetBar from "@components/BudgetBar";
import { useAppStore } from "@lib/store";
import { Budget } from "@lib/types";
import { FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

export default function BudgetsPage(){
  const { budgets, transactions, deleteBudget } = useAppStore();
  const [editBudget, setEditBudget] = React.useState<Budget | undefined>();
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
    <Box>
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
        <BudgetForm editBudget={editBudget} onClose={() => setEditBudget(undefined)} />
      </Box>
      <Divider />
      <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
      <Grid container spacing={3}>
        {budgets.map(budget => {
          const monthTx = transactions.filter(t => t.type === "expense" && t.date.slice(0,7) === budget.month);
          const spent = monthTx.reduce((a,b) => a + b.base_amount, 0);
          const percentage = budget.total ? (spent / budget.total) * 100 : 0;
          const isOverBudget = spent > (budget.total || 0);
          const hasCategoryBudgets = budget.byCategory && Object.keys(budget.byCategory).length > 0;
          return (
            <Grid item xs={12} md={6} key={budget.id}>
              <Card elevation={3}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{budget.month}</Typography>
                      <Box display="flex" gap={1} alignItems="center">
                        <Chip 
                          label={isOverBudget ? "Over Budget" : "On Track"}
                          color={isOverBudget ? "error" : "success"}
                          size="small"
                          icon={isOverBudget ? <TrendingDownIcon /> : <TrendingUpIcon />}
                        />
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => setEditBudget(budget)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => deleteBudget(budget.id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
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
                    {hasCategoryBudgets && (
                      <Box>
                        <Typography variant="body2" fontWeight="bold" mb={1}>By Category</Typography>
                        <Stack spacing={1}>
                          {Object.entries(budget.byCategory!).map(([catId, catBudget]) => {
                            const cat = useAppStore.getState().categories.find(c => c.id === catId);
                            const catSpent = monthTx.filter(t => t.category_id === catId).reduce((a,b) => a + b.base_amount, 0);
                            const catPct = catBudget ? (catSpent / catBudget) * 100 : 0;
                            const catOver = catSpent > catBudget;
                            return (
                              <Box key={catId}>
                                <Box display="flex" justifyContent="space-between" mb={0.5}>
                                  <Typography variant="caption" color="text.secondary">{cat?.name || catId}</Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    {catSpent.toFixed(2)} / {catBudget.toFixed(2)}
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(catPct, 100)} 
                                  color={catOver ? "error" : "primary"}
                                  sx={{ height: 4, borderRadius: 2 }}
                                />
                              </Box>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      </Box>
    </Stack>
    </Box>
    </Fade>
  );
}
