"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, Slide } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore, uid } from "@lib/store";
import { Account, AccountType, CurrencyCode } from "@lib/types";
import { CURRENCIES, ACCOUNT_TYPES } from "@lib/constants";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function AccountForm() {
  const { addAccount } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AccountType>("bank");
  const [currency, setCurrency] = React.useState<CurrencyCode>("THB");
  const [balance, setBalance] = React.useState("0");

  function submit() {
    if (!name.trim()) return;
    const account: Account = {
      id: uid("acc"),
      name: name.trim(),
      type,
      currency,
      opening_balance: Number(balance)
    };
    addAccount(account);
    setName("");
    setType("bank");
    setCurrency("THB");
    setBalance("0");
    setOpen(false);
  }

  return (
    <>
      <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AddIcon />}>Add Account</Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>New Account</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Account Name" value={name} onChange={e => setName(e.target.value)} />
            <TextField select label="Type" value={type} onChange={e => setType(e.target.value as AccountType)}>
              {ACCOUNT_TYPES.map(t => (
                <MenuItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Currency" value={currency} onChange={e => setCurrency(e.target.value as CurrencyCode)}>
              {CURRENCIES.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <TextField label="Opening Balance" type="number" value={balance} onChange={e => setBalance(e.target.value)} />
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
