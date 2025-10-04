"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Stack, Typography } from "@mui/material";
import TransactionForm from "@components/TransactionForm";
import { useAppStore } from "@lib/store";

export default function TransactionsPage(){
  const { transactions, categories, accounts } = useAppStore();
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
              <TableRow key={t.id}>
                <TableCell>{new Date(t.date).toLocaleString()}</TableCell>
                <TableCell>{t.type}</TableCell>
                <TableCell align="right">{t.amount}</TableCell>
                <TableCell>{t.currency}</TableCell>
                <TableCell>{accounts.find(a=>a.id===t.account_id)?.name ?? t.account_id}</TableCell>
                <TableCell>{categories.find(c=>c.id===t.category_id)?.name ?? t.category_id}</TableCell>
                <TableCell>{t.tags.join(", ")}</TableCell>
                <TableCell>{t.description ?? ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </Stack>
  );
}
