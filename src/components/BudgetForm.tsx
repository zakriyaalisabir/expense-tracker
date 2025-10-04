"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Slide } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore, uid } from "@lib/store";
import { Budget } from "@lib/types";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function BudgetForm() {
  const { addBudget } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(new Date().toISOString().slice(0, 7));
  const [total, setTotal] = React.useState("0");

  function submit() {
    const budget: Budget = {
      id: uid("bud"),
      month,
      total: Number(total)
    };
    addBudget(budget);
    setTotal("0");
    setOpen(false);
  }

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AddIcon />}>Add Budget</Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>New Budget</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Month" type="month" value={month} onChange={e => setMonth(e.target.value)} />
            <TextField label="Total Budget" type="number" value={total} onChange={e => setTotal(e.target.value)} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={submit}>Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
