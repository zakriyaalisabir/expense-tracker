"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { useAppStore } from "@lib/store";
import { toBase, FX } from "@lib/currency";
import { Transaction } from "@lib/types";

export default function TransactionForm(){
  const { accounts, categories, addTransaction, settings } = useAppStore();
  const [open,setOpen] = React.useState(false);
  const [type,setType] = React.useState<"income"|"expense"|"savings">("expense");
  const [form,setForm] = React.useState<any>({
    date: new Date().toISOString().slice(0,16),
    amount: 0, currency: settings.baseCurrency, account_id: accounts[0]?.id ?? "",
    category_id: categories.find(c=>c.type==="expense")?.id ?? "", subcategory_id: "", description: "", tags: ""
  });
  React.useEffect(()=>{
    if (!accounts.length || !categories.length) return;
    setForm((f:any)=>({...f, account_id: accounts[0].id, category_id: categories.find(c=>c.type==="expense")?.id}));
  },[accounts.length, categories.length]);

  function submit(){
    const fx_rate = FX[form.currency];
    const base_amount = toBase(Number(form.amount), form.currency, settings.baseCurrency);
    const t: Transaction = {
      id: `t_${Math.random().toString(36).slice(2,10)}`,
      date: new Date(form.date).toISOString(),
      type, amount: Number(form.amount), currency: form.currency,
      account_id: form.account_id, category_id: form.category_id,
      subcategory_id: form.subcategory_id || undefined,
      tags: form.tags ? form.tags.split(",").map((s:string)=>s.trim()).filter(Boolean):[],
      description: form.description, fx_rate, base_amount
    };
    addTransaction(t);
    setOpen(false);
  }

  return (<>
    <Button variant="contained" onClick={()=>setOpen(true)}>Add Transaction</Button>
    <Dialog open={open} onClose={()=>setOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>New Transaction</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ToggleButtonGroup exclusive value={type} onChange={(_,v)=>v&&setType(v)}>
            <ToggleButton value="income">Income</ToggleButton>
            <ToggleButton value="expense">Expense</ToggleButton>
            <ToggleButton value="savings">Savings</ToggleButton>
          </ToggleButtonGroup>
          <TextField label="Date & Time" type="datetime-local" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          <TextField label="Amount" type="number" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})}/>
          <TextField select label="Currency" value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})}>
            {["THB","USD","EUR","JPY"].map(c=>(<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </TextField>
          <TextField select label="Account" value={form.account_id} onChange={e=>setForm({...form, account_id:e.target.value})}>
            {useAppStore.getState().accounts.map(a=>(<MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>))}
          </TextField>
          <TextField select label="Category" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value, subcategory_id:""})}>
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
        <Button onClick={()=>setOpen(false)}>Cancel</Button>
        <Button variant="contained" onClick={submit}>Save</Button>
      </DialogActions>
    </Dialog> 
  </>);
}
