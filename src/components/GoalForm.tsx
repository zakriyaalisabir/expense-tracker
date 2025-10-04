"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, Slide } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore, uid } from "@lib/store";
import { Goal } from "@lib/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function GoalForm() {
  const { accounts, addGoal } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [targetAmount, setTargetAmount] = React.useState("0");
  const [targetDate, setTargetDate] = React.useState(new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 10));
  const [monthlyContribution, setMonthlyContribution] = React.useState("0");
  const [accountId, setAccountId] = React.useState(accounts[0]?.id || "");

  React.useEffect(() => {
    if (accounts.length && !accountId) setAccountId(accounts[0].id);
  }, [accounts, accountId]);

  function submit() {
    if (!name.trim()) return;
    const goal: Goal = {
      id: uid("goal"),
      name: name.trim(),
      target_amount: Number(targetAmount),
      target_date: new Date(targetDate).toISOString(),
      monthly_contribution: Number(monthlyContribution),
      source_account_id: accountId,
      progress_cached: 0
    };
    addGoal(goal);
    setName("");
    setTargetAmount("0");
    setTargetDate(new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 10));
    setMonthlyContribution("0");
    setAccountId(accounts[0]?.id || "");
    setOpen(false);
  }

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AddIcon />}>Add Goal</Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>New Goal</DialogTitle>
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!name.trim()}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
