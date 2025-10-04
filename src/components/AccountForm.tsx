"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, Slide, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
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

type Props = { editAccount?: Account; onClose?: () => void };

export default function AccountForm({ editAccount, onClose }: Props = {}) {
  const { addAccount, updateAccount } = useAppStore();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<AccountType>("bank");
  const [currency, setCurrency] = React.useState<CurrencyCode>("THB");
  const [balance, setBalance] = React.useState("0");

  React.useEffect(() => {
    if (editAccount) {
      setName(editAccount.name);
      setType(editAccount.type);
      setCurrency(editAccount.currency);
      setBalance(editAccount.opening_balance.toString());
      setOpen(true);
    }
  }, [editAccount]);

  function submit() {
    if (!name.trim()) return;
    const account: Account = {
      id: editAccount?.id || uid("acc"),
      user_id: editAccount?.user_id || "demo",
      name: name.trim(),
      type,
      currency,
      opening_balance: Number(balance)
    };
    editAccount ? updateAccount(account) : addAccount(account);
    if (!editAccount) {
      setName("");
      setType("bank");
      setCurrency("THB");
      setBalance("0");
    }
    setOpen(false);
    onClose?.();
  }

  return (
    <>
      {!editAccount && <Button variant="contained" onClick={() => setOpen(true)} startIcon={<AddIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Add Account</Button>}
      {!editAccount && <Button variant="contained" onClick={() => setOpen(true)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1 }}><AddIcon fontSize="small" /></Button>}
      {editAccount && <IconButton size="small" onClick={() => setOpen(true)}><EditIcon fontSize="small" /></IconButton>}
      <Dialog open={open} onClose={() => { setOpen(false); onClose?.(); }} fullWidth maxWidth="sm" TransitionComponent={Transition}>
        <DialogTitle>{editAccount ? "Edit" : "New"} Account</DialogTitle>
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
          <Button onClick={() => { setOpen(false); onClose?.(); }}>Cancel</Button>
          <Button variant="contained" onClick={submit} disabled={!name.trim()}>{editAccount ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
