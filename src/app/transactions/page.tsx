"use client";
import * as React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow, Card, CardContent, TableContainer, Paper, Chip, CircularProgress, Box, TablePagination, IconButton, Tooltip, Alert, Typography, Divider, TextField, FormControl, InputLabel, Select, MenuItem, Stack, TableSortLabel, Snackbar, FormControlLabel, Checkbox, Popover, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import TransactionForm from "@components/TransactionForm";
import { useAppStore } from "@lib/store";
import { LOADING_DELAY } from "@lib/constants";
import PageLayout from "@components/PageLayout";

const TagsCell = React.memo(({ tags }: { tags: string[] }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  if (tags.length <= 1) {
    return <>{tags.map((tag: string) => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}</>;
  }
  
  return (
    <Box>
      <Chip label={tags[0]} size="small" sx={{ mr: 0.5 }} />
      {!expanded && (
        <Chip 
          label={`+${tags.length - 1}`} 
          size="small" 
          variant="outlined" 
          onClick={() => setExpanded(true)}
          sx={{ cursor: 'pointer' }}
        />
      )}
      {expanded && (
        <>
          {tags.slice(1).map((tag: string) => <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />)}
          <IconButton size="small" onClick={() => setExpanded(false)}>
            <ExpandLessIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
});
TagsCell.displayName = "TagsCell";

const DescriptionCell = React.memo(({ description }: { description: string }) => {
  const [expanded, setExpanded] = React.useState(false);
  
  if (!description || description.length <= 10) {
    return <>{description}</>;
  }
  
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {expanded ? description : `${description.slice(0, 10)}...`}
      <IconButton size="small" onClick={() => setExpanded(!expanded)}>
        {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
      </IconButton>
    </Box>
  );
});
DescriptionCell.displayName = "DescriptionCell";

const TransactionRow = React.memo(({ t, accountName, categoryName, onEdit, onDelete, visibleColumns }: any) => {
  const typeColor = t.type === "income" ? "success" : t.type === "savings" ? "info" : "error";
  const typeIcon = t.type === "income" ? <TrendingUpIcon fontSize="small" /> : t.type === "savings" ? <SavingsIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
  return (
  <TableRow hover>
    <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
    <TableCell><Chip icon={typeIcon} label="" color={typeColor} size="small" /></TableCell>
    <TableCell align="right"><strong>{t.amount.toFixed(2)}</strong></TableCell>
    {visibleColumns.currency && <TableCell><Chip label={t.currency} size="small" variant="outlined" /></TableCell>}
    {visibleColumns.account && <TableCell>{accountName}</TableCell>}
    {visibleColumns.category && <TableCell>{categoryName}</TableCell>}
    {visibleColumns.tags && <TableCell><TagsCell tags={t.tags} /></TableCell>}
    {visibleColumns.description && <TableCell><DescriptionCell description={t.description ?? ""} /></TableCell>}
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
  const [paginatedTransactions, setPaginatedTransactions] = React.useState<any[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [error, setError] = React.useState("");
  const [columnAnchor, setColumnAnchor] = React.useState<HTMLButtonElement | null>(null);
  const [visibleColumns, setVisibleColumns] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('transactions-visible-columns');
      return saved ? JSON.parse(saved) : {
        currency: true,
        account: true,
        category: true,
        tags: true,
        description: true
      };
    }
    return {
      currency: true,
      account: true,
      category: true,
      tags: true,
      description: true
    };
  });
  const [showFilters, setShowFilters] = React.useState(false);
  
  const fetchTransactions = React.useCallback(async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          limit: rowsPerPage,
          search,
          type: typeFilter,
          account: accountFilter,
          category: categoryFilter,
          tag: tagFilter,
          sortBy,
          sortOrder,
          transactions,
          accounts,
          categories
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setPaginatedTransactions(data.transactions);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, typeFilter, accountFilter, categoryFilter, tagFilter, sortBy, sortOrder, transactions, accounts, categories]);

  React.useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

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
      subtitle={`${totalCount} total transactions`}
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
            <Stack direction="row" alignItems="center" spacing={2}>
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
              <Button
                startIcon={showFilters ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setShowFilters(!showFilters)}
                variant="outlined"
                size="small"
              >
                Filters
              </Button>
            </Stack>
            
            {showFilters && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                <Button
                  startIcon={<ViewColumnIcon />}
                  onClick={(e) => setColumnAnchor(e.currentTarget)}
                  variant="outlined"
                  size="small"
                >
                  Columns
                </Button>
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
            )}
            
            <Popover
              open={Boolean(columnAnchor)}
              anchorEl={columnAnchor}
              onClose={() => setColumnAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <Box sx={{ p: 2, minWidth: 200 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Show Columns</Typography>
                {Object.entries(visibleColumns).map(([key, value]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Checkbox
                        checked={value as boolean}
                        onChange={(e) => {
                          const newColumns = { ...visibleColumns, [key]: e.target.checked };
                          setVisibleColumns(newColumns);
                          localStorage.setItem('transactions-visible-columns', JSON.stringify(newColumns));
                        }}
                        size="small"
                      />
                    }
                    label={key.charAt(0).toUpperCase() + key.slice(1)}
                    sx={{ display: 'block' }}
                  />
                ))}
              </Box>
            </Popover>
          </Stack>
        </CardContent>
      </Card>
      <Card><CardContent>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ tableLayout: 'auto' }}>
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
              {visibleColumns.currency && (
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "currency"}
                    direction={sortBy === "currency" ? sortOrder : "asc"}
                    onClick={() => handleSort("currency")}
                  >
                    <strong>Currency</strong>
                  </TableSortLabel>
                </TableCell>
              )}
              {visibleColumns.account && (
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "account"}
                    direction={sortBy === "account" ? sortOrder : "asc"}
                    onClick={() => handleSort("account")}
                  >
                    <strong>Account</strong>
                  </TableSortLabel>
                </TableCell>
              )}
              {visibleColumns.category && (
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "category"}
                    direction={sortBy === "category" ? sortOrder : "asc"}
                    onClick={() => handleSort("category")}
                  >
                    <strong>Category</strong>
                  </TableSortLabel>
                </TableCell>
              )}
              {visibleColumns.tags && <TableCell><strong>Tags</strong></TableCell>}
              {visibleColumns.description && (
                <TableCell>
                  <TableSortLabel
                    active={sortBy === "description"}
                    direction={sortBy === "description" ? sortOrder : "asc"}
                    onClick={() => handleSort("description")}
                  >
                    <strong>Description</strong>
                  </TableSortLabel>
                </TableCell>
              )}
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
                visibleColumns={visibleColumns}
              />
            ))}
          </TableBody>
        </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25, 50, 100]}
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} of ${count} ${count !== transactions.length ? `(filtered from ${transactions.length})` : ''}`
          }
        />
      </CardContent></Card>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        message={error}
      />
    </PageLayout>
  );
}
