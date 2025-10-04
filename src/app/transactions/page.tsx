"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Stack, Typography, TableContainer, Paper, Chip, Fade, CircularProgress, Box } from "@mui/material";
import TransactionForm from "@components/TransactionForm";
import { useAppStore } from "@lib/store";

const TransactionRow = React.memo(({ t, accountName, categoryName }: any) => {
  const typeColor = t.type === "income" ? "success" : t.type === "savings" ? "info" : "error";
  return (
  <TableRow hover>
    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
    <TableCell><Chip label={t.type} color={typeColor} size="small" /></TableCell>
    <TableCell align="right"><strong>{t.amount.toFixed(2)}</strong></TableCell>
    <TableCell><Chip label={t.currency} size="small" variant="outlined" /></TableCell>
    <TableCell>{accountName}</TableCell>
    <TableCell>{categoryName}</TableCell>
    <TableCell>{t.tags.map((tag: string) => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}</TableCell>
    <TableCell>{t.description ?? ""}</TableCell>
  </TableRow>
  );
});
TransactionRow.displayName = "TransactionRow";

export default function TransactionsPage(){
  const transactions = useAppStore(s => s.transactions);
  const categories = useAppStore(s => s.categories);
  const accounts = useAppStore(s => s.accounts);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const accountMap = React.useMemo(() => 
    Object.fromEntries(accounts.map(a => [a.id, a.name])), [accounts]
  );
  const categoryMap = React.useMemo(() => 
    Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in timeout={500}>
    <Stack spacing={2}>
      <TransactionForm/>
      <Card><CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>Transactions ({transactions.length})</Typography>
        <TableContainer component={Paper} variant="outlined">
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell align="right"><strong>Amount</strong></TableCell>
              <TableCell><strong>Currency</strong></TableCell>
              <TableCell><strong>Account</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map(t => (
              <TransactionRow 
                key={t.id} 
                t={t} 
                accountName={accountMap[t.account_id] ?? t.account_id}
                categoryName={categoryMap[t.category_id] ?? t.category_id}
              />
            ))}
          </TableBody>
        </Table>
        </TableContainer>
      </CardContent></Card>
    </Stack>
    </Fade>
  );
}
