"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, Slide } from "@mui/material";
import FlagIcon from "@mui/icons-material/Flag";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore } from "@lib/store";
import { Goal } from "@lib/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function GoalForm({ editGoal, onClose }: { editGoal?: Goal; onClose?: () => void } = {}) {
  const { accounts, addGoal, updateGoal } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("0");
  const [targetDate, setTargetDate] = React.useState(new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 10));
  const [monthlyContribution, setMonthlyContribution] = React.useState("0");
  const [accountId, setAccountId] = React.useState(accounts[0]?.id || "");

  React.useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  React.useEffect(() => {
    if (editGoal) {
      setName(editGoal.name);
      setTargetAmount(editGoal.target_amount.toString());
      setTargetDate(new Date(editGoal.target_date).toISOString().slice(0, 10));
      setMonthlyContribution(editGoal.monthly_contribution.toString());
      setAccountId(editGoal.source_account_id);
      setOpen(true);
    }
  }, [editGoal]);

  async function submit() {
    if (!name.trim()) return;
    const { userId } = useAppStore.getState();
    if (!userId) {
      console.error('No user ID found. Please ensure you are authenticated.');
      return;
    }
    const data = {
      name: name.trim(),
      target_amount: Number(targetAmount),
      target_date: new Date(targetDate).toISOString(),
      monthly_contribution: Number(monthlyContribution),
      source_account_id: accountId,
      progress_cached: editGoal?.progress_cached ?? 0
    };
    try {
      if (editGoal) {
        await updateGoal({ ...data, id: editGoal.id, user_id: editGoal.user_id });
      } else {
        await addGoal(data);
        setName("");
        setTargetAmount("0");
        setTargetDate(new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 10));
        setMonthlyContribution("0");
        setAccountId(accounts[0]?.id || "");
      }
      setOpen(false);
      onClose?.();
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  }

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} startIcon={<FlagIcon />} fullWidth sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Add Goal</Button>
      <Button variant="contained" onClick={() => setOpen(true)} fullWidth sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1 }}>
        <FlagIcon fontSize="small" />
      </Button>
      <Dialog open={open} onClose={() => { setOpen(false); onClose?.(); }} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>{editGoal ? "Edit Goal" : "New Goal"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Goal Name" value={name} onChange={e => setName(e.target.value)} />
            <TextField label="Target Amount" type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
            <TextField label="Target Date" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
            <TextField label="Monthly Contribution" type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} />
            <TextField select label="Source Account" value={accountId} onChange={e => setAccountId(e.target.value)}>
              {accounts.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); onClose?.(); }}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!name.trim()}>{editGoal ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
