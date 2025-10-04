"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Stack, Typography } from "@mui/material";
import TransactionForm from "@components/TransactionForm";
import { useAppStore } from "@lib/store";

const TransactionRow = React.memo(({ t, accountName, categoryName }: any) => (
  <TableRow>
    <TableCell>{new Date(t.date).toLocaleString()}</TableCell>
    <TableCell>{t.type}</TableCell>
    <TableCell align="right">{t.amount}</TableCell>
    <TableCell>{t.currency}</TableCell>
    <TableCell>{accountName}</TableCell>
    <TableCell>{categoryName}</TableCell>
    <TableCell>{t.tags.join(", ")}</TableCell>
    <TableCell>{t.description ?? ""}</TableCell>
  </TableRow>
));
TransactionRow.displayName = "TransactionRow";

export default function TransactionsPage(){
  const transactions = useAppStore(s => s.transactions);
  const categories = useAppStore(s => s.categories);
  const accounts = useAppStore(s => s.accounts);
  
  const accountMap = React.useMemo(() => 
    Object.fromEntries(accounts.map(a => [a.id, a.name])), [accounts]
  );
  const categoryMap = React.useMemo(() => 
    Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]
  );
  return (
    <Stack spacing={2}>
      <TransactionForm/>
      <Card><CardContent>
        <Typography variant="h6" sx={{ mb: 1 }}>Transactions</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Curr</TableCell>
              <TableCell>Account</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell>Description</TableCell>
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
      </CardContent></Card>
    </Stack>
  );
}
