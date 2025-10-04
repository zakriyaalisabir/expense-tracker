"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, Stack, Typography, TableContainer, Paper, Chip, Fade, CircularProgress, Box, TablePagination, IconButton, Tooltip, Avatar, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TransactionForm from "@components/TransactionForm";
import { useAppStore } from "@lib/store";
import { FADE_TIMEOUT, LOADING_DELAY } from "@lib/constants";

const TransactionRow = React.memo(({ t, accountName, categoryName, onEdit, onDelete }: any) => {
  const typeColor = t.type === "income" ? "success" : t.type === "savings" ? "info" : "error";
  return (
  <TableRow hover>
    <TableCell>{new Date(t.date).toLocaleString()}</TableCell>
    <TableCell><Chip label={t.type} color={typeColor} size="small" /></TableCell>
    <TableCell align="right"><strong>{t.amount.toFixed(2)}</strong></TableCell>
    <TableCell><Chip label={t.currency} size="small" variant="outlined" /></TableCell>
    <TableCell>{accountName}</TableCell>
    <TableCell>{categoryName}</TableCell>
    <TableCell>{t.tags.map((tag: string) => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}</TableCell>
    <TableCell>{t.description ?? ""}</TableCell>
    <TableCell>
      <Box display="flex" gap={0.5}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(t)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => onDelete(t.id)} color="error">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>
  </TableRow>
  );
});
TransactionRow.displayName = "TransactionRow";

export default function TransactionsPage(){
  const transactions = useAppStore(s => s.transactions);
  const categories = useAppStore(s => s.categories);
  const accounts = useAppStore(s => s.accounts);
  const deleteTransaction = useAppStore(s => s.deleteTransaction);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [editTransaction, setEditTransaction] = React.useState<any>(null);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), LOADING_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const accountMap = React.useMemo(() => 
    Object.fromEntries(accounts.map(a => [a.id, a.name])), [accounts]
  );
  const categoryMap = React.useMemo(() => 
    Object.fromEntries(categories.map(c => [c.id, c.name])), [categories]
  );

  const sortedTransactions = React.useMemo(() => 
    [...transactions].sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf()),
    [transactions]
  );

  const paginatedTransactions = React.useMemo(() =>
    sortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [sortedTransactions, page, rowsPerPage]
  );

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
            <ReceiptIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">Transactions</Typography>
            <Typography variant="body2" color="text.secondary">{transactions.length} total transactions</Typography>
          </Box>
        </Box>
        <TransactionForm editTransaction={editTransaction} onClose={() => setEditTransaction(null)} />
      </Box>
      <Divider />
      <Card><CardContent>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
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
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedTransactions.map(t => (
              <TransactionRow 
                key={t.id} 
                t={t} 
                accountName={accountMap[t.account_id] ?? t.account_id}
                categoryName={categoryMap[t.category_id] ?? t.category_id}
                onEdit={setEditTransaction}
                onDelete={deleteTransaction}
              />
            ))}
          </TableBody>
        </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={transactions.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
        />
      </CardContent></Card>
    </Stack>
    </Fade>
  );
}
