"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
} from "@mui/material";
import { useAppStore } from "../lib/store";
import { Debt, DebtType } from "../lib/types";

interface DebtFormProps {
  open: boolean;
  onClose: () => void;
  debt?: Debt;
}

const debtTypes: { value: DebtType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "personal_loan", label: "Personal Loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "student_loan", label: "Student Loan" },
  { value: "car_loan", label: "Car Loan" },
  { value: "business_loan", label: "Business Loan" },
  { value: "other", label: "Other" },
];

export default function DebtForm({ open, onClose, debt }: DebtFormProps) {
  const { addDebt, updateDebt, accounts } = useAppStore();

  const [formData, setFormData] = useState({
    name: debt?.name || "",
    debt_type: debt?.debt_type || ("credit_card" as DebtType),
    original_amount: debt?.original_amount || 0,
    current_balance: debt?.current_balance || 0,
    interest_rate: debt?.interest_rate || 0,
    minimum_payment: debt?.minimum_payment || 0,
    due_date: debt?.due_date || 1,
    account_id: debt?.account_id || "",
    target_payoff_date: debt?.target_payoff_date || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (debt) {
      await updateDebt({ ...debt, ...formData });
    } else {
      await addDebt({ ...formData, is_active: true });
    }

    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{debt ? "Edit Debt" : "Add New Debt"}</DialogTitle>

        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField label="Debt Name" value={formData.name} onChange={handleChange("name")} fullWidth required />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Debt Type"
                value={formData.debt_type}
                onChange={handleChange("debt_type")}
                fullWidth
                required
              >
                {debtTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Original Amount"
                type="number"
                value={formData.original_amount}
                onChange={handleChange("original_amount")}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Balance"
                type="number"
                value={formData.current_balance}
                onChange={handleChange("current_balance")}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Interest Rate (%)"
                type="number"
                value={formData.interest_rate}
                onChange={handleChange("interest_rate")}
                fullWidth
                required
                inputProps={{ min: 0, max: 100, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Minimum Payment"
                type="number"
                value={formData.minimum_payment}
                onChange={handleChange("minimum_payment")}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Due Date (Day of Month)"
                type="number"
                value={formData.due_date}
                onChange={handleChange("due_date")}
                fullWidth
                required
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Account (Optional)"
                value={formData.account_id}
                onChange={handleChange("account_id")}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Target Payoff Date (Optional)"
                type="date"
                value={formData.target_payoff_date}
                onChange={handleChange("target_payoff_date")}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {debt ? "Update" : "Add"} Debt
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
