"use client";
import * as React from "react";
import { Card, CardContent, List, ListItem, ListItemText, Chip, Stack, Typography, Pagination, Box, IconButton, Tooltip } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AccountForm from "@components/AccountForm";
import { useAppStore } from "@lib/store";

export default function AccountList(){
  const { accounts, transactions, deleteAccount } = useAppStore();
  const [page, setPage] = React.useState(1);
  const [editAccount, setEditAccount] = React.useState<any>(null);
  const itemsPerPage = 5;

  const balances = accounts.map(a => {
    const delta = transactions
      .filter(t => t.account_id === a.id)
      .reduce((acc, t) => acc + (t.type === "income" ? t.base_amount : -t.base_amount), 0);
    const balance = a.opening_balance + delta;
    return { ...a, balance };
  });

  const totalPages = Math.ceil(balances.length / itemsPerPage);
  const paginatedBalances = balances.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <>
      <AccountForm editAccount={editAccount} onClose={() => setEditAccount(null)} />
      <Card>
        <CardContent>
          <Typography variant="h6" mb={1}>Accounts ({balances.length})</Typography>
          <List>
            {paginatedBalances.map(a => (
              <ListItem key={a.id} divider>
                <ListItemText primary={a.name} secondary={`${a.type.toUpperCase()} • ${a.currency}`} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip label={new Intl.NumberFormat().format(a.balance)} color={a.balance >= 0 ? "success" : "error"} />
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => setEditAccount(a)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" onClick={() => deleteAccount(a.id)} color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </ListItem>
            ))}
          </List>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={2}>
              <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} color="primary" />
            </Box>
          )}
        </CardContent>
      </Card>
    </>
  );
}
