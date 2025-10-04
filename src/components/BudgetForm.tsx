"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Slide, FormControl, InputLabel, Select, MenuItem, Box, IconButton, Typography } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore, uid } from "@lib/store";
import { Budget } from "@lib/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BudgetForm({ editBudget }: { editBudget?: Budget }) {
  const { addBudget, updateBudget, categories } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [total, setTotal] = React.useState("0");
  const [byCategory, setByCategory] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    if (editBudget) {
      setMonth(editBudget.month);
      setTotal(String(editBudget.total || 0));
      setByCategory(editBudget.byCategory || {});
      setOpen(true);
    }
  }, [editBudget]);

  function submit() {
    const budget: Budget = {
      id: editBudget?.id || uid("bud"),
      user_id: editBudget?.user_id || "demo",
      month,
      total: Number(total),
      byCategory
    };
    if (editBudget) updateBudget(budget);
    else addBudget(budget);
    
    if (!editBudget) {
      setMonth(new Date().toISOString().slice(0, 7));
      setTotal("0");
      setByCategory({});
    }
    setOpen(false);
  }

  const expenseCategories = categories.filter(c => c.type === "expense" && !c.parent_id);
  const addCategoryBudget = () => {
    const available = expenseCategories.find(c => !byCategory[c.id]);
    if (available) setByCategory({ ...byCategory, [available.id]: 0 });
  };

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AccountBalanceIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Add Budget</Button>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1 }}>
        <AccountBalanceIcon fontSize="small" />
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>{editBudget ? "Edit Budget" : "New Budget"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Month" type="month" value={month} onChange={e => setMonth(e.target.value)} fullWidth />
            <TextField label="Total Budget" type="number" value={total} onChange={e => setTotal(e.target.value)} fullWidth />
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Category Budgets (Optional)</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addCategoryBudget}>Add Category</Button>
              </Box>
              <Stack spacing={1.5}>
                {Object.keys(byCategory).map(catId => {
                  const cat = categories.find(c => c.id === catId);
                  return (
                    <Box key={catId} display="flex" gap={1} alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={catId}
                          label="Category"
                          onChange={e => {
                            const newBy = { ...byCategory };
                            const val = newBy[catId];
                            delete newBy[catId];
                            newBy[e.target.value] = val;
                            setByCategory(newBy);
                          }}
                        >
                          {expenseCategories.map(c => (
                            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        type="number"
                        label="Amount"
                        value={byCategory[catId]}
                        onChange={e => setByCategory({ ...byCategory, [catId]: Number(e.target.value) })}
                        sx={{ flex: 1 }}
                      />
                      <IconButton size="small" color="error" onClick={() => {
                        const newBy = { ...byCategory };
                        delete newBy[catId];
                        setByCategory(newBy);
                      }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>{editBudget ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
