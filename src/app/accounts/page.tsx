"use client";
import * as React from "react";
import { Card, CardContent, Grid, TextField, MenuItem, Button, Stack, Typography } from "@mui/material";
import { useAppStore } from "@lib/store";

export default function AccountsPage(){
  const { addAccount } = useAppStore();
  const [form,setForm] = React.useState({ name:"", type:"cash", currency:"THB", opening_balance:0 });
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Card><CardContent>
          <Typography variant="h6">Add Account</Typography>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            <TextField select label="Type" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
              {["cash","bank","credit","ewallet"].map(t=>(<MenuItem key={t} value={t}>{t}</MenuItem>))}
            </TextField>
            <TextField select label="Currency" value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})}>
              {["THB","USD","EUR","JPY"].map(c=>(<MenuItem key={c} value={c}>{c}</MenuItem>))}
            </TextField>
            <TextField label="Opening Balance" type="number" value={form.opening_balance} onChange={e=>setForm({...form, opening_balance:Number(e.target.value)})}/>
            <Button variant="contained" onClick={()=>addAccount({ id:`acc_${Math.random().toString(36).slice(2,10)}`, ...form })}>Save</Button>
          </Stack>
        </CardContent></Card>
      </Grid>
    </Grid>
  );
}
