"use client";
import * as React from "react";
import { Card, CardContent, Stack, Typography, CircularProgress, Box, LinearProgress, Chip, IconButton, Tooltip, Divider, Alert } from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import BudgetForm from "@components/BudgetForm";
import { useAppStore } from "@lib/store";
import { Budget } from "@lib/types";
import { LOADING_DELAY } from "@lib/constants";
import PageLayout from "@components/PageLayout";

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
    <PageLayout
      icon={BarChartIcon}
      title="Budgets"
      subtitle={`${budgets.length} active budgets`}
      actions={<BudgetForm editBudget={editBudget} onClose={() => setEditBudget(undefined)} />}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>How to use:</strong> Click "Add Budget" to set monthly spending limits. 
          Set total budget and optional category-specific limits. 
          Track progress with visual indicators - green means on track, red means over budget.
        </Typography>
      </Alert>
      <Divider sx={{ mb: 3 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {budgets.map(budget => {
          const monthTx = transactions.filter(t => t.type === "expense" && t.date.slice(0,7) === budget.month);
          const spent = monthTx.reduce((a,b) => a + b.base_amount, 0);
          const percentage = budget.total ? (spent / budget.total) * 100 : 0;
          const isOverBudget = spent > (budget.total || 0);
          const hasCategoryBudgets = budget.byCategory && Object.keys(budget.byCategory).length > 0;
          return (
            <Box key={budget.id} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
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
            </Box>
          );
        })}
      </Box>
    </PageLayout>
  );
}
