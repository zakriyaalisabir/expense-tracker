"use client";
import * as React from "react";
import { Card, CardContent, Typography, Stack, Chip, Box } from "@mui/material";
import { useAppStore } from "@lib/store";
import { groupByCurrency } from "@lib/currency";

export default function CurrencySummary() {
  const transactions = useAppStore(s => s.transactions);
  const currencyData = React.useMemo(() => groupByCurrency(transactions), [transactions]);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Currency Summary</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {Object.entries(currencyData).map(([currency, totals]: [string, any]) => (
            <Box key={currency} sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(25% - 12px)' } }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6" color="primary">{currency}</Typography>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Income:</Typography>
                      <Chip label={totals.income.toFixed(2)} color="success" size="small" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Expense:</Typography>
                      <Chip label={totals.expense.toFixed(2)} color="error" size="small" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Saved:</Typography>
                      <Chip label={totals.saved.toFixed(2)} color="info" size="small" />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Net:</Typography>
                      <Chip 
                        label={totals.savings.toFixed(2)} 
                        color={totals.savings >= 0 ? "success" : "warning"} 
                        size="small" 
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}
