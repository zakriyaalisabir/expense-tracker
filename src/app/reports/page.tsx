"use client";
import * as React from "react";
import { Card, CardContent, Button, Stack, TextField, Typography, Alert, Divider, Box, Grid, Chip } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useAppStore } from "@lib/store";
import PageLayout from "@components/PageLayout";
import { formatCurrency } from "@lib/currency";
import { totalsForRange } from "@lib/store";

function exportCSV(filename: string, rows: any[]) {
  const headers = Object.keys(rows[0] ?? {});
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage(){
  const { transactions, categories, accounts, settings, debts, investments } = useAppStore();
  const [from,setFrom] = React.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0,10));
  const [to,setTo] = React.useState(new Date().toISOString().slice(0,10));
  const [exportSuccess, setExportSuccess] = React.useState("");
  
  // Validate date range
  const isValidRange = from <= to;
  const daysDiff = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24));
  const canExport = isValidRange && daysDiff <= 365;
  
  // Calculate totals for the selected range
  const totals = totalsForRange(from + 'T00:00:00', to + 'T23:59:59');
  
  // Filter transactions for the range
  const filteredTransactions = transactions.filter(t => {
    const d = t.date.slice(0,10);
    return d >= from && d <= to;
  });
  
  // Group by category
  const categoryTotals = filteredTransactions.reduce((acc, t) => {
    const categoryName = categories.find(c => c.id === t.category_id)?.name || 'Unknown';
    if (!acc[categoryName]) acc[categoryName] = { income: 0, expense: 0, count: 0 };
    if (t.type === 'income') acc[categoryName].income += t.base_amount;
    if (t.type === 'expense') acc[categoryName].expense += t.base_amount;
    acc[categoryName].count++;
    return acc;
  }, {} as Record<string, { income: number; expense: number; count: number }>);
  
  function doExport(){
    if (!canExport || filteredTransactions.length === 0) return;
    
    const exportData = filteredTransactions.map(t => ({
      id: t.id,
      date: new Date(t.date).toLocaleDateString(),
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      base_amount: t.base_amount,
      account: accounts.find(a=>a.id===t.account_id)?.name ?? 'Unknown',
      category: categories.find(c=>c.id===t.category_id)?.name ?? 'Unknown',
      subcategory: t.subcategory_id ? categories.find(c=>c.id===t.subcategory_id)?.name : '',
      tags: t.tags.join(";"),
      description: t.description ?? "",
      is_debt_payment: t.is_debt_payment ? 'Yes' : 'No',
      is_investment: t.is_investment ? 'Yes' : 'No'
    }));
    
    exportCSV(`expense_report_${from}_to_${to}.csv`, exportData);
    setExportSuccess(`Exported ${exportData.length} transactions successfully!`);
    setTimeout(() => setExportSuccess(""), 3000);
  }
  
  function exportSummary() {
    if (!canExport) return;
    
    const summaryData = [
      { metric: 'Total Income', amount: totals.income, currency: settings.baseCurrency },
      { metric: 'Total Expenses', amount: totals.expense, currency: settings.baseCurrency },
      { metric: 'Net Savings', amount: totals.savings, currency: settings.baseCurrency },
      { metric: 'Savings Rate', amount: totals.savingsPct, currency: '%' },
      { metric: 'Transaction Count', amount: filteredTransactions.length, currency: 'transactions' },
      { metric: 'Days in Period', amount: daysDiff, currency: 'days' },
      ...Object.entries(categoryTotals).map(([cat, data]) => ({
        metric: `${cat} (Expenses)`,
        amount: data.expense,
        currency: settings.baseCurrency
      }))
    ];
    
    exportCSV(`financial_summary_${from}_to_${to}.csv`, summaryData);
    setExportSuccess('Summary exported successfully!');
    setTimeout(() => setExportSuccess(""), 3000);
  }
  return (
    <PageLayout icon={AssessmentIcon} title="Reports" subtitle="Export and print reports">
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Export & Print:</strong> Generate CSV reports for specific date ranges or print clean summaries. 
          Perfect for tax preparation, expense tracking, and financial analysis.
        </Typography>
      </Alert>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {/* Date Range Selection */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Report Configuration</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
                <TextField 
                  type="date" 
                  label="From Date" 
                  value={from} 
                  onChange={e=>setFrom(e.target.value)} 
                  InputLabelProps={{ shrink: true }}
                  error={!isValidRange}
                  helperText={!isValidRange ? "From date must be before to date" : ""}
                />
                <TextField 
                  type="date" 
                  label="To Date" 
                  value={to} 
                  onChange={e=>setTo(e.target.value)} 
                  InputLabelProps={{ shrink: true }}
                  error={!isValidRange}
                />
              </Stack>
              
              {isValidRange && (
                <Box sx={{ mb: 2 }}>
                  <Chip label={`${daysDiff} days`} size="small" sx={{ mr: 1 }} />
                  <Chip label={`${filteredTransactions.length} transactions`} size="small" />
                </Box>
              )}
              
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button 
                  variant="contained" 
                  onClick={doExport}
                  disabled={!canExport || filteredTransactions.length === 0}
                >
                  Export Transactions
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={exportSummary}
                  disabled={!canExport}
                >
                  Export Summary
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={()=>window.print()}
                  disabled={!canExport}
                >
                  Print Report
                </Button>
              </Stack>
              
              {exportSuccess && (
                <Alert severity="success" sx={{ mt: 2 }}>{exportSuccess}</Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Financial Summary */}
        {isValidRange && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Financial Summary</Typography>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Income:</Typography>
                    <Typography color="success.main" fontWeight="bold">
                      {formatCurrency(totals.income, settings.baseCurrency)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Total Expenses:</Typography>
                    <Typography color="error.main" fontWeight="bold">
                      {formatCurrency(totals.expense, settings.baseCurrency)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Net Savings:</Typography>
                    <Typography color={totals.savings >= 0 ? "success.main" : "error.main"} fontWeight="bold">
                      {formatCurrency(totals.savings, settings.baseCurrency)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography>Savings Rate:</Typography>
                    <Typography fontWeight="bold">
                      {totals.savingsPct.toFixed(1)}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
        
        {/* Category Breakdown */}
        {isValidRange && Object.keys(categoryTotals).length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Category Breakdown</Typography>
                <Stack spacing={1} sx={{ maxHeight: 300, overflow: 'auto' }}>
                  {Object.entries(categoryTotals)
                    .sort(([,a], [,b]) => (b.expense + b.income) - (a.expense + a.income))
                    .map(([category, data]) => (
                    <Box key={category} display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2">{category}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {data.count} transactions
                        </Typography>
                      </Box>
                      <Box textAlign="right">
                        {data.income > 0 && (
                          <Typography variant="body2" color="success.main">
                            +{formatCurrency(data.income, settings.baseCurrency)}
                          </Typography>
                        )}
                        {data.expense > 0 && (
                          <Typography variant="body2" color="error.main">
                            -{formatCurrency(data.expense, settings.baseCurrency)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </PageLayout>
  );
}

// Print styles
const printStyles = `
@media print {
  .no-print { display: none !important; }
  body { font-size: 12px; }
  .print-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
  .print-summary { margin-bottom: 20px; }
}
`;

// Add print styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = printStyles;
  document.head.appendChild(style);
}
