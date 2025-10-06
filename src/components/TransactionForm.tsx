"use client";
import * as React from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Slide,
  Snackbar,
  Alert,
  Box,
  FormControlLabel,
  Checkbox,
  Grid,
} from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore } from "@lib/store";
import { toBase, FX } from "@lib/currency";
import { useAuth } from "@lib/hooks/useAuth";

import { TRANSACTION_TYPES } from "@lib/constants";
import { CurrencyCode } from "@lib/types";
import { getAllCurrencies } from "@lib/utils/currency";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  editTransaction?: {
    id: string;
    user_id: string;
    type: "income" | "expense" | "savings";
    date: string;
    amount: number;
    currency: CurrencyCode;
    account_id: string;
    category_id: string;
    subcategory_id?: string;
    description?: string;
    tags: string[];
  };
  onClose?: () => void;
};

export default function TransactionForm({ editTransaction, onClose }: Props = {}) {
  const { addTransaction, updateTransaction, accounts, settings, categories, debts, investments } = useAppStore();
  const { userId } = useAuth();
  const allCurrencies = getAllCurrencies(settings);
  const [open, setOpen] = React.useState(false);
  const [type, setType] = React.useState<"income" | "expense" | "savings">("expense");
  const [form, setForm] = React.useState({
    date: new Date().toISOString().slice(0, 16),
    amount: 0,
    currency: accounts[0]?.currency || settings.baseCurrency,
    account_id: accounts[0]?.id ?? "",
    category_id: categories.find((c) => c.type === "expense")?.id ?? "",
    subcategory_id: "",
    description: "",
    tags: "",
    debt_id: "",
    investment_id: "",
    is_debt_payment: false,
    is_investment: false,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "error" as "error" | "success",
  });
  React.useEffect(() => {
    if (!accounts.length || !categories.length) return;
    const defaultAccount = accounts[0];
    setForm((f) => ({
      ...f,
      account_id: defaultAccount.id,
      currency: defaultAccount.currency,
      category_id: categories.find((c) => c.type === "expense")?.id || "",
    }));
  }, [accounts, categories]);

  React.useEffect(() => {
    if (categories.length === 0) return;
    setForm((f) => ({ ...f, category_id: categories.find((c) => c.type === type)?.id || "", subcategory_id: "" }));
  }, [type, categories]);

  React.useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type as "income" | "expense" | "savings");
      setForm({
        date: new Date(editTransaction.date).toISOString().slice(0, 16),
        amount: editTransaction.amount,
        currency: editTransaction.currency,
        account_id: editTransaction.account_id,
        category_id: editTransaction.category_id,
        subcategory_id: editTransaction.subcategory_id || "",
        description: editTransaction.description || "",
        tags: editTransaction.tags.join(", "),
      });
      setOpen(true);
    }
  }, [editTransaction]);

  // Validation function
  function validateForm() {
    const newErrors: Record<string, string> = {};

    // Amount validation
    if (!form.amount || form.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (form.amount > 1000000) {
      newErrors.amount = "Amount cannot exceed 1,000,000";
    }

    // Date validation
    const transactionDate = new Date(form.date);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());

    if (transactionDate < oneYearAgo) {
      newErrors.date = "Date cannot be more than 1 year ago";
    }
    if (transactionDate > oneYearFromNow) {
      newErrors.date = "Date cannot be more than 1 year in the future";
    }

    // Required fields
    if (!form.account_id) {
      newErrors.account_id = "Account is required";
    }
    if (!form.category_id) {
      newErrors.category_id = "Category is required";
    }

    // Description length
    if (form.description && form.description.length > 500) {
      newErrors.description = "Description cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function submit() {
    if (!validateForm()) {
      const errorMessages = Object.values(errors);
      if (errorMessages.length > 0) {
        setSnackbar({ open: true, message: errorMessages[0], severity: "error" });
      }
      return;
    }

    const fx_rate = FX[form.currency as keyof typeof FX] || 1;
    const base_amount = toBase(Number(form.amount), form.currency, settings.baseCurrency);
    const data = {
      date: new Date(form.date).toISOString(),
      type,
      amount: Number(form.amount),
      currency: form.currency,
      account_id: form.account_id,
      category_id: form.category_id,
      subcategory_id: form.subcategory_id || undefined,
      tags: form.tags
        ? form.tags
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      description: form.description,
      debt_id: form.debt_id || undefined,
      investment_id: form.investment_id || undefined,
      is_debt_payment: form.is_debt_payment,
      is_investment: form.is_investment,
    };
    if (editTransaction) {
      await updateTransaction({
        ...data,
        id: editTransaction.id,
        user_id: editTransaction.user_id,
        fx_rate,
        base_amount,
      });
    } else {
      if (!userId) return;
      const transactionData = {
        ...data,
        fx_rate,
        base_amount,
      };
      await addTransaction(transactionData);
      const defaultAccount = accounts[0];
      setForm({
        date: new Date().toISOString().slice(0, 16),
        amount: 0,
        currency: defaultAccount?.currency || settings.baseCurrency,
        account_id: defaultAccount?.id ?? "",
        category_id: categories.find((c) => c.type === type)?.id ?? "",
        subcategory_id: "",
        description: "",
        tags: "",
        debt_id: "",
        investment_id: "",
        is_debt_payment: false,
        is_investment: false,
      });
    }
    setOpen(false);
    onClose?.();
  }

  return (
    <>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        startIcon={<ReceiptIcon />}
        fullWidth
        sx={{ display: { xs: "none", sm: "inline-flex" } }}
      >
        Add Transaction
      </Button>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        fullWidth
        sx={{ display: { xs: "inline-flex", sm: "none" }, minWidth: "auto", px: 1 }}
      >
        <ReceiptIcon fontSize="small" />
      </Button>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          onClose?.();
        }}
        fullWidth
        maxWidth="sm"
        TransitionComponent={Transition}
      >
        <DialogTitle>{editTransaction ? "Edit" : "New"} Transaction</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <ToggleButtonGroup exclusive value={type} onChange={(_, v) => v && setType(v)}>
              {TRANSACTION_TYPES.map((t) => {
                const icon =
                  t === "income" ? (
                    <TrendingUpIcon fontSize="small" />
                  ) : t === "savings" ? (
                    <SavingsIcon fontSize="small" />
                  ) : (
                    <TrendingDownIcon fontSize="small" />
                  );
                return (
                  <ToggleButton key={t} value={t}>
                    {icon}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
            <TextField
              label="Date & Time"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              error={!!errors.date}
              helperText={errors.date || "When did this transaction occur?"}
            />
            <Box>
              <TextField
                label="Amount"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                error={!!errors.amount}
                helperText={errors.amount || "Enter the transaction amount"}
                inputProps={{ min: 0.01, max: 1000000, step: 0.01 }}
                required
                fullWidth
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {type === "expense" && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.is_debt_payment}
                        onChange={(e) => setForm({ ...form, is_debt_payment: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Debt Payment"
                  />
                )}
                {type === "savings" && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.is_investment}
                        onChange={(e) => setForm({ ...form, is_investment: e.target.checked })}
                        size="small"
                      />
                    }
                    label="Investment"
                  />
                )}
              </Stack>
            </Box>
            <TextField
              select
              label="Account"
              value={form.account_id}
              onChange={(e) => {
                const selectedAccount = accounts.find((a) => a.id === e.target.value);
                setForm({
                  ...form,
                  account_id: e.target.value,
                  currency: selectedAccount?.currency || form.currency,
                });
              }}
              error={!!errors.account_id}
              helperText={errors.account_id || "Which account is this transaction from?"}
              required
            >
              {accounts.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Currency"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as CurrencyCode })}
              helperText="Currency for this transaction"
            >
              {allCurrencies.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Category"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: "" })}
              error={!!errors.category_id}
              helperText={errors.category_id || "What type of transaction is this?"}
              required
            >
              {categories
                .filter((c) => c.type === type && !c.parent_id)
                .map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
            </TextField>
            {form.category_id && categories.some((c) => c.parent_id === form.category_id) && (
              <TextField
                select
                label="Subcategory"
                value={form.subcategory_id}
                onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                {categories
                  .filter((c) => c.parent_id === form.category_id)
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
              </TextField>
            )}
            <TextField
              label="Tags (comma separated)"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              helperText="Optional tags for categorizing (e.g., business, personal, urgent)"
              placeholder="business, travel, food"
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              error={!!errors.description}
              helperText={errors.description || "Optional description or notes"}
              multiline
              rows={2}
              inputProps={{ maxLength: 500 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              onClose?.();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={submit}
            disabled={!form.category_id || !form.account_id || !form.amount || form.amount <= 0}
          >
            {editTransaction ? "Update" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
