"use client";
import * as React from "react";
import { Card, CardContent, Typography, Stack, IconButton, Box, Chip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Account } from "@lib/types";
import { useAppStore } from "@lib/store";
import AccountForm from "./AccountForm";

export default function AccountCard({ account }: { account: Account }) {
  const { transactions, deleteAccount } = useAppStore();
  const [editAccount, setEditAccount] = React.useState<Account | undefined>();

  const delta = transactions
    .filter(t => t.account_id === account.id)
    .reduce((acc, t) => acc + (t.type === "income" ? t.base_amount : -t.base_amount), 0);
  const balance = account.opening_balance + delta;

  const handleDelete = async () => {
    if (confirm(`Delete account "${account.name}"?`)) {
      await deleteAccount(account.id);
    }
  };

  return (
    <>
      <Card elevation={3}>
        <CardContent>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">{account.name}</Typography>
              <Box display="flex" gap={1}>
                <IconButton size="small" onClick={() => setEditAccount(account)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" color="error" onClick={handleDelete}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {account.type.toUpperCase()} • {account.currency}
              </Typography>
              <Chip 
                label={new Intl.NumberFormat().format(balance)} 
                color={balance >= 0 ? "success" : "error"}
                size="medium"
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>
      {editAccount && <AccountForm editAccount={editAccount} onClose={() => setEditAccount(undefined)} />}
    </>
  );
}