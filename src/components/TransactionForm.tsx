"use client";
import * as React from "react";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, MenuItem, ToggleButtonGroup, ToggleButton, Slide } from "@mui/material";
import ReceiptIcon from "@mui/icons-material/Receipt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";
import { TransitionProps } from "@mui/material/transitions";
import { useAppStore } from "@lib/store";
import { toBase, FX } from "@lib/currency";
import { useAuth } from "@lib/hooks/useAuth";

import { TRANSACTION_TYPES } from "@lib/constants";
import { CurrencyCode } from "@lib/types";
import { getAllCurrencies } from "@lib/utils/currency";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = { editTransaction?: { id: string; user_id: string; type: "income"|"expense"|"savings"; date: string; amount: number; currency: CurrencyCode; account_id: string; category_id: string; subcategory_id?: string; description?: string; tags: string[] }; onClose?: () => void };

export default function TransactionForm({ editTransaction, onClose }: Props = {}){
  const { addTransaction, updateTransaction, accounts, settings, categories, debts, investments } = useAppStore();
  const { userId } = useAuth();
  const allCurrencies = getAllCurrencies(settings);
  const [open,setOpen] = React.useState(false);
  const [type,setType] = React.useState<"income"|"expense"|"savings">("expense");
  const [form,setForm] = React.useState({
    date: new Date().toISOString().slice(0,16),
    amount: 0, currency: accounts[0]?.currency || settings.baseCurrency, account_id: accounts[0]?.id ?? "",
    category_id: categories.find(c=>c.type==="expense")?.id ?? "", subcategory_id: "", description: "", tags: "",
    debt_id: "", investment_id: "", is_debt_payment: false, is_investment: false
  });
  React.useEffect(()=>{
    if (!accounts.length || !categories.length) return;
    const defaultAccount = accounts[0];
    setForm((f)=>({...f, account_id: defaultAccount.id, currency: defaultAccount.currency, category_id: categories.find(c=>c.type==="expense")?.id || ""}));
  },[accounts, categories]);

  React.useEffect(() => {
    if (categories.length === 0) return;
    setForm((f) => ({...f, category_id: categories.find(c=>c.type===type)?.id || "", subcategory_id: ""}));
  }, [type, categories]);

  React.useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type as "income"|"expense"|"savings");
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
      description: form.description,
      debt_id: form.debt_id || undefined,
      investment_id: form.investment_id || undefined,
      is_debt_payment: form.is_debt_payment,
      is_investment: form.is_investment
    };
    if (editTransaction) {
      await updateTransaction({ ...data, id: editTransaction.id, user_id: editTransaction.user_id, fx_rate, base_amount });
    } else {
      if (!userId) return;
      const transactionData = {
        ...data,
        fx_rate,
        base_amount
      };
      await addTransaction(transactionData);
      const defaultAccount = accounts[0];
      setForm({
        date: new Date().toISOString().slice(0,16),
        amount: 0, currency: defaultAccount?.currency || settings.baseCurrency, account_id: defaultAccount?.id ?? "",
        category_id: categories.find(c=>c.type===type)?.id ?? "", subcategory_id: "", description: "", tags: ""
      });
    }
    setOpen(false);
    onClose?.();
  }

  return (<>
    <Button variant="contained" onClick={()=>setOpen(true)} startIcon={<ReceiptIcon />} fullWidth sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>Add Transaction</Button>
    <Button variant="contained" onClick={()=>setOpen(true)} fullWidth sx={{ display: { xs: 'inline-flex', sm: 'none' }, minWidth: 'auto', px: 1 }}>
      <ReceiptIcon fontSize="small" />
    </Button>
    <Dialog open={open} onClose={()=>{setOpen(false); onClose?.();}} fullWidth maxWidth="sm" TransitionComponent={Transition}>
      <DialogTitle>{editTransaction ? "Edit" : "New"} Transaction</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ToggleButtonGroup exclusive value={type} onChange={(_,v)=>v&&setType(v)}>
            {TRANSACTION_TYPES.map(t => {
              const icon = t === "income" ? <TrendingUpIcon fontSize="small" /> : t === "savings" ? <SavingsIcon fontSize="small" /> : <TrendingDownIcon fontSize="small" />;
              return (
                <ToggleButton key={t} value={t}>
                  {icon}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </ToggleButton>
              );
            })}
          </ToggleButtonGroup>
          <TextField label="Date & Time" type="datetime-local" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
          <TextField label="Amount" type="number" value={form.amount} onChange={e=>setForm({...form, amount:Number(e.target.value)})}/>
          <TextField select label="Account" value={form.account_id} onChange={e=>{
            const selectedAccount = accounts.find(a => a.id === e.target.value);
            setForm({...form, account_id:e.target.value, currency: selectedAccount?.currency || form.currency});
          }}>
            {accounts.map(a=>(<MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>))}
          </TextField>
          <TextField select label="Currency" value={form.currency} onChange={e=>setForm({...form, currency:e.target.value as CurrencyCode})}>
            {allCurrencies.map(c=>(<MenuItem key={c} value={c}>{c}</MenuItem>))}
          </TextField>
          <TextField select label="Category" value={form.category_id} onChange={e=>setForm({...form, category_id:e.target.value, subcategory_id:""})} required>
            {categories.filter(c=>c.type===type && !c.parent_id).map(c=>(<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
          </TextField>
          {form.category_id && categories.some(c=>c.parent_id===form.category_id) && (
            <TextField select label="Subcategory" value={form.subcategory_id} onChange={e=>setForm({...form, subcategory_id:e.target.value})}>
              <MenuItem value="">None</MenuItem>
              {categories.filter(c=>c.parent_id===form.category_id).map(c=>(<MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>))}
            </TextField>
          )}
          <TextField label="Tags (comma separated)" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})}/>
          <TextField label="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})}/>
          
          {type === "expense" && (
            <TextField select label="Debt Payment (Optional)" value={form.debt_id} onChange={e=>{
              const hasDebt = e.target.value !== "";
              setForm({...form, debt_id:e.target.value, is_debt_payment: hasDebt});
            }}>
              <MenuItem value="">Not a debt payment</MenuItem>
              {debts.filter(d => d.is_active).map(d=>(<MenuItem key={d.id} value={d.id}>Pay: {d.name}</MenuItem>))}
            </TextField>
          )}
          
          {type === "savings" && (
            <TextField select label="Investment (Optional)" value={form.investment_id} onChange={e=>{
              const hasInvestment = e.target.value !== "";
              setForm({...form, investment_id:e.target.value, is_investment: hasInvestment});
            }}>
              <MenuItem value="">Not an investment</MenuItem>
              {investments.filter(i => i.is_active).map(i=>(<MenuItem key={i.id} value={i.id}>Buy: {i.name}</MenuItem>))}
            </TextField>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={()=>{setOpen(false); onClose?.();}}>Cancel</Button>
        <Button variant="contained" onClick={submit} disabled={!form.category_id}>{editTransaction ? "Update" : "Save"}</Button>
      </DialogActions>
    </Dialog> 
  </>);
}
