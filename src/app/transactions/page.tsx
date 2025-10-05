"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, TableContainer, Paper, Chip, CircularProgress, Box, TablePagination, IconButton, Tooltip, Alert, Typography, Divider, TextField, FormControl, InputLabel, Select, MenuItem, Stack, TableSortLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import TransactionForm from "@components/TransactionForm";
import { useAppStore } from "@lib/store";
import { LOADING_DELAY } from "@lib/constants";
import PageLayout from "@components/PageLayout";

const TransactionRow = React.memo(({ t, accountName, categoryName, onEdit, onDelete }: any) => {
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
  const [search, setSearch] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState("");
  const [accountFilter, setAccountFilter] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("");
  const [tagFilter, setTagFilter] = React.useState("");
  const [sortBy, setSortBy] = React.useState<"date" | "amount" | "type" | "currency" | "account" | "category" | "description">("date");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  
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

  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    transactions.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [transactions]);

  const filteredAndSortedTransactions = React.useMemo(() => {
    let filtered = transactions.filter(t => {
      const matchesSearch = search === "" || 
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())) ||
        accountMap[t.account_id]?.toLowerCase().includes(search.toLowerCase()) ||
        categoryMap[t.category_id]?.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === "" || t.type === typeFilter;
      const matchesAccount = accountFilter === "" || t.account_id === accountFilter;
      const matchesCategory = categoryFilter === "" || t.category_id === categoryFilter;
      const matchesTag = tagFilter === "" || t.tags.includes(tagFilter);
      
      return matchesSearch && matchesType && matchesAccount && matchesCategory && matchesTag;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === "date") {
        comparison = new Date(a.date).valueOf() - new Date(b.date).valueOf();
      } else if (sortBy === "amount") {
        comparison = a.amount - b.amount;
      } else if (sortBy === "type") {
        comparison = a.type.localeCompare(b.type);
      } else if (sortBy === "currency") {
        comparison = a.currency.localeCompare(b.currency);
      } else if (sortBy === "account") {
        comparison = (accountMap[a.account_id] || "").localeCompare(accountMap[b.account_id] || "");
      } else if (sortBy === "category") {
        comparison = (categoryMap[a.category_id] || "").localeCompare(categoryMap[b.category_id] || "");
      } else if (sortBy === "description") {
        comparison = (a.description || "").localeCompare(b.description || "");
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [transactions, search, typeFilter, accountFilter, categoryFilter, tagFilter, sortBy, sortOrder, accountMap, categoryMap]);

  const paginatedTransactions = React.useMemo(() =>
    filteredAndSortedTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredAndSortedTransactions, page, rowsPerPage]
  );

  const handleSort = (column: "date" | "amount" | "type" | "currency" | "account" | "category" | "description") => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  React.useEffect(() => {
    setPage(0);
  }, [search, typeFilter, accountFilter, categoryFilter, tagFilter]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout
      icon={ReceiptIcon}
      title="Transactions"
      subtitle={`${transactions.length} total transactions`}
      actions={<TransactionForm editTransaction={editTransaction} onClose={() => setEditTransaction(null)} />}
    >
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Transaction Management:</strong> Search, filter, and sort your transactions. 
          Click column headers to sort. Use filters to narrow results.
        </Typography>
      </Alert>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              size="small"
            />
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} label="Type">
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="income">Income</MenuItem>
                  <MenuItem value="expense">Expense</MenuItem>
                  <MenuItem value="savings">Savings</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Account</InputLabel>
                <Select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} label="Account">
                  <MenuItem value="">All Accounts</MenuItem>
                  {accounts.map(acc => (
                    <MenuItem key={acc.id} value={acc.id}>{acc.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Category</InputLabel>
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} label="Category">
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Tag</InputLabel>
                <Select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} label="Tag">
                  <MenuItem value="">All Tags</MenuItem>
                  {allTags.map(tag => (
                    <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
      <Card><CardContent>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "date"}
                  direction={sortBy === "date" ? sortOrder : "asc"}
                  onClick={() => handleSort("date")}
                >
                  <strong>Date</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "type"}
                  direction={sortBy === "type" ? sortOrder : "asc"}
                  onClick={() => handleSort("type")}
                >
                  <strong>Type</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">
                <TableSortLabel
                  active={sortBy === "amount"}
                  direction={sortBy === "amount" ? sortOrder : "asc"}
                  onClick={() => handleSort("amount")}
                >
                  <strong>Amount</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "currency"}
                  direction={sortBy === "currency" ? sortOrder : "asc"}
                  onClick={() => handleSort("currency")}
                >
                  <strong>Currency</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "account"}
                  direction={sortBy === "account" ? sortOrder : "asc"}
                  onClick={() => handleSort("account")}
                >
                  <strong>Account</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "category"}
                  direction={sortBy === "category" ? sortOrder : "asc"}
                  onClick={() => handleSort("category")}
                >
                  <strong>Category</strong>
                </TableSortLabel>
              </TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "description"}
                  direction={sortBy === "description" ? sortOrder : "asc"}
                  onClick={() => handleSort("description")}
                >
                  <strong>Description</strong>
                </TableSortLabel>
              </TableCell>
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
          count={filteredAndSortedTransactions.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count} ${count === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length !== transactions.length ? `(filtered from ${transactions.length})` : ''}`
          }
        />
      </CardContent></Card>
    </PageLayout>
  );
}
