"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, ToggleButtonGroup, ToggleButton, Slide, Box } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore } from "@lib/store";
import { toBase, FX } from "@lib/currency";
import { Transaction } from "@lib/types";
import { CURRENCIES, TRANSACTION_TYPES } from "@lib/constants";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = { editTransaction?: any; onClose?: () => void };

export default function TransactionForm({ editTransaction, onClose }: Props = {}){
  const { accounts, categories, addTransaction, updateTransaction, settings } = useAppStore();
  const allCurrencies = [...CURRENCIES, ...(settings.customCurrencies || [])];
  const [open,setOpen] = React.useState(false);
  const [type,setType] = React.useState<"income"|"expense"|"savings">("expense");
  const [form,setForm] = React.useState<any>({
    date: new Date().toISOString().slice(0,16),
    amount: 0, currency: accounts[0]?.currency || settings.baseCurrency, account_id: accounts[0]?.id ?? "",
    category_id: categories.find(c=>c.type==="expense")?.id ?? "", subcategory_id: "", description: "", tags: ""
  });
  React.useEffect(()=>{
    if (!accounts.length || !categories.length) return;
    setForm((f:any)=>({...f, account_id: accounts[0].id, currency: accounts[0].currency, category_id: categories.find(c=>c.type==="expense")?.id}));
  },[accounts.length, categories.length]);

  React.useEffect(() => {
    setForm((f:any) => ({...f, category_id: categories.find(c=>c.type===type)?.id ?? "", subcategory_id: ""}));
  }, [type, categories]);

  React.useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setForm({
        date: new Date(editTransaction.date).toISOString().slice(0,16),
        amount: editTransaction.amount,
        currency: editTransaction.currency,
        account_id: editTransaction.account_id,
        category_id: editTransaction.category_id,
        subcategory_id: editTransaction.subcategory_id || "",
        description: editTransaction.description || "",
        tags: editTransaction.tags.join(", ")
      });
      setOpen(true);
    }
  }, [editTransaction]);

  async function submit(){
    const fx_rate = FX[form.currency as keyof typeof FX] || 1;
    const base_amount = toBase(Number(form.amount), form.currency, settings.baseCurrency);
    const data = {
      date: new Date(form.date).toISOString(),
      type, amount: Number(form.amount), currency: form.currency,
      account_id: form.account_id, category_id: form.category_id,
      subcategory_id: form.subcategory_id || undefined,
      tags: form.tags ? form.tags.split(",").map((s:string)=>s.trim()).filter(Boolean):[],
      description: form.description, fx_rate, base_amount
    };
    if (editTransaction) {
      await updateTransaction({ ...data, id: editTransaction.id, user_id: editTransaction.user_id });
    } else {
      await addTransaction(data);
      setForm({
        date: new Date().toISOString().slice(0,16),
        amount: 0, currency: accounts[0]?.currency || settings.baseCurrency, account_id: accounts[0]?.id ?? "",
        category_id: categories.find(c=>c.type===type)?.id ?? "", subcategory_id: "", description: "", tags: ""
      });
    }
    setOpen(false);
    onClose?.();
  }

  return (<>
    <Button variant="contained" onClick={()=>setOpen(true)} startIcon={<ReceiptIcon />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Add Transaction</Button>
    <Button variant="contained" onClick={()=>setOpen(true)} sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1 }}>
      <ReceiptIcon fontSize="small" />
    </Button>
    <Dialog open={open} onClose={()=>{setOpen(false); onClose?.();}} fullWidth maxWidth="sm" TransitionComponent={Transition}>
      <DialogTitle>{editTransaction ? "Edit" : "New"} Transaction</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ToggleButtonGroup exclusive value={type} onChange={(_,v)=>v&&setType(v)}>
            {TRANSACTION_TYPES.map(t => (
              <ToggleButton key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</ToggleButton>
            ))}
          </ToggleButtonGroup>
          <TextField label="Date & Time" type="datetime-local" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          <TextField label="Amount" type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/>
          <TextField select label="Account" value={form.account_id} onChange={e=>{
            const selectedAccount = accounts.find(a => a.id === e.target.value);
            setForm({...form, account_id:e.target.value, currency: selectedAccount?.currency || form.currency});
          }}>
            {accounts.map(a=>(<MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>))}
          </TextField>
          <TextField select label="Currency" value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})}>
            {allCurrencies.map(c=>(<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </TextField>
          <TextField select label="Category" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value, subcategory_id:""})} required>
            {useAppStore.getState().categories.filter(c=>c.type===type && !c.parent_id).map(c=>(<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
          </TextField>
          {form.category_id && useAppStore.getState().categories.some(c=>c.parent_id===form.category_id) && (
            <TextField select label="Subcategory" value={form.subcategory_id} onChange={e=>setForm({...form, subcategory_id:e.target.value})}>
              <MenuItem value="">None</MenuItem>
              {useAppStore.getState().categories.filter(c=>c.parent_id===form.category_id).map(c=>(<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
            </TextField>
          )}
          <TextField label="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})}/>
          <TextField label="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>{setOpen(false); onClose?.();}}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!form.category_id}>{editTransaction ? "Update" : "Save"}</Button>
      </DialogActions>
    </Dialog> 
  </>);
}
