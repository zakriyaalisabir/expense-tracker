"use client";
import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Grid } from "@mui/material";
import { useAppStore } from "../lib/store";
import { Investment, InvestmentType, CurrencyCode } from "../lib/types";
import { SUPPORTED_CURRENCIES } from "../lib/currency";

interface InvestmentFormProps {
  open: boolean;
  onClose: () => void;
  investment?: Investment;
}

const investmentTypes: { value: InvestmentType; label: string }[] = [
  { value: "stock", label: "Stock" },
  { value: "bond", label: "Bond" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "mutual_fund", label: "Mutual Fund" },
  { value: "etf", label: "ETF" },
  { value: "real_estate", label: "Real Estate" },
  { value: "commodity", label: "Commodity" },
  { value: "other", label: "Other" }
];

export default function InvestmentForm({ open, onClose, investment }: InvestmentFormProps) {
  const { addInvestment, updateInvestment, accounts, settings } = useAppStore();
  
  const [formData, setFormData] = useState({
    symbol: investment?.symbol || "",
    name: investment?.name || "",
    investment_type: investment?.investment_type || "stock" as InvestmentType,
    quantity: investment?.quantity || 0,
    purchase_price: investment?.purchase_price || 0,
    current_price: investment?.current_price || 0,
    purchase_date: investment?.purchase_date || new Date().toISOString().split('T')[0],
    account_id: investment?.account_id || "",
    currency: investment?.currency || settings.baseCurrency
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (investment) {
      await updateInvestment({ ...investment, ...formData });
    } else {
      await addInvestment(formData);
    }
    
    onClose();
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const currencies = Object.keys(SUPPORTED_CURRENCIES) as CurrencyCode[];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {investment ? "Edit Investment" : "Add New Investment"}
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Symbol"
                value={formData.symbol}
                onChange={handleChange("symbol")}
                fullWidth
                required
                placeholder="e.g., AAPL, BTC, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Investment Name"
                value={formData.name}
                onChange={handleChange("name")}
                fullWidth
                required
                placeholder="e.g., Apple Inc., Bitcoin"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Investment Type"
                value={formData.investment_type}
                onChange={handleChange("investment_type")}
                fullWidth
                required
              >
                {investmentTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Currency"
                value={formData.currency}
                onChange={handleChange("currency")}
                fullWidth
                required
              >
                {currencies.map((currency) => (
                  <MenuItem key={currency} value={currency}>
                    {currency} - {SUPPORTED_CURRENCIES[currency].name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange("quantity")}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.000001 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Price"
                type="number"
                value={formData.purchase_price}
                onChange={handleChange("purchase_price")}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Price (Optional)"
                type="number"
                value={formData.current_price}
                onChange={handleChange("current_price")}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Purchase Date"
                type="date"
                value={formData.purchase_date}
                onChange={handleChange("purchase_date")}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
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
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {investment ? "Update" : "Add"} Investment
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}